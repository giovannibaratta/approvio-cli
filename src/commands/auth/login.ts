import chalk from "chalk"
import {AuthHelper} from "@approvio/ts-sdk"
import {unwrap} from "../../utils/sdk"
import {configManager} from "../../config-manager/config-manager"

export async function loginTask(options: {endpoint: URL}) {
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
      onSuccess()
    } catch (error) {
      stdin.destroy()
      throw error
    }
  })
}

function onSuccess() {
  console.log(chalk.green("Successfully logged in!"))
}
