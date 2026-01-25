import {Command} from "@commander-js/extra-typings"
import chalk from "chalk"
import {registerUserCommands} from "./commands/user"
import {registerAuthCommands} from "./commands/auth"
import {registerAgentCommands} from "./commands/agent"
import {registerWorkflowCommands} from "./commands/workflow"

const program = new Command()

program.name("approvio").description("Approvio CLI tool").version("0.0.1")

// Register commands
registerAuthCommands(program)
registerUserCommands(program)
registerAgentCommands(program)
registerWorkflowCommands(program)

process.on("uncaughtException", error => {
  console.error(chalk.red(error.message))
  process.exitCode = 1
})

program.parseAsync(process.argv)
