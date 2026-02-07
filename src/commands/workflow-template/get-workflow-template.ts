import {getUserClient, handleTask} from "../../utils/sdk"
import {printVerticalTable} from "../../utils/output"
import {WorkflowTemplate} from "@approvio/api"

export async function getWorkflowTemplateTask(identifier: string) {
  const client = getUserClient()
  await handleTask(client.getWorkflowTemplate(identifier), onSuccess, "Failed to get template")
}

function onSuccess(template: WorkflowTemplate) {
  printVerticalTable(template)
}
