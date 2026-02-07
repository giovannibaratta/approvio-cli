import chalk from "chalk"
import {getUserClient, handleTask} from "../../utils/sdk"

export async function createSpaceTask(options: {name: string; description?: string}) {
  const client = getUserClient()
  await handleTask(
    client.createSpace({
      name: options.name,
      description: options.description
    }),
    onSuccess,
    "Failed to create space"
  )
}

function onSuccess() {
  console.log(chalk.green("Space created successfully"))
}
