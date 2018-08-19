import * as request from "request"
import * as crypto from "crypto"
import * as bmd from "./bitmexdata"

type Callback = (error: any, response: any, body: string) => void

enum Verb {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE"
}

export class BitMex {
  private apiKey: string
  private apiSecret: string

  private baseURL: string
  private basePath = "/api/v1/"

  public constructor(auth: [string, string], production = false) {
    [this.apiKey, this.apiSecret] = auth
    this.baseURL = production ? "https://www.bitmex.com" : "https://testnet.bitmex.com"
  }

  private sign(verb: Verb, path: string, expires: number | string, postBody: string): string {
    return crypto.createHmac("sha256", this.apiSecret)
      .update(verb + path + expires + postBody)
      .digest("hex")
  }

  private request(endpoint: string, verb: Verb, data: object, callback: Callback): void {
    const path = this.basePath + endpoint
    const expires = new Date().getTime() + (60 * 1000)
    const postBody = JSON.stringify(data)
    const signature = this.sign(verb, path, expires, postBody)

    const headers = {
      "content-type": "application/json",
      "Accept": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "api-expires": expires,
      "api-key": this.apiKey,
      "api-signature": signature
    }

    const options = {
      headers: headers,
      url: this.baseURL + path,
      method: verb,
      body: postBody
    }

    request(options, callback)
  }

  private responseCB<R>(callback: (data: R) => void): any {
    return (err: any, _: any, body: string): void => {
      if (err) {
        console.error(err)
      } else {
        let result: R

        try {
          result = JSON.parse(body)
        } catch(e) {
          console.error(e)
        }

        if (result) callback(result)
      }
    }
  }

  public getQuote(data: bmd.Req.GetQuote, callback: (data: bmd.Res.Quote) => void): void {
    const cb = this.responseCB<bmd.Res.Quote>(callback)
    this.request("quote", Verb.GET, data, cb)
  }

  public createOrder(data: bmd.Req.CreateOrder, callback: (data: bmd.Res.Order) => void): void {
    const cb = this.responseCB<bmd.Res.Order>(callback)
    this.request("order", Verb.POST, data, cb)
  }

  public getPositions(data: bmd.Req.GetPosition, callback: (data: bmd.Res.Position[]) => void): void {
    const cb = this.responseCB<bmd.Res.Position[]>(callback)
    this.request("position", Verb.GET, data, cb)
  }

  public setPositionLeverage(data: bmd.Req.SetPositionLeverage, callback: (data: bmd.Res.Position) => void): void {
    const cb = this.responseCB<bmd.Res.Position>(callback)
    this.request("position/leverage", Verb.POST, data, cb)
  }
}
