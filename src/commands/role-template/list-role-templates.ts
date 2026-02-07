import {getClient, handleTask} from "../../utils/sdk"
import {printTable} from "console-table-printer"
import {ListRoleTemplates200Response} from "@approvio/api"

export async function listRoleTemplatesTask() {
  const client = getClient()
  await handleTask(client.listRoleTemplates(), onSuccess, "Failed to list role templates")
}

function onSuccess(result: ListRoleTemplates200Response) {
  printTable(
    result.roles
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(r => ({
        Name: r.name,
        Scope: r.scope,
        Permissions: r.permissions.join(",")
      }))
  )
}
