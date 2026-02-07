import chalk from "chalk"
import {configManager} from "../../config-manager/config-manager"
import {getJwtTokenStatus} from "../../utils/jwt"

export function statusTask() {
  const profile = configManager.getActiveProfileOrThrow()
  console.log(`Profile: ${chalk.cyan(profile.name)}`)
  console.log(`Endpoint: ${chalk.cyan(profile.endpoint)}`)
  console.log(`Auth Type: ${chalk.cyan(profile.authType)}`)

  const accessStatus = getJwtTokenStatus(profile.accessToken)

  console.log(
    `Access Token: ${accessStatus.isExpired ? chalk.red(`expired at ${accessStatus.expiresAt}`) : chalk.green(`valid until ${accessStatus.expiresAt}`)}`
  )
}
