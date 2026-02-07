import chalk from "chalk"
import {configManager} from "../../config-manager/config-manager"

export function logoutTask() {
  configManager.logout()
  console.log(chalk.green("Logged out successfully"))
}
