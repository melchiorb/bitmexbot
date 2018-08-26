import * as S from "./strategy"
import * as SD from "./strategydata";

export abstract class TradeManager implements S.StrategyAPI {
  protected _strategies: S.Strategy[] = []

  public timeout = 1
  public tick: (strategy: S.Strategy) => void

  public constructor(protected _api: any) {}

  public add(strategy: S.Strategy): void {
    strategy.API = this
    this._strategies.push(strategy)
  }

  public loop(): void {
    for (let strategy of this._strategies) {
      this.process(strategy)

      if (this.tick) this.tick(strategy)
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
}
