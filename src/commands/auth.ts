import {Command} from "@commander-js/extra-typings"
import chalk from "chalk"
import {AuthHelper} from "@approvio/ts-sdk"
import {unwrap} from "../utils/sdk"
import fs from "node:fs/promises"
import {configManager} from "../config-manager/config-manager"
import {validateEndpoint} from "../utils/validation"
import {getJwtTokenStatus} from "../utils/jwt"

export function registerAuthCommands(program: Command) {
  const auth = program.command("auth").description("Authenticate with Approvio")

  auth
    .command("login")
    .description("Log in as a human user (OIDC)")
    .requiredOption("-e, --endpoint <url>", "Approvio API endpoint", validateEndpoint)
    .action(async options => {
      const oauth = new AuthHelper(options.endpoint.href)
      console.log(chalk.blue("To log in, please visit:"))
      console.log(chalk.cyan(oauth.getUserLoginUrl()))
      console.log("")
      console.log(chalk.yellow("After logging in, paste the Login status token below."))

      const {stdin, stdout} = process
      stdout.write("Login status token: ")

      stdin.once("data", async data => {
        try {
          const encodedToken = data.toString().trim()

          if (!encodedToken) throw new Error("Login status token is required")

          const decoded = Buffer.from(encodedToken, "base64").toString("utf-8")
          const [code, state] = decoded.split(":")

          if (!code || !state) throw new Error("Invalid Login status token format")

          const response = await unwrap(oauth.exchangeTokenForUser(code, state))
          configManager.updateActiveProfile(
            {
              name: "default",
              endpoint: options.endpoint.href,
              authType: "human",
              accessToken: response.accessToken,
              refreshToken: response.refreshToken
            },
            true
          )
          console.log(chalk.green("Successfully logged in!"))
        } catch (error) {
          stdin.destroy()
          throw error
        }
      })
    })

  auth
    .command("status")
    .description("Show authentication status")
    .action(() => {
      const profile = configManager.getActiveProfileOrThrow()
      console.log(`Profile: ${chalk.cyan(profile.name)}`)
      console.log(`Endpoint: ${chalk.cyan(profile.endpoint)}`)
      console.log(`Auth Type: ${chalk.cyan(profile.authType)}`)

      const accessStatus = getJwtTokenStatus(profile.accessToken)

      console.log(
        `Access Token: ${accessStatus.isExpired ? chalk.red(`expired at ${accessStatus.expiresAt}`) : chalk.green(`valid until ${accessStatus.expiresAt}`)}`
      )
    })

  auth
    .command("register-agent")
    .description("Register an agent with local configuration")
    .requiredOption("-n, --name <name>", "Agent name")
    .requiredOption("-k, --private-key <path>", "Path to private key file")
    .requiredOption("-p, --public-key <path>", "Path to public key file")
    .requiredOption("-e, --endpoint <url>", "Approvio API endpoint", validateEndpoint)
    .action(registerAgentAction)

  auth
    .command("logout")
    .description("Log out and clear credentials")
    .action(() => {
      configManager.logout()
      console.log(chalk.green("Logged out successfully"))
    })
}

async function registerAgentAction(options: RegisterAgentOptions) {
  // 1. Validate files exist
  const [privateKey] = await Promise.all([
    fs.readFile(options.privateKey, "utf-8"),
    fs.readFile(options.publicKey, "utf-8")
  ])

  // 2. Authenticate
  const auth = new AuthHelper(options.endpoint.href)
  const tokenResponse = await unwrap(auth.authenticateAgent(options.name, privateKey))

  // 3. Update Config
  configManager.updateActiveProfile(
    {
      authType: "agent",
      name: options.name,
      agentName: options.name,
      endpoint: options.endpoint.href,
      privateKeyPath: options.privateKey,
      publicKeyPath: options.publicKey,
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken
    },
    true
  )

  console.log(chalk.green(`Agent '${options.name}' registered and authenticated successfully!`))
}

interface RegisterAgentOptions {
  name: string
  privateKey: string
  publicKey: string
  endpoint: URL
}
