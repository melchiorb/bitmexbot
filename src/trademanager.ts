import * as S from "./strategy"
import * as SD from "./strategydata";
import * as TI from "technicalindicators"

export abstract class TradeManager<M> implements S.StrategyAPI {
  protected _strategies: S.Strategy[]

  public timeout = 1

  public constructor(protected _api: M) {
    this._strategies = []
  }

  public add(strategy: S.Strategy): void {
    strategy.API = this
    this._strategies.push(strategy)
  }

  public loop(): void {
    for (let strategy of this._strategies) {
      this.process(strategy)
    }

    setTimeout(this.loop, this.timeout * 60 * 1000)
  }

  public abstract async process(strategy: S.Strategy): Promise<any>

  public abstract async order(strategy: S.Strategy, settings: any): Promise<any>
  public abstract async market(strategy: S.Strategy, orderQty: number, settings?: any): Promise<any>
  public abstract async limit(strategy: S.Strategy, orderQty: number, price: number, settings?: any): Promise<any>
  public abstract async close(strategy: S.Strategy, ordType: string, settings?: any): Promise<any>

  protected abstract convertTradesForStrategy(data: any): SD.Ticks
  protected abstract convertPositionsForStrategy(data: any): SD.Position
  protected abstract convertOrderForStrategy(data: any): SD.Order
  protected abstract convertOrderFromStrategy(data: SD.CreateOrder): any

  protected processIndicators(data: SD.Ticks, indicators: S.IndicatorConfigSet): SD.Ticks {
    for (let n in indicators) {
      const src = indicators[n].source || "close"
      const settings = indicators[n].settings
      const basic = { period: settings.period, values: data[src], reversedInput: true }

      let result: any = null

      switch (indicators[n].type) {
        case "SMA":
          result = TI.sma(basic)
          break
        case "EMA":
          result = TI.ema(basic)
          break
        case "WMA":
          result = TI.wma(basic)
          break
        case "WEMA":
          result = TI.wema(basic)
          break

        case "MACD":
          result = TI.macd({
            values: data[src],
            fastPeriod: settings.fastPeriod,
            slowPeriod: settings.slowPeriod,
            signalPeriod: settings.signalPeriod,
            SimpleMAOscillator: settings.SimpleMAOscillator || true,
            SimpleMASignal: settings.SimpleMASignal || true,
            reversedInput: true
          })
          break

        case "RSI":
          result = TI.rsi(basic)
          break

        case "BollingerBands":
          result = TI.bollingerbands({
            values: data[src],
            period: settings.period,
            stdDev: settings.stdDev || 2,
            reversedInput: true
          })
          break

        case "Stochastic":
          result = TI.stochastic({
            low: data.low, high: data.high, close: data.close,
            period: settings.period,
            signalPeriod: settings.signalPeriod,
            reversedInput: true
          })
          break

        case "StochasticRSI":
          result = TI.stochasticrsi({
            values: data[src],
            rsiPeriod: settings.rsiPeriod,
            stochasticPeriod: settings.stochasticPeriod,
            kPeriod: settings.kPeriod,
            dPeriod: settings.dPeriod,
            reversedInput: true
          })
          break

        case "OBV":
          result = TI.obv({
            close: data.close, volume: data.volume,
            reversedInput: true
          })
          break

        case "VWAP":
          result = TI.vwap({
            high: data.high, low: data.low, close: data.close, volume: data.volume,
            reversedInput: true
          })
          break

        default:
          break
      }

      data.indicators[n] = result
    }

    return data
  }
}
