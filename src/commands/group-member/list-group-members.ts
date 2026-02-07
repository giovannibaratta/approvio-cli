import {getUserClient, handleTask} from "../../utils/sdk"
import {printTable} from "console-table-printer"
import {AgentGet200Response, GroupMembership, User} from "@approvio/api"
import {pipe} from "fp-ts/lib/function"
import * as TE from "fp-ts/lib/TaskEither"
import {ApprovioError, ApprovioUserClient} from "@approvio/ts-sdk"

type GroupMember = (User & {entityType: "human"}) | (AgentGet200Response & {entityType: "agent"})

export async function listGroupMembersTask(groupId: string, options: {page: string; limit: string}) {
  const client = getUserClient()
  await handleTask(
    listEntitiesAndFetchDetails(client, groupId, parseInt(options.page), parseInt(options.limit)),
    onSuccess,
    "Failed to list members"
  )
}

function listEntitiesAndFetchDetails(client: ApprovioUserClient, groupId: string, page: number, limit: number) {
  return pipe(
    client.listGroupEntities(groupId, {page, limit}),
    TE.map(response => response.entities),
    TE.chainW(
      TE.traverseArray<GroupMembership, GroupMember, ApprovioError>(e => {
        switch (e.entity.entityType) {
          case "human":
            return pipe(
              client.getUser(e.entity.entityId),
              TE.map(user => ({...user, entityType: "human"}))
            )
          case "agent":
            return pipe(
              client.getAgent(e.entity.entityId),
              TE.map(agent => ({...agent, entityType: "agent"}))
            )
          default:
            return TE.left(new Error(`Unknown entity type: ${e.entity.entityType}`))
        }
      })
    ),
    // Force a mutable array to satisfy the type checker
    TE.map(members => [...members])
  )
}

function onSuccess(result: GroupMember[]) {
  printTable(
    result.map(e => {
      return {
        MemberID: e.id,
        Name: e.entityType === "human" ? e.displayName : e.agentName,
        Type: e.entityType
      }
    })
  )
}
