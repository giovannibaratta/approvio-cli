import {getUserClient, handleTask} from "../../utils/sdk"
import {printTable} from "console-table-printer"
import {ListOrganizationAdminsForOrg200Response} from "@approvio/api"

export async function listOrgAdminsTask(options: {page: string; limit: string}) {
  const client = getUserClient()
  await handleTask(
    client.listOrganizationAdminsForOrg("default", {
      page: parseInt(options.page),
      limit: parseInt(options.limit)
    }),
    onSuccess,
    "Failed to list admins"
  )
}

function onSuccess(result: ListOrganizationAdminsForOrg200Response) {
  if (result.data.length === 0) {
    console.log("No admins found")
    return
  }

  console.log(`# Admins (${result.pagination.total})`)

  printTable(
    result.data.map(a => ({
      Email: a.email,
      CreatedAt: a.createdAt
    }))
  )
}
