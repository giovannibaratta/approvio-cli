import {getUserClient, handleTask} from "../../utils/sdk"
import {printTable} from "console-table-printer"
import {ListWorkflowTemplates200Response} from "@approvio/api"

export async function listWorkflowTemplatesTask(options: {page: string; limit: string}) {
  const client = getUserClient()
  await handleTask(
    client.listWorkflowTemplates({
      page: parseInt(options.page),
      limit: parseInt(options.limit)
    }),
    onSuccess,
    "Failed to list templates"
  )
}

function onSuccess(result: ListWorkflowTemplates200Response) {
  printTable(
    result.data.map(t => ({
      ID: t.id,
      Name: t.name,
      Description: t.description,
      CreatedAt: t.createdAt
    }))
  )
}
