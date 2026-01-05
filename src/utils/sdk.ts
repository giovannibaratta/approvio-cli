import {ApprovioUserClient, UserAuthenticator, ApprovioError} from "@approvio/ts-sdk"
import {configManager} from "../config-manager/config-manager"
import * as E from "fp-ts/Either"
import {TaskEither} from "fp-ts/TaskEither"

export function getClient() {
  const profile = configManager.getActiveProfileOrThrow()

  const endpoint = profile.endpoint
  const profileType = profile.authType

  const onTokenRefreshed = (accessToken: string, refreshToken: string) => {
    configManager.updateActiveProfile({...profile, accessToken, refreshToken})
  }

  switch (profileType) {
    case "human": {
      const auth = new UserAuthenticator(endpoint, profile.accessToken, profile.refreshToken, onTokenRefreshed)

      return new ApprovioUserClient({endpoint}, auth)
    }
    case "agent": {
      throw new Error("Agent authentication is not supported yet")
    }
  }
}

/**
 * Unwraps a TaskEither, throwing the error if it's a Left.
 */
export async function unwrap<A>(te: TaskEither<ApprovioError, A>): Promise<A> {
  const result = await te()
  if (E.isLeft(result)) {
    throw result.left
  }
  return result.right
}

/**
 * Formats an error for display.
 */
export function formatError(error: ApprovioError): string {
  if (error instanceof Error) return error.message

  return `${error.message} (error code: ${error.code})`
}
