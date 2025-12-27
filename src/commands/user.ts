import {Command} from "commander"
import chalk from "chalk"
import {pipe} from "fp-ts/lib/function.js"
import * as TE from "fp-ts/lib/TaskEither.js"
import {getClient, formatError} from "../utils/sdk.js"
import {UserSummary, RoleScope} from "@approvio/api"

export function registerUserCommands(program: Command) {
  const user = program.command("user").description("Manage users")

  user
    .command("create")
    .description("Create a new user")
    .requiredOption("-e, --email <email>", "User email")
    .requiredOption("-n, --name <name>", "Display name")
    .option("-r, --role <role>", "Organization role (admin, member)", "member")
    .action(async (options: {email: string; name: string; role: string}) => {
      const client = getClient()
      await pipe(
        client.createUser({
          email: options.email,
          displayName: options.name,
          orgRole: options.role
        }),
        TE.match(
          error => console.error(chalk.red("Failed to create user:"), formatError(error)),
          () => console.log(chalk.green(`User ${options.email} created successfully`))
        )
      )()
    })

  user
    .command("list")
    .description("List users")
    .option("-s, --search <query>", "Search query")
    .option("-p, --page <number>", "Page number", "1")
    .option("-l, --limit <number>", "Limit per page", "20")
    .action(async (options: {search?: string; page: string; limit: string}) => {
      const client = getClient()
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

  user
    .command("get")
    .description("Get user details")
    .argument("<id>", "User ID")
    .action(async (id: string) => {
      const client = getClient()
      await pipe(
        client.getUser(id),
        TE.match(
          error => console.error(chalk.red("Failed to get user:"), formatError(error)),
          result => console.log(JSON.stringify(result, null, 2))
        )
      )()
    })

  user
    .command("role-add")
    .description("Assign roles to a user")
    .argument("<id>", "User ID")
    .requiredOption("-r, --role <role>", "Role name")
    .requiredOption("-s, --scope <scope>", "Scope type (org, space, group, workflow_template)")
    .option("--space-id <id>", "Space ID (if scope is space)")
    .option("--group-id <id>", "Group ID (if scope is group)")
    .option("--template-id <id>", "Template ID (if scope is workflow_template)")
    .action(
      async (
        id: string,
        options: {
          role: string
          scope: string
          spaceId?: string
          groupId?: string
          templateId?: string
        }
      ) => {
        const client = getClient()

        let scope: RoleScope
        switch (options.scope) {
          case "org":
            scope = {type: "org"}
            break
          case "space":
            if (!options.spaceId) {
              console.error(chalk.red("Error:"), "space-id is required for space scope")
              return
            }
            scope = {type: "space", spaceId: options.spaceId}
            break
          case "group":
            if (!options.groupId) {
              console.error(chalk.red("Error:"), "group-id is required for group scope")
              return
            }
            scope = {type: "group", groupId: options.groupId}
            break
          case "workflow_template":
            if (!options.templateId) {
              console.error(chalk.red("Error:"), "template-id is required for workflow_template scope")
              return
            }
            scope = {type: "workflow_template", workflowTemplateId: options.templateId}
            break
          default:
            console.error(chalk.red("Error:"), `Invalid scope: ${options.scope}`)
            return
        }

        await pipe(
          client.assignUserRoles(id, {
            roles: [
              {
                roleName: options.role,
                scope
              }
            ]
          }),
          TE.match(
            error => console.error(chalk.red("Failed to assign roles:"), formatError(error)),
            () => console.log(chalk.green(`Role ${options.role} assigned to user ${id}`))
          )
        )()
      }
    )
}
