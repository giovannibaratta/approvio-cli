import {getUserClient, handleTask} from "../../utils/sdk"
import {WorkflowTemplate, WorkflowTemplateCreate, WorkflowAction, ApprovalRule} from "@approvio/api"
import {printVerticalTable} from "../../utils/output"
import {readTemplateFile} from "../../utils/file"

export async function createWorkflowTemplateTask(options: {
  name: string
  description?: string
  file: string
  spaceId: string
  expiresInHours?: string
}) {
  const client = getUserClient()
  const data = readTemplateFile<{
    workflowTemplate: {
      approvalRule: ApprovalRule
      actions?: WorkflowAction[]
    }
  }>(options.file)

  const {approvalRule, actions} = data.workflowTemplate

  await handleTask(
    client.createWorkflowTemplate({
      name: options.name,
      description: options.description,
      spaceId: options.spaceId,
      defaultExpiresInHours: options.expiresInHours ? parseInt(options.expiresInHours) : undefined,
      approvalRule,
      actions
    } as WorkflowTemplateCreate),
    onSuccess,
    "Failed to create template"
  )
}

function onSuccess(template: WorkflowTemplate) {
  printVerticalTable(template)
}
