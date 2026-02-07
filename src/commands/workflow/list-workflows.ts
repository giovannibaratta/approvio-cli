import {getClient, handleTask} from "../../utils/sdk"
import {printTable} from "console-table-printer"
import {ListWorkflows200Response} from "@approvio/api"

export async function listWorkflowsTask(options: {
  page: string
  limit: string
  includeTemplate?: boolean
  onlyActive?: boolean
}) {
  const client = getClient()
  const include = options.includeTemplate ? ["workflow-template"] : undefined

  await handleTask(
    client.listWorkflows({
      page: parseInt(options.page),
      limit: parseInt(options.limit),
      include,
      includeOnlyNonTerminalState: options.onlyActive
    }),
    onSuccess,
    "Failed to list workflows"
  )
}

function onSuccess(result: ListWorkflows200Response) {
  printTable(
    result.data.map(w => ({
      ID: w.id,
      Name: w.name,
      Status: w.status,
      CreatedAt: w.createdAt
    }))
  )
}
