import {Command} from "@commander-js/extra-typings"
import chalk from "chalk"
import {formatError, getClient} from "../utils/sdk"
import {pipe} from "fp-ts/lib/function"
import * as TE from "fp-ts/TaskEither"

export function registerWorkflowCommands(program: Command) {
  const workflow = program.command("workflow").aliases(["workflows"]).description("Manage workflows")

  workflow
    .command("get <id>")
    .description("Get workflow details")
    .action(async (id: string) => {
      const client = getClient()

      await pipe(
        client.getWorkflow(id),
        TE.match(
          error => {
            console.error(chalk.red("Failed to get workflow:"), formatError(error))
            process.exitCode = 1
          },
          workflow => {
            console.log(chalk.green("Workflow details:"))
            console.log(JSON.stringify(workflow, null, 2))
          }
        )
      )()
    })
}
