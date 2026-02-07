import {Command} from "@commander-js/extra-typings"
import {listGroupMembersTask} from "./list-group-members"
import {addGroupMembersTask} from "./add-group-members"
import {removeGroupMembersTask} from "./remove-group-members"

export function registerGroupMemberCommands(program: Command) {
  const member = program.command("group-member").aliases(["gm"]).description("Manage group members")

  member
    .command("list <groupId>")
    .aliases(["ls"])
    .description("List members in a group")
    .option("-p, --page <number>", "Page number", "1")
    .option("-l, --limit <number>", "Limit per page", "20")
    .action(async (groupId, options) => listGroupMembersTask(groupId, options))

  member
    .command("add <groupId>")
    .description("Add members to a group")
    .requiredOption("-i, --ids <ids>", "Comma-separated list of entity IDs and types (type:id)")
    .action(async (groupId, options) => addGroupMembersTask(groupId, options))

  member
    .command("remove <groupId>")
    .description("Remove members from a group")
    .requiredOption("-i, --ids <ids>", "Comma-separated list of entity IDs and types (type:id)")
    .action(async (groupId, options) => removeGroupMembersTask(groupId, options))
}
