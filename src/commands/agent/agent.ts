import {Command} from "@commander-js/extra-typings"
import {createAgentTask} from "./create-agent"

export function registerAgentCommands(program: Command) {
  const agent = program.command("agent").description("Agent management commands")

  agent
    .command("create")
    .description("Create a new agent")
    .requiredOption("-n, --name <name>", "Agent name")
    .action(async options => createAgentTask(options))
}
