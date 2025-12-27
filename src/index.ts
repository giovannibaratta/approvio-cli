import {Command} from "commander"
import chalk from "chalk"
import {registerUserCommands} from "./commands/user.js"
import {registerGroupCommands} from "./commands/group.js"
import {registerSpaceCommands} from "./commands/space.js"
import {registerTemplateCommands} from "./commands/workflow-template.js"
import {registerBootstrapCommands} from "./commands/bootstrap.js"
import {registerAuthCommands} from "./commands/auth.js"
import {registerAgentCommands} from "./commands/agent.js"

const program = new Command()

program.name("approvio").description("Approvio CLI tool").version("0.0.1")

// Register commands
registerAuthCommands(program)
registerAgentCommands(program)
registerUserCommands(program)
registerGroupCommands(program)
registerSpaceCommands(program)
registerTemplateCommands(program)
registerBootstrapCommands(program)

program.parseAsync(process.argv).catch(err => {
  console.error(chalk.red("Error:"), err.message)
})
