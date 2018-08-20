import * as request from "request"
import * as crypto from "crypto"
import * as D from "./bitmexdata"

type Verb = "GET" | "POST" | "PUT" | "DELETE"

export class BitMex {
  private apiKey: string
  private apiSecret: string

  private baseURL: string
  private basePath = "/api/v1/"

  public constructor(auth: [string, string], production = false) {
    [this.apiKey, this.apiSecret] = auth
    this.baseURL = production ? "https://www.bitmex.com" : "https://testnet.bitmex.com"
  }

  public getQuote(parameters: D.Req.GetQuote): Promise<D.Res.Quote> {
    return this.request("quote", "GET", parameters)
  }

  public createOrder(parameters: D.Req.CreateOrder): Promise<D.Res.Order> {
    return this.request("order", "POST", parameters)
  }

  public getPositions(parameters: D.Req.GetPosition = {}): Promise<D.Res.Position[]> {
    return this.request("position", "GET", parameters)
  }

  public setPositionLeverage(parameters: D.Req.SetPositionLeverage): Promise<D.Res.Position> {
    return this.request("position/leverage", "POST", parameters)
  }

  public getTrades(parameters: D.Req.GetTrades): Promise<D.Res.Trade[]> {
    return this.request("trade", "GET", parameters)
  }

  public getBucketedTrades(parameters: D.Req.GetBucketedTrades): Promise<D.Res.BucketedTrade[]> {
    return this.request("trade/bucketed", "GET", parameters)
  }

  private request(endpoint: string, verb: Verb, parameters: object): Promise<any> {
    const path = this.basePath + endpoint
    const expires = new Date().getTime() + (60 * 1000)
    const postBody = JSON.stringify(parameters)
    const signature = this.sign(verb, path, expires, postBody)

    const options = {
      url: this.baseURL + path,
      method: verb,
      body: postBody,
      headers: {
        "content-type": "application/json",
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "api-expires": expires,
        "api-key": this.apiKey,
        "api-signature": signature
      }
    }

    return new Promise((resolve: any, reject: any): void => {
      request(options, (err: any, _: any, body: string): void => {
        if (err) { reject(err) }
        else {
          try {
            let result = JSON.parse(body)
            resolve(result)
          }
          catch (e) { reject(e) }
        }
      })
    })
  }

  private sign(verb: Verb, path: string, expires: number | string, postBody: string): string {
    return crypto.createHmac("sha256", this.apiSecret)
      .update(verb + path + expires + postBody)
      .digest("hex")
  }
}
