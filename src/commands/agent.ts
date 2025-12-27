import {Command} from "commander"
import chalk from "chalk"
import {AuthHelper} from "@approvio/ts-sdk"
import {configManager} from "../utils/config.js"
import {unwrap} from "../utils/sdk.js"
import fs from "node:fs"
import path from "node:path"

export function registerAgentCommands(program: Command) {
  const agent = program.command("agent").description("Agent management commands")

  agent
    .command("register")
    .description("Register a new agent and obtain tokens")
    .requiredOption("-n, --name <name>", "Agent name")
    .requiredOption("-k, --key <path>", "Path to RSA private key PEM file")
    .requiredOption("--publicKey <path>", "Path to RSA public key PEM file")
    .requiredOption("-e, --endpoint <url>", "Approvio API endpoint")
    .action(async options => {
      try {
        const keyPath = path.resolve(options.key)
        const publicKeyPath = path.resolve(options.publicKey)

        if (!fs.existsSync(keyPath)) throw new Error(`Private key file not found: ${keyPath}`)
        if (!fs.existsSync(publicKeyPath)) throw new Error(`Public key file not found: ${publicKeyPath}`)

        const privateKeyPem = fs.readFileSync(keyPath, "utf-8")
        const publicKeyPem = fs.readFileSync(publicKeyPath, "utf-8")

        const authHelper = new AuthHelper(options.endpoint)
        console.log(chalk.blue(`Authenticating agent '${options.name}'...`))

        const response = await unwrap(authHelper.authenticateAgent(options.name, privateKeyPem))

        configManager.updateActiveProfile(
          {
            name: "default",
            endpoint: options.endpoint,
            authType: "agent",
            agentName: options.name,
            privateKeyPem,
            publicKeyPem,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken
          },
          true
        )

        console.log(chalk.green(`Agent '${options.name}' registered and configured successfully!`))
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(chalk.red("Failed to register agent:"), message)
      }
    })
}
