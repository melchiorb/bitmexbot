import {TradeManager} from "../trademanager"
import {BitMex} from "../bitmex"
import * as S from "../strategy"
import * as SD from "../strategydata"
import * as BD from "../bitmexdata"

export class BitMexManager extends TradeManager<BitMex> implements S.StrategyAPI {
  public async process(strategy: S.Strategy): Promise<any> {
    const parameters = {
      symbol: strategy.config.symbol,
      binSize: (strategy.config.binsize as BD.Req.BinSize),
      count: strategy.config.length
    }

    const filter = `{"symbol": "${strategy.config.symbol}"}`
    const positions = await this._api.getPositions({ filter: filter })
    const convertedPos = this.convertPositionsForStrategy(positions[0])

    const trades = await this._api.getBucketedTrades(parameters)

    let convertedTrades = this.convertTradesForStrategy(trades)
    convertedTrades = this.processIndicators(convertedTrades, strategy.indicators)

    strategy.run(convertedTrades, convertedPos)
  }

  public add(strategy: S.Strategy): void {
    super.add(strategy)

    const parameters = {
      symbol: strategy.config.symbol,
      leverage: strategy.config.leverage
    }

    this._api.setPositionLeverage(parameters)
  }

  public async order(strategy: S.Strategy, settings: SD.CreateOrder): Promise<any> {
    const converted = this.convertOrderFromStrategy(settings)
    const order = await this._api.createOrder(converted)

    console.log(order)
  }

  public async market(strategy: S.Strategy, orderQty: number, settings?: SD.OrderSettings): Promise<any> {
    this.order(strategy, Object.assign(settings || {}, {
      symbol: strategy.config.symbol,
      ordType: "Market",
      orderQty: orderQty
    }))
  }

  public async limit(strategy: S.Strategy, orderQty: number, price: number, settings?: SD.OrderSettings): Promise<any> {
    this.order(strategy, Object.assign(settings || {}, {
      symbol: strategy.config.symbol,
      ordType: "Limit",
      orderQty: orderQty,
      price: price
    }))
  }

  public async close(strategy: S.Strategy, ordType: SD.OrdType, settings?: SD.OrderSettings): Promise<any> {
    this.order(strategy, Object.assign(settings || {}, {
      symbol: strategy.config.symbol,
      ordType: ordType,
      execInst: "Close"
    }))
  }

  protected convertTradesForStrategy(data: BD.Res.BucketedTrade[]): SD.Ticks {
    const result: SD.Ticks = { open: [], high: [], low: [], close: [], volume: [], indicators: {} }

    for (let i = 0; i < data.length; i++) {
      result.open[i] = data[i].open
      result.high[i] = data[i].high
      result.low[i] = data[i].low
      result.close[i] = data[i].close
      result.volume[i] = data[i].volume
    }

    return result
  }

