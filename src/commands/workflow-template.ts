import {Command} from "commander"
import chalk from "chalk"
import {pipe} from "fp-ts/lib/function.js"
import * as TE from "fp-ts/lib/TaskEither.js"
import {getClient, formatError} from "../utils/sdk.js"
import {WorkflowTemplateSummary} from "@approvio/api"

export function registerTemplateCommands(program: Command) {
  const template = program.command("template").description("Manage workflow templates")

  template
    .command("create")
    .description("Create a new workflow template")
    .requiredOption("-n, --name <name>", "Template name")
    .requiredOption("-s, --space-id <id>", "Space ID")
    .requiredOption("-g, --group-id <id>", "Default group ID for approvals")
    .option("-d, --description <description>", "Template description")
    .option("-c, --min-count <number>", "Minimum approvals required", "1")
    .action(async options => {
      const client = getClient()
      await pipe(
        client.createWorkflowTemplate({
          name: options.name,
          description: options.description,
          spaceId: options.spaceId,
          approvalRule: {
            type: "GROUP_REQUIREMENT",
            groupId: options.groupId,
            minCount: parseInt(options.minCount)
          }
        }),
        TE.match(
          error => console.error(chalk.red("Failed to create template:"), formatError(error)),
          () => console.log(chalk.green(`Workflow Template '${options.name}' created successfully`))
        )
      )()
    })

  template
    .command("list")
    .description("List workflow templates")
    .option("-p, --page <number>", "Page number", "1")
    .option("-l, --limit <number>", "Limit per page", "20")
    .action(async options => {
      const client = getClient()
      await pipe(
        client.listWorkflowTemplates({
          page: parseInt(options.page),
          limit: parseInt(options.limit)
        }),
        TE.match(
          error => console.error(chalk.red("Failed to list templates:"), formatError(error)),
          result => {
            console.table(
              result.data.map((t: WorkflowTemplateSummary) => ({
                ID: t.id,
                Name: t.name,
                Description: t.description
              }))
            )
          }
        )
      )()
    })

  template
    .command("get")
    .description("Get template details")
    .argument("<id>", "Template ID")
    .action(async id => {
      const client = getClient()
      await pipe(
        client.getWorkflowTemplate(id),
        TE.match(
          error => console.error(chalk.red("Failed to get template:"), formatError(error)),
          result => console.log(JSON.stringify(result, null, 2))
        )
      )()
    })
}
