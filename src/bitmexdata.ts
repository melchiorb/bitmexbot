export namespace Req {
  export type Side = "Buy" | "Sell"
  export type OrdType = "Market" | "Limit" | "Stop" | "StopLimit" | "MarketIfTouched" | "LimitIfTouched"
  export type BinSize = "1m" | "5m" | "1h" | "1d"
  export type ExecInst = "ParticipateDoNotInitiate" | "AllOrNone" | "MarkPrice" | "IndexPrice" | "LastPrice" | "Close" | "ReduceOnly" | "Fixed"
  export type PegPriceType = "LastPeg" | "MidPricePeg" | "MarketPeg" | "PrimaryPeg" | "TrailingStopPeg"
  export type TimeInForce = "Day" | "GoodTillCancel" | "ImmediateOrCancel" | "FillOrKill"
  export type ContingencyType = "OneCancelsTheOther" | "OneTriggersTheOther" | "OneUpdatesTheOtherAbsolute" | "OneUpdatesTheOtherProportional"

  export type GetQuote = {
    symbol: string,
    filter?: string,
    count?: number,
    reverse?: boolean
  }

  export type CreateOrder = {
    symbol: string,
    side?: Side,
    simpleOrderQty?: number,
    orderQty?: number,
    price?: number,
    displayQty?: number,
    stopPx?: number,
    clOrdID?: string,
    clOrdLinkID?: string,
    pegOffsetValue?: number,
    pegPriceType?: PegPriceType,
    ordType: OrdType,
    timeInForce?: TimeInForce,
    execInst?: ExecInst,
    contingencyType?: ContingencyType,
    text?: string
  }

  export type GetPosition = {
    filter?: string,
    count?: number,
  }

  export type SetPositionLeverage = {
    symbol: string,
    leverage: number
  }

  export type GetTrades = {
    symbol: string,
    filter?: string,
    count?: number,
    start?: number,
    reverse?: boolean
  }

  export type GetBucketedTrades = {
    binSize: BinSize,
    symbol: string,
    filter?: string,
    count?: number,
    start?: number,
    reverse?: boolean
  }
}

export namespace Res {
  export type Quote = {
    timestamp: string,
    symbol?: string
    bidSize?: number,
    bidPrice?: number,
    askPrice?: number,
    askSize?: number
  }

  export type Order = {
    orderID: string,
    clOrdID?: string,
    clOrdLinkID?: string,
    account?: number,
    symbol?: string,
    side?: string,
    simpleOrderQty?: number,
    orderQty?: number,
    price?: number,
    displayQty?: number,
    stopPx?: number,
    pegOffsetValue?: number,
    pegPriceType?: string,
    currency?: string,
    settlCurrency?: string,
    ordType?: string,
    timeInForce?: string,
    execInst?: string,
    contingencyType?: string,
    exDestination?: string,
    ordStatus?: string,
    triggered?: string,
    workingIndicator?: true,
    ordRejReason?: string,
    simpleLeavesQty?: number,
    leavesQty?: number,
    simpleCumQty?: number,
    cumQty?: number,
    avgPx?: number,
    multiLegReportingType?: string,
    text?: string,
    transactTime?: string,
    timestamp?: string
  }

  export type Position = {
    account: number,
    symbol: string,
    currency: string,
    underlying?: string,
    quoteCurrency?: string,
    commission?: number,
    initMarginReq?: number,
    maintMarginReq?: number,
    riskLimit?: number,
    leverage?: number,
    crossMargin?: true,
    deleveragePercentile?: number,
    rebalancedPnl?: number,
    prevRealisedPnl?: number,
    prevUnrealisedPnl?: number,
    prevClosePrice?: number,
    openingTimestamp?: string,
    openingQty?: number,
    openingCost?: number,
    openingComm?: number,
    openOrderBuyQty?: number,
    openOrderBuyCost?: number,
    openOrderBuyPremium?: number,
    openOrderSellQty?: number,
    openOrderSellCost?: number,
    openOrderSellPremium?: number,
    execBuyQty?: number,
    execBuyCost?: number,
    execSellQty?: number,
    execSellCost?: number,
    execQty?: number,
    execCost?: number,
    execComm?: number,
    currentTimestamp?: string,
    currentQty?: number,
    currentCost?: number,
    currentComm?: number,
    realisedCost?: number,
    unrealisedCost?: number,
    grossOpenCost?: number,
    grossOpenPremium?: number,
    grossExecCost?: number,
    isOpen?: boolean,
    markPrice?: number,
    markValue?: number,
    riskValue?: number,
    homeNotional?: number,
    foreignNotional?: number,
    posState?: string,
    posCost?: number,
    posCost2?: number,
    posCross?: number,
    posInit?: number,
    posComm?: number,
    posLoss?: number,
    posMargin?: number,
    posMaint?: number,
    posAllowance?: number,
    taxableMargin?: number,
    initMargin?: number,
    maintMargin?: number,
    sessionMargin?: number,
    targetExcessMargin?: number,
    varMargin?: number,
    realisedGrossPnl?: number,
    realisedTax?: number,
    realisedPnl?: number,
    unrealisedGrossPnl?: number,
    longBankrupt?: number,
    shortBankrupt?: number,
    taxBase?: number,
    indicativeTaxRate?: number,
    indicativeTax?: number,
    unrealisedTax?: number,
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

  export type Trade = {
    timestamp: string,
    symbol: string,
    side?: string,
    size?: number,
    price?: number,
    tickDirection?: string,
    trdMatchID?: string,
    grossValue?: number,
    homeNotional?: number,
    foreignNotional?: number
  }

  export type BucketedTrade = {
    timestamp: string,
    symbol: string,
    open?: number,
    high?: number,
    low?: number,
    close?: number,
    trades?: number,
    volume?: number,
    vwap?: number,
    lastSize?: number,
    turnover?: number,
    homeNotional?: number,
    foreignNotional?: number
  }
}
