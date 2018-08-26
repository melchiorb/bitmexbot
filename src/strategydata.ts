export type Dictionary = { [key: string]: any }

export type Series = number[]

export type Ticks = {
  timestamp: string[],
  open: Series
  high: Series
  low: Series
  close: Series
  volume: Series
  indicators?: Dictionary
}

export type Position = {
  account: number
  symbol: string
  commission?: number
  leverage?: number
  openingTimestamp?: string
  openingQty?: number
  openingCost?: number
  currentQty: number
  currentCost: number
  realisedCost?: number
  unrealisedCost?: number
  isOpen?: boolean
  markPrice?: number
  markValue?: number
  riskValue?: number
  initMargin?: number
  maintMargin?: number
  unrealisedPnl?: number
  unrealisedPnlPcnt?: number
  unrealisedRoePcnt?: number
  simpleQty?: number
  simpleCost?: number
  simpleValue?: number
  simplePnl?: number
  simplePnlPcnt?: number
  avgCostPrice?: number
  avgEntryPrice?: number
  breakEvenPrice?: number
  marginCallPrice?: number
  liquidationPrice?: number
  bankruptPrice?: number
  timestamp?: string
  lastPrice?: number
  lastValue?: number
}

export type Side = "Buy" | "Sell"
export type OrdType = "Market" | "Limit" | "Stop" | "StopLimit" | "MarketIfTouched" | "LimitIfTouched"
export type ExecInst = "ParticipateDoNotInitiate" | "AllOrNone" | "MarkPrice" | "IndexPrice" | "LastPrice" | "Close" | "ReduceOnly" | "Fixed"
export type PegPriceType = "LastPeg" | "MidPricePeg" | "MarketPeg" | "PrimaryPeg" | "TrailingStopPeg"
export type TimeInForce = "Day" | "GoodTillCancel" | "ImmediateOrCancel" | "FillOrKill"

export type Order = {
  orderID: string
  clOrdID?: string
  account?: number
  symbol?: string
  side?: Side
  simpleOrderQty?: number
  orderQty?: number
  price?: number
  stopPx?: number
  pegOffsetValue?: number
  pegPriceType?: PegPriceType
  ordType?: OrdType
  timeInForce?: TimeInForce
  execInst?: ExecInst
  ordStatus?: string
  triggered?: string
  ordRejReason?: string
  text?: string
  transactTime?: string
  timestamp?: string
}

export type CreateOrder = {
  symbol: string
  side?: Side
  simpleOrderQty?: number
  orderQty?: number
  price?: number
  stopPx?: number
  clOrdID?: string
  pegOffsetValue?: number
  pegPriceType?: PegPriceType
  ordType: OrdType
  timeInForce?: TimeInForce
  execInst?: ExecInst
  text?: string
}

export type OrderSettings = Partial<CreateOrder>
