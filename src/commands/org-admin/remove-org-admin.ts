import chalk from "chalk"
import {getUserClient, handleTask} from "../../utils/sdk"

export async function removeOrgAdminTask(options: {id: string}) {
  const client = getUserClient()
  await handleTask(
    client.removeOrganizationAdminFromOrg("default", {
      userId: options.id
    }),
    onSuccess,
    "Failed to remove admin"
  )
}

function onSuccess() {
  console.log(chalk.green("Organization administrator removed successfully"))
}
