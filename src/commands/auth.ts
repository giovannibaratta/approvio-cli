import {Command} from "commander"
import chalk from "chalk"
import {AuthHelper} from "@approvio/ts-sdk"
import {configManager} from "../utils/config.js"
import {unwrap} from "../utils/sdk.js"

export function registerAuthCommands(program: Command) {
  const auth = program.command("auth").description("Authenticate with Approvio")

  // TODO: Validate endpoint as URL
  // TODO: options is untyped, is there a way to make it typed ?

  auth
    .command("login")
    .description("Log in as a human user (OIDC)")
    .requiredOption("-e, --endpoint <url>", "Approvio API endpoint")
    .action(async options => {
      const oauth = new AuthHelper(options.endpoint)
      console.log(chalk.blue("To log in, please visit:"))
      console.log(chalk.cyan(oauth.getLoginUrl()))
      console.log("")
      console.log(chalk.yellow("After logging in, paste the Login status token below."))

      const {stdin, stdout} = process
      stdout.write("Login status token: ")

      stdin.once("data", async data => {
        const encodedToken = data.toString().trim()
        if (!encodedToken) {
          console.error(chalk.red("Error: Login status token is required"))
          return
        }

        try {
          const decoded = Buffer.from(encodedToken, "base64").toString("utf-8")
          const [code, state] = decoded.split(":")

          if (!code || !state) {
            console.error(chalk.red("Error: Invalid Login status token format"))
            return
          }

          const response = await unwrap(oauth.exchangeToken(code, state))
          configManager.updateActiveProfile(
            {
              name: "default",
              endpoint: options.endpoint,
              authType: "human",
              accessToken: response.accessToken,
              refreshToken: response.refreshToken
            },
            true
          )
          console.log(chalk.green("Successfully logged in!"))
          // TODO: Program hang here, instead of exiting
        } catch (error) {
          console.error(chalk.red("Failed to exchange token:"), error)
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

      const isConfigured = profile.accessToken && profile.refreshToken
      console.log(`Status: ${isConfigured ? chalk.green("Logged in / Configured") : chalk.yellow("Missing tokens")}`)

      if (profile.authType === "agent") {
        console.log(`Agent Name: ${chalk.cyan(profile.agentName)}`)
      }
    })

  auth
    .command("logout")
    .description("Log out and clear credentials")
    .action(() => {
      configManager.logout()
      console.log(chalk.green("Logged out successfully"))
    })
}
