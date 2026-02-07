import {getUserClient, handleTask} from "../../utils/sdk"
import {printTable} from "console-table-printer"
import {ListSpaces200Response} from "@approvio/api"

export async function listSpacesTask(options: {page: string; limit: string}) {
  const client = getUserClient()

  await handleTask(
    client.listSpaces({
      page: parseInt(options.page),
      limit: parseInt(options.limit)
    }),
    onSuccess,
    "Failed to list spaces"
  )
}

function onSuccess(result: ListSpaces200Response) {
  printTable(
    result.data.map(s => ({
      ID: s.id,
      Name: s.name,
      Description: s.description
    }))
  )
}
