import {Strategy, StrategyAPI, Ticks, Position, Order, CreateOrder, IndicatorConfigSet} from "./strategy"
import * as TI from "technicalindicators"
import { MAInput } from "technicalindicators/declarations/moving_averages/SMA";
import { MACDInput } from "technicalindicators/declarations/moving_averages/MACD";
import { RSIInput } from "technicalindicators/declarations/oscillators/RSI";
import { BollingerBandsInput } from "technicalindicators/declarations/volatility/BollingerBands";

export abstract class TradeManager implements StrategyAPI {
  protected _strategies: Strategy[]
  public timeout = 60000

  public constructor() {
    this._strategies = []
  }

  public add(strategy: Strategy): void {
    strategy.API = this
    this._strategies.push(strategy)
  }

  public loop(): void {
    for (let strategy of this._strategies) {
      console.log(strategy.config.name)
      
      this.process(strategy)
    }

    setTimeout(() => this.loop(), this.timeout)
  }
  
  public abstract async process(strategy: Strategy): Promise<any>

  public abstract async order(strategy: Strategy, settings: any): Promise<any>
  public abstract async market(strategy: Strategy, orderQty: number, settings?: any): Promise<any>
  public abstract async limit(strategy: Strategy, orderQty: number, price: number, settings?: any): Promise<any>
  public abstract async close(strategy: Strategy, ordType: string, settings?: any): Promise<any>

  protected abstract convertTradesForStrategy(data: any): Ticks
  protected abstract convertPositionsForStrategy(data: any): Position
  protected abstract convertOrderForStrategy(data: any): Order
  protected abstract convertOrderFromStrategy(data: CreateOrder): any

  protected processIndicators(data: Ticks, indicators: IndicatorConfigSet): Ticks {
    for (let n in indicators) {
      const src = indicators[n].source || "close"
      const settings = indicators[n].settings
      const basic = Object.assign(indicators[n].settings, { values: data[src] })

      let result: any = null
      
      switch (indicators[n].type) {
        case "SMA":
          result = TI.sma(basic as MAInput)
          break
        case "EMA":
          result = TI.ema(basic as MAInput)
          break
        case "WMA":
          result = TI.wma(basic as MAInput)
          break
        case "WEMA":
          result = TI.wema(basic as MAInput)
          break
        case "MACD":
          result = TI.macd(basic as MACDInput)
          break
        case "RSI":
          result = TI.rsi(basic as RSIInput)
          break
        case "BollingerBands":
          result = TI.bollingerbands(basic as BollingerBandsInput)          
          break

        case "Stochastic":
          result = TI.stochastic({
            low: data.low, high: data.high, close: data.close,
            period: settings.period,
            signalPeriod: settings.signalPeriod
          })
          break
        
        case "StochasticRSI":
          result = TI.stochasticrsi({
            values: data[src],
            rsiPeriod: settings.rsiPeriod,
            stochasticPeriod: settings.stochasticPeriod,
            kPeriod: settings.kPeriod,
            dPeriod: settings.dPeriod
          })
        
        case "OBV":
          result = TI.obv({ close: data.close, volume: data.volume })
          break
        case "VWAP":
          result = TI.vwap({ high: data.high, low: data.low, close: data.close, volume: data.volume })
          break

        default:
          break
      }

      data.indicators[n] = result
    }

    return data
  }
}
