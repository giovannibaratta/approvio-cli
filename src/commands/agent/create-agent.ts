import chalk from "chalk"
import {getUserClient, handleTask} from "../../utils/sdk"
import path from "path"
import fs from "node:fs"
import {ApprovioUserClient} from "@approvio/ts-sdk"
import * as TE from "fp-ts/TaskEither"
import {pipe} from "fp-ts/lib/function"
import {printVerticalTable} from "../../utils/output"

export async function createAgentTask(options: {name: string}) {
  const client = getUserClient()

  await handleTask(registerAgentTask(client, options.name), onSuccess, "Failed to create agent")
}

function registerAgentTask(client: ApprovioUserClient, agentName: string) {
  return pipe(
    TE.Do,
    TE.bind("agentName", () => TE.right(agentName)),
    TE.bind("client", () => TE.right(client)),
    TE.bindW("publicKeyPath", ({agentName}) => TE.right(path.join(process.cwd(), `${agentName}_public_key.pem`))),
    TE.bindW("privateKeyPath", ({agentName}) => TE.right(path.join(process.cwd(), `${agentName}_private_key.pem`))),
    TE.chainFirstW(({publicKeyPath, privateKeyPath}) =>
      TE.fromIO(() => {
        if (fs.existsSync(publicKeyPath)) throw new Error(`File already exist: ${publicKeyPath}`)
        if (fs.existsSync(privateKeyPath)) throw new Error(`File already exist: ${privateKeyPath}`)
      })
    ),
    TE.bindW("response", ({agentName, client}) => client.registerAgent({agentName})),
    TE.chainW(({publicKeyPath, privateKeyPath, response}) => {
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
}

function onSuccess(data: {agentName: string; agentId: string; publicKeyPath: string; privateKeyPath: string}) {
  console.log(chalk.green("Agent created successfully:"))
  printVerticalTable(data)
}