  protected convertPositionsForStrategy(data: BD.Res.Position): SD.Position {
    const result: SD.Position = {
      account: data.account,
      symbol: data.symbol,
      // currency: data.currency,
      // underlying: data.underlying,
      // quoteCurrency: data.quoteCurrency,
      commission: data.commission,
      // initMarginReq: data.initMarginReq,
      // maintMarginReq: data.maintMarginReq,
      // riskLimit: data.riskLimit,
      leverage: data.leverage,
      // crossMargin: data.crossMargin,
      // deleveragePercentile: data.deleveragePercentile,
      // rebalancedPnl: data.rebalancedPnl,
      // prevRealisedPnl: data.prevRealisedPnl,
      // prevUnrealisedPnl: data.prevUnrealisedPnl,
      // prevClosePrice: data.prevClosePrice,
      openingTimestamp: data.openingTimestamp,
      openingQty: data.openingQty,
      openingCost: data.openingCost,
      // openingComm: data.openingComm,
      // openOrderBuyQty: data.openOrderBuyQty,
      // openOrderBuyCost: data.openOrderBuyCost,
      // openOrderBuyPremium: data.openOrderBuyPremium,
      // openOrderSellQty: data.openOrderSellQty,
      // openOrderSellCost: data.openOrderSellCost,
      // openOrderSellPremium: data.openOrderSellPremium,
      // execBuyQty: data.execBuyQty,
      // execBuyCost: data.execBuyCost,
      // execSellQty: data.execSellQty,
      // execSellCost: data.execSellCost,
      // execQty: data.execQty,
      // execCost: data.execCost,
      // execComm: data.execComm,
      // currentTimestamp: data.currentTimestamp,
      currentQty: data.currentQty,
      currentCost: data.currentCost,
      // currentComm: data.currentComm,
      realisedCost: data.realisedCost,
      unrealisedCost: data.unrealisedCost,
      // grossOpenCost: data.grossOpenCost,
      // grossOpenPremium: data.grossOpenPremium,
      // grossExecCost: data.grossExecCost,
      isOpen: data.isOpen,
      markPrice: data.markPrice,
      markValue: data.markValue,
      riskValue: data.riskValue,
      // homeNotional: data.homeNotional,
      // foreignNotional: data.foreignNotional,
      // posState: data.posState,
      // posCost: data.posCost,
      // posCost2: data.posCost2,
      // posCross: data.posCross,
      // posInit: data.posInit,
      // posComm: data.posComm,
      // posLoss: data.posLoss,
      // posMargin: data.posMargin,
      // posMaint: data.posMaint,
      // posAllowance: data.posAllowance,
      // taxableMargin: data.taxableMargin,
      initMargin: data.initMargin,
      maintMargin: data.maintMargin,
      // sessionMargin: data.sessionMargin,
      // targetExcessMargin: data.targetExcessMargin,
      // varMargin: data.varMargin,
      // realisedGrossPnl: data.realisedGrossPnl,
      // realisedTax: data.realisedTax,
      // realisedPnl: data.realisedPnl,
      // unrealisedGrossPnl: data.unrealisedGrossPnl,
      // longBankrupt: data.longBankrupt,
      // shortBankrupt: data.shortBankrupt,
      // taxBase: data.taxBase,
      // indicativeTaxRate: data.indicativeTaxRate,
      // indicativeTax: data.indicativeTax,
      // unrealisedTax: data.unrealisedTax,
      unrealisedPnl: data.unrealisedPnl,
      unrealisedPnlPcnt: data.unrealisedPnlPcnt,
      unrealisedRoePcnt: data.unrealisedRoePcnt,
      simpleQty: data.simpleQty,
      simpleCost: data.simpleCost,
      simpleValue: data.simpleValue,
      simplePnl: data.simplePnl,
      simplePnlPcnt: data.simplePnlPcnt,
      avgCostPrice: data.avgCostPrice,
      avgEntryPrice: data.avgEntryPrice,
      breakEvenPrice: data.breakEvenPrice,
      marginCallPrice: data.marginCallPrice,
      liquidationPrice: data.liquidationPrice,
      bankruptPrice: data.bankruptPrice,
      timestamp: data.timestamp,
      lastPrice: data.lastPrice,
      lastValue: data.lastValue
    }

    return result
  }

  protected convertOrderForStrategy(data: BD.Res.Order): SD.Order {
    const result: SD.Order = {
      orderID: data.orderID,
      clOrdID: data.clOrdID,
      // clOrdLinkID: data.clOrdLinkID,
      account: data.account,
      symbol: data.symbol,
      side: data.side as SD.Side,
      simpleOrderQty: data.simpleOrderQty,
      orderQty: data.orderQty,
      price: data.price,
      // displayQty: data.displayQty,
      stopPx: data.stopPx,
      pegOffsetValue: data.pegOffsetValue,
      pegPriceType: data.pegPriceType as SD.PegPriceType,
      // currency: data.currency,
      // settlCurrency: data.settlCurrency,
      ordType: data.ordType as SD.OrdType,
      timeInForce: data.timeInForce as SD.TimeInForce,
      execInst: data.execInst as SD.ExecInst,
      // contingencyType: data.contingencyType,
      // exDestination: data.exDestination,
      ordStatus: data.ordStatus,
      triggered: data.triggered,
      // workingIndicator: data.workingIndicator,
      ordRejReason: data.ordRejReason,
      // simpleLeavesQty: data.simpleLeavesQty,
      // leavesQty: data.leavesQty,
      // simpleCumQty: data.simpleCumQty,
      // cumQty: data.cumQty,
      // avgPx: data.avgPx,
      // multiLegReportingType: data.multiLegReportingType,
      text: data.text,
      transactTime: data.transactTime,
      timestamp: data.timestamp
    }

    return result
  }

  protected convertOrderFromStrategy(data: SD.CreateOrder): BD.Req.CreateOrder {
    const result: BD.Req.CreateOrder = {
      symbol: data.symbol,
      side: data.side,
      simpleOrderQty: data.simpleOrderQty,
      orderQty: data.orderQty,
      price: data.price,
      // displayQty: data.displayQty,
      stopPx: data.stopPx,
      clOrdID: data.clOrdID,
      // clOrdLinkID: data.clOrdLinkID,
      pegOffsetValue: data.pegOffsetValue,
      pegPriceType: data.pegPriceType,
      ordType: data.ordType,
      timeInForce: data.timeInForce,
      execInst: data.execInst,
      // contingencyType: data.contingencyType,
      text: data.text
    }

    return result
  }
}
