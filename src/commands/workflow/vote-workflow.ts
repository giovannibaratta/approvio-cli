import chalk from "chalk"
import {getClient, handleTask} from "../../utils/sdk"
import {WorkflowVoteRequestVoteType} from "@approvio/api"

import {pipe} from "fp-ts/function"
import * as TE from "fp-ts/TaskEither"
import {ApprovioAgentClient, ApprovioUserClient} from "@approvio/ts-sdk"

export async function voteWorkflowTask(
  id: string,
  options: {type: WorkflowVoteRequestVoteType["type"]; reason?: string}
) {
  const client = getClient()

  if (options.type === "APPROVE") {
    await handleTask(retrieveGroupsAndVote(client, id, options), onSuccess, "Failed to vote on workflow")
  } else {
    await handleTask(
      client.voteOnWorkflow(id, {
        reason: options.reason,
        voteType: {
          type: options.type
        } as WorkflowVoteRequestVoteType
      }),
      onSuccess,
      "Failed to vote on workflow"
    )
  }
}

function retrieveGroupsAndVote(
  client: ApprovioUserClient | ApprovioAgentClient,
  id: string,
  options: {type: WorkflowVoteRequestVoteType["type"]; reason?: string}
) {
  return pipe(
    client.getEntityInfo(),
    TE.map(info => info.groups.map(g => g.groupId)),
    TE.chain(groups =>
      client.voteOnWorkflow(id, {
        reason: options.reason,
        voteType: {
          type: "APPROVE",
          votedForGroups: groups
        }
      })
    )
  )
}

function onSuccess() {
  console.log(chalk.green("Vote cast successfully"))
}
