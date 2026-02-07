import {Command} from "@commander-js/extra-typings"
import {listRoleTemplatesTask} from "./list-role-templates"

export function registerRoleTemplateCommands(program: Command) {
  const template = program
    .command("role-template")
    .aliases(["role-templates", "rt"])
    .description("Manage role templates")

  template
    .command("list")
    .aliases(["ls"])
    .description("List predefined role templates")
    .action(async () => listRoleTemplatesTask())
}
