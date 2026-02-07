import {Command} from "@commander-js/extra-typings"
import {assignAgentRolesTask} from "./assign-agent-roles"
import {removeAgentRolesTask} from "./remove-agent-roles"

export function registerAgentRoleCommands(program: Command) {
  const role = program.command("agent-role").description("Manage agent roles")

  role
    .command("assign <agentId>")
    .description("Assign roles to an agent")
    .requiredOption("-r, --roles <roles>", "Comma-separated list of roles (roleName:scopeType:scopeId?)")
    .action(async (agentId, options) => assignAgentRolesTask(agentId, options))

  role
    .command("remove <agentId>")
    .description("Remove roles from an agent")
    .requiredOption("-r, --roles <roles>", "Comma-separated list of roles (roleName:scopeType:scopeId?)")
    .action(async (agentId, options) => removeAgentRolesTask(agentId, options))
}
