import {Command} from "@commander-js/extra-typings"
import chalk from "chalk"
import {registerUserCommands} from "./commands/users"
import {registerAuthCommands} from "./commands/auth"
import {registerAgentCommands} from "./commands/agent"
import {registerWorkflowCommands} from "./commands/workflow"
import {registerSpaceCommands} from "./commands/space"
import {registerGroupCommands} from "./commands/group"
import {registerWorkflowTemplateCommands} from "./commands/workflow-template"
import {registerOrgAdminCommands} from "./commands/org-admin"
import {registerRoleTemplateCommands} from "./commands/role-template"
import {registerUserRoleCommands} from "./commands/user-role"
import {registerAgentRoleCommands} from "./commands/agent-role"
import {registerGroupMemberCommands} from "./commands/group-member"

const program = new Command()

program.name("approvio").description("Approvio CLI tool").version("0.0.1")

// Register commands
registerAuthCommands(program)
registerUserCommands(program)
registerAgentCommands(program)
registerWorkflowCommands(program)
registerSpaceCommands(program)
registerGroupCommands(program)
registerWorkflowTemplateCommands(program)
registerOrgAdminCommands(program)
registerRoleTemplateCommands(program)
registerUserRoleCommands(program)
registerAgentRoleCommands(program)
registerGroupMemberCommands(program)

process.on("uncaughtException", error => {
  console.error(chalk.red(error.message))
  process.exitCode = 1
})

program.parseAsync(process.argv)
