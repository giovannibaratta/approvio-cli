import chalk from "chalk"
import {getUserClient, handleTask} from "../../utils/sdk"

export async function deprecateWorkflowTemplateTask(name: string, options: {cancelActive?: boolean}) {
  const client = getUserClient()
  await handleTask(
    client.deprecateWorkflowTemplate(name, {
      cancelWorkflows: options.cancelActive
    }),
    onSuccess,
    "Failed to deprecate template"
  )
}

function onSuccess() {
  console.log(chalk.green("Workflow template deprecated successfully"))
}
