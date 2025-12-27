import {Command} from "commander"
import chalk from "chalk"
import {pipe} from "fp-ts/lib/function.js"
import * as TE from "fp-ts/lib/TaskEither.js"
import {getClient, formatError} from "../utils/sdk.js"
import {Group} from "@approvio/api"

export function registerGroupCommands(program: Command) {
  const group = program.command("group").description("Manage approver groups")

  group
    .command("create")
    .description("Create a new group")
    .requiredOption("-n, --name <name>", "Group name")
    .option("-d, --description <description>", "Group description")
    .action(async options => {
      const client = getClient()
      await pipe(
        client.createGroup({
          name: options.name,
          description: options.description
        }),
        TE.match(
          error => console.error(chalk.red("Failed to create group:"), formatError(error)),
          () => console.log(chalk.green(`Group '${options.name}' created successfully`))
        )
      )()
    })

  group
    .command("list")
    .description("List groups")
    .option("-p, --page <number>", "Page number", "1")
    .option("-l, --limit <number>", "Limit per page", "20")
    .action(async options => {
      const client = getClient()
      await pipe(
        client.listGroups({
          page: parseInt(options.page),
          limit: parseInt(options.limit)
        }),
        TE.match(
          error => console.error(chalk.red("Failed to list groups:"), formatError(error)),
          result => {
            console.table(
              result.groups.map((g: Group) => ({
                ID: g.id,
                Name: g.name,
                Description: g.description
              }))
            )
          }
        )
      )()
    })

  group
    .command("get")
    .description("Get group details")
    .argument("<id-or-name>", "Group ID or name")
    .action(async idOrName => {
      const client = getClient()
      await pipe(
        client.getGroup(idOrName),
        TE.match(
          error => console.error(chalk.red("Failed to get group:"), formatError(error)),
          result => console.log(JSON.stringify(result, null, 2))
        )
      )()
    })

  group
    .command("member-add")
    .description("Add entities to a group")
    .argument("<id>", "Group ID")
    .requiredOption("-i, --entity-id <id>", "Entity ID")
    .option("-t, --type <type>", "Entity type (human, system)", "human")
    .action(async (id, options: {type: string; entityId: string}) => {
      const client = getClient()
      await pipe(
        client.addGroupEntities(id, {
          entities: [
            {
              entity: {
                entityType: options.type,
                entityId: options.entityId
              }
            }
          ]
        }),
        TE.match(
          error => console.error(chalk.red("Failed to add group member:"), formatError(error)),
          () => console.log(chalk.green(`Entity ${options.entityId} added to group ${id}`))
        )
      )()
    })
}
