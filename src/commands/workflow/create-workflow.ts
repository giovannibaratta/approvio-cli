import chalk from "chalk"
import {getClient, handleTask} from "../../utils/sdk"

export async function createWorkflowTask(options: {name: string; template: string}) {
  const client = getClient()

  await handleTask(
    client.createWorkflow({
      name: options.name,
      workflowTemplateId: options.template
    }),
    onSuccess,
    "Failed to create workflow"
  )
}

function onSuccess() {
  console.log(chalk.green("Workflow created successfully"))
}
