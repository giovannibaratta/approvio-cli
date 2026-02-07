import {Command} from "@commander-js/extra-typings"
import {listGroupsTask} from "./list-groups"
import {getGroupTask} from "./get-group"
import {createGroupTask} from "./create-group"

export function registerGroupCommands(program: Command) {
  const group = program.command("group").aliases(["groups"]).description("Manage groups")

  group
    .command("list")
    .aliases(["ls"])
    .description("List groups")
    .option("-p, --page <number>", "Page number", "1")
    .option("-l, --limit <number>", "Limit per page", "20")
    .action(async options => listGroupsTask(options))

  group
    .command("get <identifier>")
    .description("Get group details")
    .action(async identifier => getGroupTask(identifier))

  group
    .command("create")
    .description("Create a new group")
    .requiredOption("-n, --name <name>", "Group name")
    .option("-d, --description <description>", "Group description")
    .action(async options => createGroupTask(options))
}
