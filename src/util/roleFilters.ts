import { ROLE_IDS, getRoleLabel } from './roles/roleTaxonomy.js'

export interface RoleOption {
    id: string
    label: string
}

interface WithNormalizedRoles {
    normalized?: { roles?: string[] }
}

// Canonical role ids resolved for a profile during JSON aggregation.
export const getPersonRoleIds = (person: WithNormalizedRoles) =>
    person.normalized?.roles ?? []

// Display labels of a profile's roles, e.g. for free-text search.
export const getPersonRoleLabels = (person: WithNormalizedRoles) =>
    getPersonRoleIds(person).map(getRoleLabel)

// One option per canonical role present in the data, sorted by label.
// Unclassified profiles contribute no option.
export const getRoleOptions = (people: WithNormalizedRoles[]): RoleOption[] => {
    const ids = new Set<string>()
    people.forEach((person) =>
        getPersonRoleIds(person).forEach((id) => ids.add(id))
    )
    return ROLE_IDS.filter((id) => ids.has(id))
        .map((id) => ({ id, label: getRoleLabel(id) }))
        .sort((a, b) => a.label.localeCompare(b.label, 'en'))
}

// A profile matches if any of its roles is selected. An empty selection
// matches everyone.
export const filterByRoles = <T extends WithNormalizedRoles>(
    people: T[],
    selectedIds: string[]
): T[] =>
    selectedIds.length === 0
        ? people
        : people.filter((person) =>
              getPersonRoleIds(person).some((id) => selectedIds.includes(id))
          )
