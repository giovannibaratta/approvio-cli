import chalk from "chalk"
import {getUserClient, handleTask} from "../../utils/sdk"

export async function deleteSpaceTask(id: string) {
  const client = getUserClient()
  await handleTask(client.deleteSpace(id), onSuccess, "Failed to delete space")
}

function onSuccess() {
  console.log(chalk.green("Space deleted successfully"))
}
