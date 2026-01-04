import {Command} from "@commander-js/extra-typings"
import chalk from "chalk"
import {AuthHelper} from "@approvio/ts-sdk"
import {configManager} from "../config-manager/config-manager"
import {unwrap} from "../utils/sdk"
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
    .command("logout")
    .description("Log out and clear credentials")
    .action(() => {
      configManager.logout()
      console.log(chalk.green("Logged out successfully"))
    })
}
