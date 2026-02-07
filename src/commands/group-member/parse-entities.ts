import {EntityMembershipAdd, EntityMembershipRemove} from "@approvio/api"

export function parseEntitiesForAdd(idsString: string): EntityMembershipAdd[] {
  return idsString.split(",").map(idWithType => {
    const [entityType, entityId] = idWithType.split(":")

    if (!entityType || !entityId) throw new Error(`Invalid entity type and ID: ${idWithType}`)

    return {entity: {entityId, entityType}}
  })
}

export function parseEntitiesForRemove(idsString: string): EntityMembershipRemove[] {
  return idsString.split(",").map(idWithType => {
    const [entityType, entityId] = idWithType.split(":")

    if (!entityType || !entityId) throw new Error(`Invalid entity type and ID: ${idWithType}`)

    return {entity: {entityId, entityType}}
  })
}
