import {Command} from "@commander-js/extra-typings"
import {listWorkflowsTask} from "./list-workflows"
import {getWorkflowTask} from "./get-workflow"
import {createWorkflowTask} from "./create-workflow"
import {voteWorkflowTask} from "./vote-workflow"
import {canVoteWorkflowTask} from "./can-vote-workflow"
import {validateVoteType} from "../../utils/validation"

export function registerWorkflowCommands(program: Command) {
  const workflow = program.command("workflow").aliases(["workflows"]).description("Manage workflows")

  workflow
    .command("list")
    .aliases(["ls"])
    .description("List workflows")
    .option("-p, --page <number>", "Page number", "1")
    .option("-l, --limit <number>", "Limit per page", "20")
    .option("--include-template", "Include workflow template")
    .option("--only-active", "Include only non-terminal state workflows")
    .action(async options => listWorkflowsTask(options))

  workflow
    .command("get <id>")
    .description("Get workflow details")
    .option("--include-template", "Include workflow template")
    .action(async (id, options) => getWorkflowTask(id, options))

  workflow
    .command("create")
    .description("Create a new workflow")
    .requiredOption("-n, --name <name>", "Workflow name")
    .requiredOption("-t, --template <id>", "Workflow template ID (UUID)")
    .action(async options => createWorkflowTask(options))

  workflow
    .command("vote <id>")
    .description("Vote on a workflow")
    .requiredOption("-t, --type <type>", "Vote type (APPROVE, VETO, or WITHDRAW)", validateVoteType)
    .option("-r, --reason <reason>", "Reason for the vote")
    .action(async (id, options) => voteWorkflowTask(id, options))

  workflow
    .command("can-vote <id>")
    .description("Check if you can vote on a workflow")
    .action(async id => canVoteWorkflowTask(id))
}
