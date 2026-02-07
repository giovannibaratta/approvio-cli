import chalk from "chalk"
import {getUserClient, handleTask} from "../../utils/sdk"

export async function addOrgAdminTask(options: {email: string}) {
  const client = getUserClient()
  await handleTask(
    client.addOrganizationAdminToOrg("default", {
      email: options.email
    }),
    onSuccess,
    "Failed to add admin"
  )
}

function onSuccess() {
  console.log(chalk.green("Organization administrator added successfully"))
}
