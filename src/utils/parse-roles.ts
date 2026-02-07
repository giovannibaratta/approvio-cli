import {RoleOperationItem, RoleScope} from "@approvio/api"

export function parseRoles(rolesString: string): RoleOperationItem[] {
  return rolesString.split(",").map(r => {
    const [roleName, scopeType, scopeId] = r.split(":")

    if (!roleName || !scopeType || !scopeId) throw new Error(`Invalid role: ${r}`)

    let scope: RoleScope
    if (scopeType === "org") scope = {type: "org"}
    else if (scopeType === "group") scope = {type: "group", groupId: scopeId}
    else if (scopeType === "space") scope = {type: "space", spaceId: scopeId}
    else if (scopeType === "workflow_template") scope = {type: "workflow_template", workflowTemplateId: scopeId}
    else throw new Error(`Invalid scope type: ${scopeType}`)

    return {roleName, scope}
  })
}
