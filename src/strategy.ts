import * as D from "./strategydata";

export interface StrategyAPI {
  order(strategy: Strategy, settings: D.CreateOrder): Promise<any>
  market(strategy: Strategy, orderQty: number, settings?: D.OrderSettings): Promise<any>
  limit(strategy: Strategy, orderQty: number, price: number, settings?: D.OrderSettings): Promise<any>
  close(strategy: Strategy, ordType: D.OrdType, settings?: D.OrderSettings): Promise<any>
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
  public config: Config
  public indicators: IndicatorConfigSet

  constructor() { this.init() }

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
}
