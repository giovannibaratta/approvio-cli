import {Command} from "commander"
import chalk from "chalk"
import {pipe} from "fp-ts/lib/function.js"
import * as TE from "fp-ts/lib/TaskEither.js"
import {getClient, formatError} from "../utils/sdk.js"
import {UserSummary, Group, Space, WorkflowTemplateSummary} from "@approvio/api"
import {isStatus} from "@approvio/ts-sdk"

const VOTER_USER = {
  email: "voter@localhost.com",
  displayName: "Voter User"
}

export function registerBootstrapCommands(program: Command) {
  program
    .command("bootstrap")
    .description("Bootstrap a development/testing environment (replicates bootstrap-env.ts)")
    .action(async () => {
      console.log(chalk.cyan("--- Starting Bootstrap ---"))
      const client = getClient()

      await pipe(
        TE.Do,
        // 1. Ensure Voter User exists
        TE.chainFirstW(() => {
          console.log(chalk.blue(`Ensuring voter user ${VOTER_USER.email} exists...`))
          return pipe(
            client.createUser({
              email: VOTER_USER.email,
              displayName: VOTER_USER.displayName,
              orgRole: "member"
            }),
            TE.map(() => {
              console.log(chalk.green("Voter user created"))
              return undefined
            }),
            TE.orElseW(error => {
              if (isStatus(error, 409)) {
                console.log(chalk.yellow("Voter user already exists"))
                return TE.right(undefined)
              }
              return TE.left(error)
            })
          )
        }),
        // 2. Fetch Voter User ID
        TE.bindW("voterId", () =>
          pipe(
            client.listUsers({search: VOTER_USER.email}),
            TE.chainW(users => {
              const voter = users.users.find((u: UserSummary) => u.email === VOTER_USER.email)
              if (!voter) return TE.left(new Error("Failed to find voter user after creation/check"))
              console.log(chalk.dim(`Voter User ID: ${voter.id}`))
              return TE.right(voter.id)
            })
          )
        ),
        // 3. Create Group
        TE.bindW("groupId", () => {
          const groupName = "bootstrap-test-group"
          console.log(chalk.blue(`Creating group '${groupName}'...`))
          return pipe(
            client.createGroup({
              name: groupName,
              description: "Group created by bootstrap command"
            }),
            TE.orElseW(error => {
              if (isStatus(error, 409)) {
                console.log(chalk.yellow("Group already exists, fetching ID..."))
                return TE.right(undefined)
              }
              return TE.left(error)
            }),
            TE.chainW(() => client.listGroups()),
            TE.chainW(groups => {
              const g = groups.groups.find((curr: Group) => curr.name === groupName)
              if (!g) return TE.left(new Error("Group not found after creation"))
              console.log(chalk.dim(`Group ID: ${g.id}`))
              return TE.right(g.id)
            })
          )
        }),
        // 4. Create Space
        TE.bindW("spaceId", () => {
          const spaceName = "bootstrap-test-space"
          console.log(chalk.blue(`Creating space '${spaceName}'...`))
          return pipe(
            client.createSpace({
              name: spaceName,
              description: "Space created by bootstrap command"
            }),
            TE.orElseW(error => {
              if (isStatus(error, 409)) {
                console.log(chalk.yellow("Space already exists, fetching ID..."))
                return TE.right(undefined)
              }
              return TE.left(error)
            }),
            TE.chainW(() => client.listSpaces()),
            TE.chainW(spaces => {
              const s = spaces.data.find((curr: Space) => curr.name === spaceName)
              if (!s) return TE.left(new Error("Space not found after creation"))
              console.log(chalk.dim(`Space ID: ${s.id}`))
              return TE.right(s.id)
            })
          )
        }),
        // 5. Create Workflow Template
        TE.bindW("templateId", ({spaceId, groupId}) => {
          const templateName = "Bootstrap Workflow Template"
          console.log(chalk.blue(`Creating template '${templateName}'...`))
          return pipe(
            client.createWorkflowTemplate({
              name: templateName,
              description: "Template created by bootstrap command",
              spaceId: spaceId,
              approvalRule: {
                type: "GROUP_REQUIREMENT",
                groupId: groupId,
                minCount: 1
              }
            }),
            TE.orElseW(error => {
              if (isStatus(error, 409)) {
                console.log(chalk.yellow("Template already exists, fetching ID..."))
                return TE.right(undefined)
              }
              return TE.left(error)
            }),
            TE.chainW(() => client.listWorkflowTemplates()),
            TE.chainW(templates => {
              const t = templates.data.find((curr: WorkflowTemplateSummary) => curr.name === templateName)
              if (!t) return TE.left(new Error("Template ID could not be retrieved"))
              console.log(chalk.dim(`Template ID: ${t.id}`))
              return TE.right(t.id)
            })
          )
        }),
        // 6. Permissions
        TE.chainFirstW(({voterId, groupId, templateId}) => {
          console.log(chalk.blue("Configuring permissions..."))
          return pipe(
            client.addGroupEntities(groupId, {
              entities: [{entity: {entityType: "human", entityId: voterId}}]
            }),
            TE.map(() => {
              console.log(chalk.green("Voter added to group"))
              return undefined
            }),
            TE.orElseW(error => {
              if (isStatus(error, 409)) {
                console.log(chalk.yellow("Voter already in group"))
                return TE.right(undefined)
              }
              return TE.left(error)
            }),
            TE.chainW(() =>
              pipe(
                client.assignUserRoles(voterId, {
                  roles: [
                    {
                      roleName: "WorkflowTemplateVoter",
                      scope: {
                        type: "workflow_template",
                        workflowTemplateId: templateId
                      }
                    }
                  ]
                }),
                TE.map(() => {
                  console.log(chalk.green("Voter roles assigned"))
                  return undefined
                }),
                TE.orElseW(error => {
                  console.error(chalk.red("Failed to assign roles:"), formatError(error))
                  return TE.right(undefined)
                })
              )
            )
          )
        }),
        TE.match(
          error => {
            console.error(chalk.red("\n--- Bootstrap Failed ---"))
            console.error(formatError(error))
          },
          ({voterId, groupId, spaceId, templateId}) => {
            console.log(chalk.cyan("\n--- Bootstrap Complete ---"))
            console.log(
              JSON.stringify(
                {
                  voterId,
                  groupId,
                  spaceId,
                  templateId
                },
                null,
                2
              )
            )
          }
        )
      )()
    })
}
