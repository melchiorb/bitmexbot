import { Ticks, Position, Dictionary, Series } from "./strategydata"
import * as D from "./strategydata";

export interface StrategyAPI {
  order(strategy: Strategy, settings: D.CreateOrder): any
  market(strategy: Strategy, orderQty: number, settings?: D.OrderSettings): any
  limit(strategy: Strategy, orderQty: number, price: number, settings?: D.OrderSettings): any
  close(strategy: Strategy, ordType: D.OrdType, settings?: D.OrderSettings): any
}

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

  public config: Config
  public output: any = {}

  constructor(protected options?: Dictionary<any>) {
    this.init()
  }

  set API(api: StrategyAPI) { this._API = api }

  public abstract init(): void
  public abstract run(data: Ticks, position: Position): void

  protected show(timestamp: any, values: any) {
    this.output[timestamp] = values
  }

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

  protected extract(ary: any[], keys: string[]): Dictionary<Series> {
    const result: Dictionary<Series> = {}

    for (let i = 0; i < ary.length; i++) {
      for (let k of keys) {
        if (!result[k]) result[k] = []

        result[k].push(ary[i][k])
      }
    }

    return result
  }

  protected crossover(seriesA: Series, seriesB: Series, index = 0): boolean {
    return seriesA[index] > seriesB[index] && seriesA[index+1] <= seriesB[index+1]
  }

  protected crossunder(seriesA: Series, seriesB: Series, index = 0): boolean {
    return seriesA[index] < seriesB[index] && seriesA[index+1] >= seriesB[index+1]
  }

  protected cross(seriesA: Series, seriesB: Series, index = 0): boolean {
    return this.crossover(seriesA, seriesB, index) || this.crossunder(seriesA, seriesB, index)
  }

  protected change(series: Series, length = 1): number {
    return series[0] - series[length]
  }

  protected falling(series: Series, length = 1): boolean {
    const range = series.slice(1, length)
    return series[0] < Math.min(...range)
  }

  protected rising(series: Series, length = 1): boolean {
    const range = series.slice(1, length)
    return series[0] > Math.min(...range)
  }

  protected highest(series: Series, length: number): number {
    const range = series.slice(0, length)
    return Math.max(...range)
  }

  protected lowest(series: Series, length: number): number {
    const range = series.slice(0, length)
    return Math.min(...range)
  }
}
