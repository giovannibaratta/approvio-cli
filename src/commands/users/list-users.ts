import {ListUsers200Response} from "@approvio/api"
import {handleTask, getUserClient} from "../../utils/sdk"
import {printTable} from "console-table-printer"

export async function listUsersTask(parser: {search?: string; page: string; limit: string}) {
  const client = getUserClient()
  await handleTask(
    client.listUsers({
      search: parser.search,
      page: parseInt(parser.page),
      limit: parseInt(parser.limit)
    }),
    result => onSuccess(result),
    "Failed to list users"
  )
}

function onSuccess(result: ListUsers200Response) {
  printTable(
    result.users.map(u => ({
      ID: u.id,
      Email: u.email,
      Name: u.displayName
    }))
  )
}
