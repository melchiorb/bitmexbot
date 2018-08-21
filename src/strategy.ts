type Dictionary = { [key: string]: any }

export type Side = "Buy" | "Sell"
export type OrdType = "Market" | "Limit" | "Stop" | "StopLimit" | "MarketIfTouched" | "LimitIfTouched"
export type BinSize = "1m" | "5m" | "1h" | "1d"
export type ExecInst = "ParticipateDoNotInitiate" | "AllOrNone" | "MarkPrice" | "IndexPrice" | "LastPrice" | "Close" | "ReduceOnly" | "Fixed"
export type PegPriceType = "LastPeg" | "MidPricePeg" | "MarketPeg" | "PrimaryPeg" | "TrailingStopPeg"
export type TimeInForce = "Day" | "GoodTillCancel" | "ImmediateOrCancel" | "FillOrKill"
export type ContingencyType = "OneCancelsTheOther" | "OneTriggersTheOther" | "OneUpdatesTheOtherAbsolute" | "OneUpdatesTheOtherProportional"

export type Ticks = {
  open: number[],
  high: number[],
  low: number[],
  close: number[],
  volume: number[],
  indicators?: Dictionary
}

export type Position = {
  account: number,
  symbol: string,
  commission?: number,
  leverage?: number,

  openingTimestamp?: string,
  openingQty?: number,
  openingCost?: number,

  realisedCost?: number,
  unrealisedCost?: number,

  isOpen?: boolean,
  markPrice?: number,
  markValue?: number,
  riskValue?: number,

  initMargin?: number,
  maintMargin?: number,

  unrealisedPnl?: number,
  unrealisedPnlPcnt?: number,
  unrealisedRoePcnt?: number,
  simpleQty?: number,
  simpleCost?: number,
  simpleValue?: number,
  simplePnl?: number,
  simplePnlPcnt?: number,
  avgCostPrice?: number,
  avgEntryPrice?: number,
  breakEvenPrice?: number,
  marginCallPrice?: number,
  liquidationPrice?: number,
  bankruptPrice?: number,
  timestamp?: string,
  lastPrice?: number,
  lastValue?: number
}

export type Order = {
  orderID: string,
  clOrdID?: string,

  account?: number,
  symbol?: string,
  side?: string,
  simpleOrderQty?: number,
  orderQty?: number,
  price?: number,

  stopPx?: number,
  pegOffsetValue?: number,
  pegPriceType?: string,

  ordType?: string,
  timeInForce?: string,
  execInst?: string,

  ordStatus?: string,
  triggered?: string,

  ordRejReason?: string,

  text?: string,
  transactTime?: string,
  timestamp?: string
}  

export type CreateOrder = {
  symbol: string,
  side?: Side,
  simpleOrderQty?: number,
  orderQty?: number,
  price?: number,

  stopPx?: number,
  clOrdID?: string,

  pegOffsetValue?: number,
  pegPriceType?: PegPriceType,
  ordType: OrdType,
  timeInForce?: TimeInForce,
  execInst?: ExecInst,

  text?: string
}

export type OrderSettings = Partial<CreateOrder>

export type OHLCV = "open" | "high" | "low" | "close" | "volume"

export type IndicatorConfig = {
  type: string,
  source?: OHLCV,
  settings?: Dictionary
}

export type IndicatorConfigSet = { [key: string]: IndicatorConfig }

export interface StrategyAPI {
  order(strategy: Strategy, settings: CreateOrder): Promise<any>
  market(strategy: Strategy, orderQty: number, settings?: OrderSettings): Promise<any>
  limit(strategy: Strategy, orderQty: number, price: number, settings?: OrderSettings): Promise<any>
  close(strategy: Strategy, ordType: string, settings?: OrderSettings): Promise<any>
}

type StrategyConfig = {
  symbol: string,
  binsize: string,
  length: number,
  leverage: number,
  active: boolean
}

export abstract class Strategy {
  private _API: StrategyAPI
  public config: StrategyConfig
  public indicators: IndicatorConfigSet

  constructor() { this.init() }

  set API(api: StrategyAPI) { this._API = api }
  
  public abstract init(): void
  public abstract run(data: Ticks, position: Position): void

  protected order(settings: CreateOrder): void {
    if (this.config.active) {
      this._API.order(this, settings)
    }
  }

  protected market(orderQty: number, settings?: OrderSettings): void {
    if (this.config.active) {
      this._API.market(this, orderQty, settings)
    }
  }

  protected limit(orderQty: number, price: number, settings?: OrderSettings): void {
    if (this.config.active) {
      this._API.limit(this, orderQty, price, settings)
    }
  }

  protected close(ordType = "Market", settings?: OrderSettings): void {
    if (this.config.active) {
      this._API.close(this, ordType, settings)
    }
  }
}
