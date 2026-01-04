import {decodeJwt} from "jose"

export function getJwtTokenStatus(token: string): {
  isValid: boolean
  isExpired: boolean
  expiresAt: Date
} {
  const payload = decodeJwt(token)

  if (!payload.exp) throw new Error("Token does not have an expiration time")

  const expiresAt = new Date(payload.exp * 1000)
  const isExpired = expiresAt.getTime() < Date.now()

  return {
    isValid: true,
    isExpired,
    expiresAt
  }
}
