import {InvalidArgumentError} from "commander"
import {WorkflowVoteRequestVoteType} from "@approvio/api"

export function validateEndpoint(endpoint: string): URL {
  try {
    return new URL(endpoint)
  } catch {
    throw new InvalidArgumentError(`Invalid endpoint URL: ${endpoint}`)
  }
}

export function validateVoteType(value: string): WorkflowVoteRequestVoteType["type"] {
  const upperValue = value.toUpperCase()
  switch (upperValue) {
    case "APPROVE":
      return "APPROVE"
    case "VETO":
      return "VETO"
    case "WITHDRAW":
      return "WITHDRAW"
    default:
      throw new InvalidArgumentError(`Invalid vote type: ${value}. Expected APPROVE, VETO, or WITHDRAW.`)
  }
}
