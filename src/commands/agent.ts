import {Command} from "@commander-js/extra-typings"
import chalk from "chalk"
import {formatError, getUserClient} from "../utils/sdk"
import {pipe} from "fp-ts/lib/function"
import * as TE from "fp-ts/TaskEither"
import path from "path"
import fs from "node:fs"

export function registerAgentCommands(program: Command) {
  const agent = program.command("agent").description("Agent management commands")

  agent
    .command("create")
    .description("Create a new agent")
    .requiredOption("-n, --name <name>", "Agent name")
    .action(async options => {
      const client = getUserClient()
      await pipe(
        TE.Do,
        TE.bind("agentName", () => TE.right(options.name)),
        TE.bind("client", () => TE.right(client)),
        TE.bindW("publicKeyPath", ({agentName}) => TE.right(path.join(process.cwd(), `${agentName}_public_key.pem`))),
        TE.bindW("privateKeyPath", ({agentName}) => TE.right(path.join(process.cwd(), `${agentName}_private_key.pem`))),
        TE.chainFirstW(({publicKeyPath, privateKeyPath}) =>
          TE.fromIO(() => {
            if (fs.existsSync(publicKeyPath)) throw new Error(`File already exist: ${publicKeyPath}`)
            if (fs.existsSync(privateKeyPath)) throw new Error(`File already exist: ${privateKeyPath}`)
          })
        ),
        TE.chainW(({agentName, client, publicKeyPath, privateKeyPath}) =>
          pipe(
            client.registerAgent({agentName}),
            TE.chainW(response => {
              const {publicKey: encodedPublicKey, privateKey: encodedPrivateKey, agentName, agentId} = response
              const publicKey = Buffer.from(encodedPublicKey, "base64").toString("utf-8")
              const privateKey = Buffer.from(encodedPrivateKey, "base64").toString("utf-8")
              fs.writeFileSync(publicKeyPath, publicKey)
              fs.writeFileSync(privateKeyPath, privateKey)
              return TE.right({
                agentName,
                agentId,
                publicKeyPath,
                privateKeyPath
              })
            })
          )
        ),
        TE.match(
          error => {
            console.error(chalk.red("Failed to create agent:"), formatError(error))
            process.exitCode = 1
          },
          data => {
            const {agentName, agentId, publicKeyPath, privateKeyPath} = data
            console.log(chalk.green("Agent created successfully:"))
            console.log(`Name: ${agentName}`)
            console.log(`ID: ${agentId}`)
            console.log(`Public key saved to: ${publicKeyPath}`)
            console.log(`Private key saved to: ${privateKeyPath}`)
          }
        )
      )()
    })
}
