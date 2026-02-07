import {User} from "@approvio/api"
import {handleTask, getUserClient} from "../../utils/sdk"
import {printVerticalTable} from "../../utils/output"
import {ApprovioError, ApprovioUserClient} from "@approvio/ts-sdk"
import {pipe} from "fp-ts/function"
import * as TE from "fp-ts/TaskEither"

export async function createUsersTask(parser: {email: string; name: string; orgRole?: string}) {
  const client = getUserClient()
  await handleTask(createAndRetrieveUser(client, parser), onSuccess, "Failed to create user")
}

function createAndRetrieveUser(
  client: ApprovioUserClient,
  parser: {email: string; name: string; orgRole?: string}
): TE.TaskEither<ApprovioError, User> {
  return pipe(
    client.createUser({
      email: parser.email,
      displayName: parser.name,
      orgRole: parser.orgRole ?? "MEMBER"
    }),
    TE.chain(userId => client.getUser(userId))
  )
}

function onSuccess(result: User) {
  printVerticalTable(result)
}
