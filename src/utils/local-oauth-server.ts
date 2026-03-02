import * as http from "node:http"
import open from "open"
import chalk from "chalk"

export interface LocalOAuthServerResult {
  code: string
  state: string
}

export interface LocalOAuthServerOptions {
  timeoutMs?: number
  successMessage?: string
}

/**
 * Spins up a temporary local HTTP server to capture an OAuth callback redirect.
 * This class abstracts away the node:http server management, address resolution,
 * and promise-based callback interception.
 */
export class LocalOAuthServer {
  private server: http.Server
  private port: number = 0

  constructor() {
    this.server = http.createServer()
  }

  /**
   * Starts the local server on an available port.
   * @returns The dynamically assigned port number.
   */
  public async start(): Promise<number> {
    await new Promise<void>((resolve, reject) => {
      this.server.on("error", reject)
      this.server.listen(0, "127.0.0.1", () => resolve())
    })

    const address = this.server.address()
    if (!address || typeof address === "string") {
      this.server.close()
      throw new Error("Failed to get local server address")
    }

    this.port = address.port
    return this.port
  }

  /**
   * Generates the redirect URI based on the assigned port.
   * Throws an error if the server hasn't been started yet.
   */
  public getRedirectUri(): string {
    if (this.port === 0) {
      throw new Error("Server not started")
    }
    return `http://127.0.0.1:${this.port}/callback`
  }

  /**
   * Opens the browser to the provided authorization URL and waits for the callback.
   * Resolves with the captured `code` and `state`.
   * Automatically shuts down the server upon success, timeout, or error.
   */
  public async waitForCallback(
    authorizationUrl: string,
    options?: LocalOAuthServerOptions
  ): Promise<LocalOAuthServerResult> {
    const timeoutMs = options?.timeoutMs ?? 5 * 60 * 1000 // default 5 mins
    const successMessage =
      options?.successMessage ??
      "<html><body><h1>Successfully authenticated!</h1><p>You can close this window and return to your terminal.</p></body></html>"

    try {
      console.log(chalk.blue("Opening your browser to authenticate..."))
      console.log(chalk.dim("If it doesn't open automatically, visit this URL:"))
      console.log(chalk.cyan(authorizationUrl))
      console.log("")

      await open(authorizationUrl)

      return await new Promise<LocalOAuthServerResult>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Login timed out. Please try again."))
        }, timeoutMs)

        this.server.on("request", (req, res) => {
          if (!req.url?.startsWith("/callback")) {
            res.writeHead(404)
            res.end("Not Found")
            return
          }

          const url = new URL(req.url, `http://${req.headers.host}`)
          const code = url.searchParams.get("code")
          const state = url.searchParams.get("state")

          if (!code || !state) {
            res.writeHead(400)
            res.end("Missing code or state parameters")
            reject(new Error("Missing code or state parameters from IDP redirect"))
            return
          }

          res.writeHead(200, {"Content-Type": "text/html"})
          res.end(successMessage)

          clearTimeout(timeout)
          resolve({code, state})
        })
      })
    } finally {
      this.server.close()
    }
  }

  /**
   * Manually shuts down the server if needed.
   */
  public close(): void {
    this.server.close()
  }
}
