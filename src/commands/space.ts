import {Command} from "commander"
import chalk from "chalk"
import {pipe} from "fp-ts/lib/function.js"
import * as TE from "fp-ts/lib/TaskEither.js"
import {getClient, formatError} from "../utils/sdk.js"
import {Space} from "@approvio/api"

export function registerSpaceCommands(program: Command) {
  const space = program.command("space").description("Manage organizational spaces")

  space
    .command("create")
    .description("Create a new space")
    .requiredOption("-n, --name <name>", "Space name")
    .option("-d, --description <description>", "Space description")
    .action(async options => {
      const client = getClient()
      await pipe(
        client.createSpace({
          name: options.name,
          description: options.description
        }),
        TE.match(
          error => console.error(chalk.red("Failed to create space:"), formatError(error)),
          () => console.log(chalk.green(`Space '${options.name}' created successfully`))
        )
      )()
    })

  space
    .command("list")
    .description("List spaces")
    .option("-p, --page <number>", "Page number", "1")
    .option("-l, --limit <number>", "Limit per page", "20")
    .action(async options => {
      const client = getClient()
      await pipe(
        client.listSpaces({
          page: parseInt(options.page),
          limit: parseInt(options.limit)
        }),
        TE.match(
          error => console.error(chalk.red("Failed to list spaces:"), formatError(error)),
          result => {
            console.table(
              result.data.map((s: Space) => ({
                ID: s.id,
                Name: s.name,
                Description: s.description
              }))
            )
          }
        )
      )()
    })

  space
    .command("get")
    .description("Get space details")
    .argument("<id>", "Space ID")
    .action(async id => {
      const client = getClient()
      await pipe(
        client.getSpace(id),
        TE.match(
          error => console.error(chalk.red("Failed to get space:"), formatError(error)),
          result => console.log(JSON.stringify(result, null, 2))
        )
      )()
    })

  space
    .command("delete")
    .description("Delete a space")
    .argument("<id>", "Space ID")
    .action(async id => {
      const client = getClient()
      await pipe(
        client.deleteSpace(id),
        TE.match(
          error => console.error(chalk.red("Failed to delete space:"), formatError(error)),
          () => console.log(chalk.green(`Space ${id} deleted successfully`))
        )
      )()
    })
}
