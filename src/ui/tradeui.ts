import { TradeManager } from "../trademanager"
import { Strategy } from "../strategy"

import * as Express from "express"
import { Application, Request, Response } from "express"

import * as Path from "path"

export class UI {
  private app: Application
  private response: any = {}
  private public = "../public"

  constructor(private manager: TradeManager) {
    manager.tick = (strategy: Strategy) => this.tick(strategy)

    this.app = Express()
    this.app.use(Express.static(Path.join(__dirname, this.public)))

    this.app.get("/", (req, res) => this.index(req, res))
    this.app.get("/:strategy", (req, res) => this.strategy(req, res))
    this.app.get("/data/:strategy.json", (req, res) => this.data(req, res))
    this.app.get("/client/:strategy.json", (req, res) => this.client(req, res))
  }

  private index(req: Request, res: Response): void {
    const nav = Object.keys(this.response).map((d: string) => `<li><a href="/${d}">${d}</a></li>`)

    res.send(html.replace("<!-- nav -->", `<nav><ul>${nav.join()}</ul></nav>`))
  }

  private strategy(req: Request, res: Response): void {
    const embed = `vegaEmbed("main", "/client/${req.params.strategy}.json", {renderer: "SVG", actions: false})`

    res.send(html.replace("<!-- embed -->", embed))
  }

  private data(req: Request, res: Response): void {
    const strategy = this.response[req.params.strategy]
    const output: any[] = []

    for (let timestamp of Object.keys(strategy)) {
      for (let key of Object.keys(strategy[timestamp])) {
        output.push({
          timestamp: timestamp,
          type: key,
          value: strategy[timestamp][key]
        })
      }
    }

    res.json(output)
  }

  private client(req: Request, res: Response): void {
    const strategy = `data/${req.params.strategy}.json`
    client.data.url = strategy

    res.json(client)
  }

  public run(port: number): void {
    this.app.listen(port)

    this.manager.loop()
  }

  public tick(strategy: Strategy): void {
    this.response[strategy.config.name] = strategy.output
  }
}

const client: any = {
  "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
  "data": {"url": "data/ma_crossover.json"},
  "vconcat": [
    {
      "transform": [
        {"filter": "datum.type === 'position'"}
      ],
      "width": 1400,
      "height": 50,
      "mark": "bar",
      "encoding": {
        "x": {"field": "timestamp", "type": "temporal"},
        "y": {"field": "value", "type": "quantitative"}
      }
    },
    {
      "transform": [
        {"filter": "indexof(datum.type, '_') !== 0 && datum.type !== 'position'"}
      ],
      "width": 1400,
      "height": 400,
      "mark": "line",
      "encoding": {
        "x": {"field": "timestamp", "type": "temporal"},
        "y": {"field": "value", "type": "quantitative"},
        "color": {"field": "type", "type": "nominal"}
      }
    },
    {
      "transform": [
        {"filter": "indexof(datum.type, '_') === 0"}
      ],
      "width": 1400,
      "height": 200,
      "mark": "line",
      "encoding": {
        "x": {"field": "timestamp", "type": "temporal"},
        "y": {"field": "value", "type": "quantitative"},
        "color": {"field": "type", "type": "nominal"},
        "row": {"field": "type", "type": "nominal"}
      }
    }
  ]
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>TradeBot</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/vega/4.2.0/vega.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/vega-lite/3.0.0-rc5/vega-lite.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/vega-embed/3.19.2/vega-embed.js"></script>
</head>
<body>
  <!-- nav -->
  <main></main>
  <script><!-- embed --></script>
</body>
</html>
`
