import {Command} from "@commander-js/extra-typings"
import chalk from "chalk"
import {pipe} from "fp-ts/function"
import * as TE from "fp-ts/TaskEither"
import {getUserClient, formatError} from "../utils/sdk"
import {UserSummary} from "@approvio/api"

export function registerUserCommands(program: Command) {
  const user = program.command("user").aliases(["users"]).description("Manage users")

  user
    .command("list")
    .aliases(["ls"])
    .description("List users")
    .option("-s, --search <query>", "Search query")
    .option("-p, --page <number>", "Page number", "1")
    .option("-l, --limit <number>", "Limit per page", "20")
    .action(async (options: {search?: string; page: string; limit: string}) => {
      const client = getUserClient()
      await pipe(
        client.listUsers({
          search: options.search,
          page: parseInt(options.page),
          limit: parseInt(options.limit)
        }),
        TE.match(
          error => console.error(chalk.red("Failed to list users:"), formatError(error)),
          result => {
            console.table(
              result.users.map((u: UserSummary) => ({
                ID: u.id,
                Email: u.email,
                Name: u.displayName
              }))
            )
          }
        )
      )()
    })
}
