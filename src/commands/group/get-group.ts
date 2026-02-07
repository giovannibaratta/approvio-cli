import {getUserClient, handleTask} from "../../utils/sdk"
import {printVerticalTable} from "../../utils/output"
import {Group} from "@approvio/api"

export async function getGroupTask(identifier: string) {
  const client = getUserClient()
  await handleTask(client.getGroup(identifier), onSuccess, "Failed to get group")
}

function onSuccess(group: Group) {
  printVerticalTable(group)
}
