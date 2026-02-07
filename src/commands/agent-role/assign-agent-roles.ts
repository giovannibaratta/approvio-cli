import chalk from "chalk"
import {getUserClient, handleTask} from "../../utils/sdk"
import {parseRoles} from "../../utils/parse-roles"

export async function assignAgentRolesTask(agentId: string, options: {roles: string}) {
  const client = getUserClient()
  const roles = parseRoles(options.roles)

  await handleTask(client.assignAgentRoles(agentId, {roles}), onSuccess, "Failed to assign roles")
}

function onSuccess() {
  console.log(chalk.green("Roles assigned successfully"))
}
