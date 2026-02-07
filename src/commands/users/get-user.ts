import {User} from "@approvio/api"
import {handleTask, getUserClient} from "../../utils/sdk"
import {printVerticalTable} from "../../utils/output"

export async function getUserTask(id: string) {
  const client = getUserClient()
  await handleTask(client.getUser(id), onSuccess, "Failed to get user")
}

function onSuccess(result: User) {
  printVerticalTable(result)
}
