import {
  ApprovioUserClient,
  UserAuthenticator,
  ApprovioError,
  AgentAuthenticator,
  ApprovioAgentClient
} from "@approvio/ts-sdk"
import fs from "node:fs"
import {configManager} from "../config-manager/config-manager"
import * as E from "fp-ts/Either"
import {TaskEither} from "fp-ts/TaskEither"

export function getClient(): ApprovioUserClient | ApprovioAgentClient {
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
      const privateKey = fs.readFileSync(profile.privateKeyPath, "utf-8")
      const auth = new AgentAuthenticator(
        endpoint,
        privateKey,
        profile.accessToken,
        profile.refreshToken,
        onTokenRefreshed
      )

      return new ApprovioAgentClient({endpoint}, auth)
    }
  }
}

/**
 * Returns an ApprovioUserClient, throwing an error if the active profile is an agent.
 */
export function getUserClient(): ApprovioUserClient {
  const client = getClient()
  if (!(client instanceof ApprovioUserClient))
    throw new Error("This command requires a human user profile. Please switch to a user profile or log in.")

  return client
}

/**
 * Returns an ApprovioAgentClient, throwing an error if the active profile is not an agent.
 */
export function getAgentClient(): ApprovioAgentClient {
  const client = getClient()
  if (!(client instanceof ApprovioAgentClient)) throw new Error("This command requires an agent profile.")
  return client
}

/**
 * Unwraps a TaskEither, throwing the error if it's a Left.
 */
export async function unwrap<A>(te: TaskEither<ApprovioError, A>): Promise<A> {
  const result = await te()

  if (E.isLeft(result)) handleLeft(result.left)
  return result.right
}

function handleLeft(error: ApprovioError): never {
  if (error instanceof Error) throw error
  throw new Error(formatError(error))
}

/**
 * Formats an error for display.
 */
export function formatError(error: ApprovioError): string {
  if (error instanceof Error) return error.message
  return `${error.message} (error code: ${error.code})`
}
