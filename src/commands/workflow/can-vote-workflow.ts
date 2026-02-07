import chalk from "chalk"
import {getClient, handleTask} from "../../utils/sdk"
import {CanVoteResponse} from "@approvio/api"

export async function canVoteWorkflowTask(id: string) {
  const client = getClient()
  await handleTask(client.canVoteOnWorkflow(id), onSuccess, "Failed to check vote eligibility")
}

function onSuccess(result: CanVoteResponse) {
  if (result.canVote) {
    console.log(chalk.green("You are eligible to vote on this workflow."))
  } else {
    console.log(chalk.yellow("You are NOT eligible to vote on this workflow."))
    if (result.cantVoteReason) console.log(`Reason: ${result.cantVoteReason}`)
  }
}
