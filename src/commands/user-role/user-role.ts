import {Command} from "@commander-js/extra-typings"
import {assignUserRolesTask} from "./assign-user-roles"
import {removeUserRolesTask} from "./remove-user-roles"

export function registerUserRoleCommands(program: Command) {
  const role = program.command("user-role").description("Manage user roles")

  role
    .command("assign <userId>")
    .description("Assign roles to a user")
    .requiredOption("-r, --roles <roles>", "Comma-separated list of roles (roleName:scopeType:scopeId?)")
    .action(async (userId, options) => assignUserRolesTask(userId, options))

  role
    .command("remove <userId>")
    .description("Remove roles from a user")
    .requiredOption("-r, --roles <roles>", "Comma-separated list of roles (roleName:scopeType:scopeId?)")
    .action(async (userId, options) => removeUserRolesTask(userId, options))
}
