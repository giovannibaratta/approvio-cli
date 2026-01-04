import {Command} from "@commander-js/extra-typings"
import chalk from "chalk"
import {registerUserCommands} from "./commands/user"
import {registerAuthCommands} from "./commands/auth"

const program = new Command()

program.name("approvio").description("Approvio CLI tool").version("0.0.1")

// Register commands
registerAuthCommands(program)
registerUserCommands(program)

process.on("uncaughtException", error => {
  console.error(chalk.red(error.message))
  process.exitCode = 1
})

program.parseAsync(process.argv)
