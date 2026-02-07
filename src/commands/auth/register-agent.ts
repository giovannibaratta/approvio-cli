import chalk from "chalk"
import {AuthHelper} from "@approvio/ts-sdk"
import {unwrap} from "../../utils/sdk"
import fs from "node:fs/promises"
import {configManager} from "../../config-manager/config-manager"

export async function registerAgentTask(options: {name: string; privateKey: string; publicKey: string; endpoint: URL}) {
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
