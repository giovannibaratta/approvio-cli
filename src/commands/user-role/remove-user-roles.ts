import chalk from "chalk"
import {getUserClient, handleTask} from "../../utils/sdk"
import {parseRoles} from "../../utils/parse-roles"

export async function removeUserRolesTask(userId: string, options: {roles: string}) {
  const client = getUserClient()
  const roles = parseRoles(options.roles)

  await handleTask(client.removeUserRoles(userId, {roles}), onSuccess, "Failed to remove roles")
}

function onSuccess() {
  console.log(chalk.green("Roles removed successfully"))
}
