import {Command} from "@commander-js/extra-typings"
import {loginTask} from "./login"
import {statusTask} from "./status"
import {registerAgentTask} from "./register-agent"
import {logoutTask} from "./logout"
import {validateEndpoint} from "../../utils/validation"

export function registerAuthCommands(program: Command) {
  const auth = program.command("auth").description("Authenticate with Approvio")

  auth
    .command("login")
    .description("Log in as a human user (OIDC)")
    .requiredOption("-e, --endpoint <url>", "Approvio API endpoint", validateEndpoint)
    .action(async options => loginTask(options))

  auth
    .command("status")
    .description("Show authentication status")
    .action(() => statusTask())

  auth
    .command("register-agent")
    .description("Register an agent with local configuration")
    .requiredOption("-n, --name <name>", "Agent name")
    .requiredOption("-k, --private-key <path>", "Path to private key file")
    .requiredOption("-p, --public-key <path>", "Path to public key file")
    .requiredOption("-e, --endpoint <url>", "Approvio API endpoint", validateEndpoint)
    .action(async options => registerAgentTask(options))

  auth
    .command("logout")
    .description("Log out and clear credentials")
    .action(() => logoutTask())
}
