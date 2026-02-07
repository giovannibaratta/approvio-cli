import {Command} from "@commander-js/extra-typings"
import {listOrgAdminsTask} from "./list-org-admins"
import {addOrgAdminTask} from "./add-org-admin"
import {removeOrgAdminTask} from "./remove-org-admin"

export function registerOrgAdminCommands(program: Command) {
  const admin = program.command("org-admin").description("Manage organization administrators")

  admin
    .command("list")
    .description("List organization administrators")
    .option("-p, --page <number>", "Page number", "1")
    .option("-l, --limit <number>", "Limit per page", "20")
    .action(async options => listOrgAdminsTask(options))

  admin
    .command("add")
    .description("Add an organization administrator")
    .requiredOption("-e, --email <email>", "Admin email")
    .action(async options => addOrgAdminTask(options))

  admin
    .command("remove")
    .description("Remove an organization administrator")
    .requiredOption("-i, --id <userId>", "Admin user ID")
    .action(async options => removeOrgAdminTask(options))
}
