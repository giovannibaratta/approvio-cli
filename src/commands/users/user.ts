import {Command} from "@commander-js/extra-typings"
import {listUsersTask} from "./list-users"
import {createUsersTask} from "./create-user"
import {getUserTask} from "./get-user"

export function registerUserCommands(program: Command) {
  const user = program.command("user").aliases(["users"]).description("Manage users")

  user
    .command("list")
    .aliases(["ls"])
    .description("List users")
    .option("-s, --search <query>", "Search query")
    .option("-p, --page <number>", "Page number", "1")
    .option("-l, --limit <number>", "Limit per page", "20")
    .action(async options => listUsersTask(options))

  user
    .command("create")
    .description("Create a new user")
    .requiredOption("-e, --email <email>", "User email")
    .requiredOption("-n, --name <name>", "User display name")
    .option("-r, --org-role <role>", "Organization role (admin or member)", "member")
    .action(async options => createUsersTask(options))

  user
    .command("get <id>")
    .description("Get user details")
    .action(async id => getUserTask(id))
}
