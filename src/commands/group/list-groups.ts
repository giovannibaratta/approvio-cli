import {printTable} from "console-table-printer"
import {getUserClient, handleTask} from "../../utils/sdk"
import {ListGroups200Response} from "@approvio/api"

export async function listGroupsTask(options: {page: string; limit: string}) {
  const client = getUserClient()
  await handleTask(
    client.listGroups({
      page: parseInt(options.page),
      limit: parseInt(options.limit)
    }),
    result => onSuccess(result),
    "Failed to list groups"
  )
}

function onSuccess(result: ListGroups200Response) {
  printTable(
    result.groups.map(g => ({
      ID: g.id,
      Name: g.name,
      Description: g.description
    }))
  )
}
