import {TradeManager} from "../trademanager"
import * as S from "../strategy"
import * as SD from "../strategydata"

import * as fs from "fs"

export class TestManager extends TradeManager implements S.StrategyAPI {
  private trades: SD.Ticks

  public position: SD.Position
  public orders: {qty: number, price: number, account: number}[] = []
  public account = 0
  public accountHistory: number[] = []

  private lastPrice = 0
  private index = 0
  private done = false

  public fees = 0.0075

  public constructor(tradesfile: string) {
    super({})

    this.position = {
      account: 0,
      symbol: "Symbol",
      currentQty: 0,
      currentCost: 0,
    }

    const json = JSON.parse(fs.readFileSync(tradesfile, 'utf8'))
    this.trades = this.convertTradesForStrategy(json)

    this.index = this.trades.timestamp.length - 1
  }

  public loop(): void {
    while(!this.done) {
      for (let strategy of this._strategies) {
        this.process(strategy)

        if (this.tick) this.tick(strategy)
      }
    }
  }

  public process(strategy: S.Strategy): any {
    const a = this.index - strategy.config.length
    const b = this.index

    const data = {
      timestamp: this.trades.timestamp.slice(a, b),
      open: this.trades.open.slice(a, b),
      high: this.trades.high.slice(a, b),
      low: this.trades.low.slice(a, b),
      close: this.trades.close.slice(a, b),
      volume: this.trades.volume.slice(a, b),
      indicators: {}
    }

    if(this.index > strategy.config.length) {
      this.index--
  } else {
      this.done = true
    }

    this.lastPrice = data.close[0]

    strategy.run(data, this.position)

    this.accountHistory.push(this.account + this.position.currentQty * this.lastPrice)
  }

  public order(strategy: S.Strategy, settings: SD.CreateOrder): any {
    const qty = settings.orderQty
    const price = settings.price || this.lastPrice

    const transaction = (qty * price)

    this.position.currentQty += qty

    this.account -= transaction
    this.account -= Math.abs(transaction) * this.fees

    this.orders.push({qty: qty, price: price, account: this.account})
  }

  public market(strategy: S.Strategy, orderQty: number, settings?: SD.OrderSettings): any {
    this.order(strategy, Object.assign(settings || {}, {
      symbol: strategy.config.symbol,
      ordType: "Market",
      orderQty: orderQty
    }))
  }

  public limit(strategy: S.Strategy, orderQty: number, price: number, settings?: SD.OrderSettings): any {
    this.order(strategy, Object.assign(settings || {}, {
      symbol: strategy.config.symbol,
      ordType: "Limit",
      orderQty: orderQty,
      price: price
    }))
  }

  public close(strategy: S.Strategy, ordType: SD.OrdType, settings?: SD.OrderSettings): any {
    this.order(strategy, Object.assign(settings || {}, {
      symbol: strategy.config.symbol,
      ordType: ordType,
      orderQty: -this.position.currentQty
    }))
  }

  protected convertTradesForStrategy(data: any): SD.Ticks {
    const result: SD.Ticks = { timestamp: [], open: [], high: [], low: [], close: [], volume: [] }

    for (let i = 0; i < data.length; i++) {
      result.timestamp[i] = data[i].timestamp
      result.open[i] = data[i].open
      result.high[i] = data[i].high
      result.low[i] = data[i].low
      result.close[i] = data[i].close
      result.volume[i] = data[i].volume
    }

    return result
  }

  protected convertPositionsForStrategy(data: SD.Position): SD.Position { return data }
  protected convertOrderForStrategy(data: SD.Order): SD.Order { return data }
  protected convertOrderFromStrategy(data: SD.CreateOrder): SD.CreateOrder { return data }
}
