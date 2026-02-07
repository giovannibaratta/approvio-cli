import chalk from "chalk"
import {getUserClient, handleTask} from "../../utils/sdk"

export async function createGroupTask(options: {name: string; description?: string}) {
  const client = getUserClient()
  await handleTask(
    client.createGroup({
      name: options.name,
      description: options.description
    }),
    onSuccess,
    "Failed to create group"
  )
}

function onSuccess() {
  console.log(chalk.green("Group created successfully"))
}
