import {getUserClient, handleTask} from "../../utils/sdk"
import {printVerticalTable} from "../../utils/output"
import {Space} from "@approvio/api"

export async function getSpaceTask(id: string) {
  const client = getUserClient()
  await handleTask(client.getSpace(id), onSuccess, "Failed to get space")
}

function onSuccess(space: Space) {
  printVerticalTable(space)
}
