import chalk from "chalk"
import {getUserClient, handleTask} from "../../utils/sdk"
import {parseEntitiesForRemove} from "./parse-entities"

export async function removeGroupMembersTask(groupId: string, options: {ids: string}) {
  const client = getUserClient()
  const entities = parseEntitiesForRemove(options.ids)

  await handleTask(client.removeGroupEntities(groupId, {entities}), onSuccess, "Failed to remove members")
}

function onSuccess() {
  console.log(chalk.green("Members removed successfully"))
}
