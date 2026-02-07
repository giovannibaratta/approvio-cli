import {Command} from "@commander-js/extra-typings"
import {listWorkflowTemplatesTask} from "./list-workflow-templates"
import {getWorkflowTemplateTask} from "./get-workflow-template"
import {createWorkflowTemplateTask} from "./create-workflow-template"
import {deprecateWorkflowTemplateTask} from "./deprecate-workflow-template"

export function registerWorkflowTemplateCommands(program: Command) {
  const template = program
    .command("workflow-template")
    .aliases(["workflow-templates", "wt"])
    .description("Manage workflow templates")

  template
    .command("list")
    .aliases(["ls"])
    .description("List workflow templates")
    .option("-p, --page <number>", "Page number", "1")
    .option("-l, --limit <number>", "Limit per page", "20")
    .action(async options => listWorkflowTemplatesTask(options))

  template
    .command("get <identifier>")
    .description("Get workflow template details")
    .action(async identifier => getWorkflowTemplateTask(identifier))

  template
    .command("create")
    .description("Create a new workflow template")
    .requiredOption("-n, --name <name>", "Template name")
    .option("-d, --description <description>", "Template description")
    .requiredOption("-s, --space-id <uuid>", "Space ID")
    .option("--expires-in-hours <number>", "Default expiry time in hours")
    .requiredOption("-f, --file <path>", "Path to YAML or JSON file containing actions and approval rules")
    .action(async options => createWorkflowTemplateTask(options))

  template
    .command("deprecate <name>")
    .description("Deprecate a workflow template")
    .option("--cancel-active", "Cancel active workflows using this template")
    .action(async (name, options) => deprecateWorkflowTemplateTask(name, options))
}
