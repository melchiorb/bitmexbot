import * as D from "./strategydata";

export interface StrategyAPI {
  order(strategy: Strategy, settings: D.CreateOrder): any
  market(strategy: Strategy, orderQty: number, settings?: D.OrderSettings): any
  limit(strategy: Strategy, orderQty: number, price: number, settings?: D.OrderSettings): any
  close(strategy: Strategy, ordType: D.OrdType, settings?: D.OrderSettings): any
}

export type OHLCV = "open" | "high" | "low" | "close" | "volume"

export type IndicatorConfig = {
  type: string,
  source?: OHLCV,
  settings?: D.Dictionary
}

export type IndicatorConfigSet = { [key: string]: IndicatorConfig }

type Config = {
  name: string,
  symbol: string,
  binsize: string,
  length: number,
  leverage: number,
  active: boolean
}

export abstract class Strategy {
  private _API: StrategyAPI
  protected options: D.Dictionary

  public config: Config
  public indicators: IndicatorConfigSet

  constructor(opt?: D.Dictionary) {
    this.options = opt
    this.init()
  }

  set API(api: StrategyAPI) { this._API = api }

  public abstract init(): void
  public abstract run(data: D.Ticks, position: D.Position): void

  protected order(settings: D.CreateOrder): void {
    if (this.config.active) {
      this._API.order(this, settings)
    }
  }

  protected market(orderQty: number, settings?: D.OrderSettings): void {
    if (this.config.active) {
      this._API.market(this, orderQty, settings)
    }
  }

  protected limit(orderQty: number, price: number, settings?: D.OrderSettings): void {
    if (this.config.active) {
      this._API.limit(this, orderQty, price, settings)
    }
  }

  protected close(ordType: D.OrdType = "Market", settings?: D.OrderSettings): void {
    if (this.config.active) {
      this._API.close(this, ordType, settings)
    }
  }

  protected crossover(seriesA: D.Series, seriesB: D.Series, index = 0): boolean {
    return seriesA[index] > seriesB[index] && seriesA[index+1] <= seriesB[index+1]
  }

  protected crossunder(seriesA: D.Series, seriesB: D.Series, index = 0): boolean {
    return seriesA[index] < seriesB[index] && seriesA[index+1] >= seriesB[index+1]
  }

  protected cross(seriesA: D.Series, seriesB: D.Series, index = 0): boolean {
    return this.crossover(seriesA, seriesB, index) || this.crossunder(seriesA, seriesB, index)
  }

  protected change(series: D.Series, length = 1): number {
    return series[0] - series[length]
  }

  protected falling(series: D.Series, length = 1): boolean {
    const range = series.slice(1, length)
    return series[0] < Math.min(...range)
  }

  protected rising(series: D.Series, length = 1): boolean {
    const range = series.slice(1, length)
    return series[0] > Math.min(...range)
  }

  protected highest(series: D.Series, length: number): number {
    const range = series.slice(0, length)
    return Math.max(...range)
  }

  protected lowest(series: D.Series, length: number): number {
    const range = series.slice(0, length)
    return Math.min(...range)
  }
}
