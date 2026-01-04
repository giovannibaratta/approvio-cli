import {InvalidArgumentError} from "commander"

export function validateEndpoint(endpoint: string): URL {
  try {
    return new URL(endpoint)
  } catch {
    throw new InvalidArgumentError(`Invalid endpoint URL: ${endpoint}`)
  }
}
