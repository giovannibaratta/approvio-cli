import {Command} from "@commander-js/extra-typings"
import {listSpacesTask} from "./list-spaces"
import {getSpaceTask} from "./get-space"
import {createSpaceTask} from "./create-space"
import {deleteSpaceTask} from "./delete-space"

export function registerSpaceCommands(program: Command) {
  const space = program.command("space").aliases(["spaces"]).description("Manage spaces")

  space
    .command("list")
    .aliases(["ls"])
    .description("List spaces")
    .option("-p, --page <number>", "Page number", "1")
    .option("-l, --limit <number>", "Limit per page", "20")
    .action(async options => listSpacesTask(options))

  space
    .command("get <id>")
    .description("Get space details")
    .action(async id => getSpaceTask(id))

  space
    .command("create")
    .description("Create a new space")
    .requiredOption("-n, --name <name>", "Space name")
    .option("-d, --description <description>", "Space description")
    .action(async options => createSpaceTask(options))

  space
    .command("delete <id>")
    .description("Delete a space")
    .action(async id => deleteSpaceTask(id))
}
