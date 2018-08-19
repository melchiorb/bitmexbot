import * as request from "request"
import * as crypto from "crypto"
import * as bmd from "./bitmexdata"

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

  private request(endpoint: string, verb: Verb, data: object): Promise<any> {
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

    return new Promise((resolve, reject) => {
      request(options, (err: any, _, body: string): void => {
        if (err) {
          reject(err)
        } else {
          try {
            let result = JSON.parse(body)
            resolve(result)
          } catch(e) {
            reject(e)
          }
        }
      })
    })
  }

  public getQuote(data: bmd.Req.GetQuote): Promise<bmd.Res.Quote> {
    return this.request("quote", Verb.GET, data)
  }

  public createOrder(data: bmd.Req.CreateOrder): Promise<bmd.Res.Order> {
    return this.request("order", Verb.POST, data)
  }

  public getPositions(data: bmd.Req.GetPosition): Promise<bmd.Res.Position[]> {
    return this.request("position", Verb.GET, data)
  }

  public setPositionLeverage(data: bmd.Req.SetPositionLeverage): Promise<bmd.Res.Position> {
    return this.request("position/leverage", Verb.POST, data)
  }
}
