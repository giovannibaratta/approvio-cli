import chalk from "chalk"
import {getUserClient, handleTask} from "../../utils/sdk"
import {parseEntitiesForAdd} from "./parse-entities"

export async function addGroupMembersTask(groupId: string, options: {ids: string}) {
  const client = getUserClient()
  const entities = parseEntitiesForAdd(options.ids)

  await handleTask(client.addGroupEntities(groupId, {entities}), onSuccess, "Failed to add members")
}

function onSuccess() {
  console.log(chalk.green("Members added successfully"))
}
