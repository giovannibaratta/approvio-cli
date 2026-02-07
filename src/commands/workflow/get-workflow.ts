import {getClient, handleTask} from "../../utils/sdk"
import {printVerticalTable} from "../../utils/output"
import {Workflow} from "@approvio/api"

export async function getWorkflowTask(id: string, options: {includeTemplate?: boolean}) {
  const client = getClient()
  const include = options.includeTemplate ? ["workflow-template"] : undefined

  await handleTask(client.getWorkflow(id, {include}), onSuccess, "Failed to get workflow")
}

function onSuccess(workflow: Workflow) {
  printVerticalTable(workflow)
}
