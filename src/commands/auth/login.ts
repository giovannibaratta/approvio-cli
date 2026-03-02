import chalk from "chalk"
import {AuthHelper} from "@approvio/ts-sdk"
import {unwrap} from "../../utils/sdk"
import {configManager} from "../../config-manager/config-manager"
import {LocalOAuthServer} from "../../utils/local-oauth-server"

/**
 * Initiates an interactive CLI login flow using the OAuth 2.0 Native App pattern.
 * This function spins up a temporary local HTTP server to capture the IDP redirect,
 * opens the user's default browser to authenticate, and automatically exchanges
 * the resulting authorization code for an access token.
 *
 * @param options - Contains the target backend endpoint URL.
 */
export async function loginTask(options: {endpoint: URL}) {
  const oauth = new AuthHelper(options.endpoint.href)

  const localServer = new LocalOAuthServer()

  try {
    // 1. Start the local server and get the port
    await localServer.start()
    const redirectUri = localServer.getRedirectUri()

    // 2. Fetch the authorization URL from the backend to initiate the flow
    const authorizationUrl = await unwrap(oauth.initiateCliLogin(redirectUri))

    // 3. Open the browser and wait for the OAuth callback
    const codeState = await localServer.waitForCallback(authorizationUrl)

    // 4. Exchange the captured authorization code for access and refresh tokens
    console.log(chalk.blue("Exchanging tokens..."))
    const response = await unwrap(oauth.exchangeTokenForUser(codeState.code, codeState.state))

    // 6. Save the new auth credentials into the local config
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
  } finally {
    localServer.close()
  }
}

function onSuccess() {
  console.log(chalk.green("Successfully logged in!"))
}
