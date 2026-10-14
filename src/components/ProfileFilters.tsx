import React from 'react'
import '../styles/RecruiterFilters.scss'
import { CountryOption } from '../util/countryFilters'
import { RoleOption } from '../util/roleFilters'
import { MultiSelect } from './FilterDropdown'

interface ProfileFiltersProps {
    countries: CountryOption[]
    selectedCountries: string[]
    onCountryChange: (countryCode: string) => void
    roles: RoleOption[]
    selectedRoles: string[]
    onRoleChange: (roleId: string) => void
}

// Country and role multi-selects. Sort, seniority and the other recruiter
// filters live in DiscoveryFilters and RecruiterFilters.
const ProfileFilters = ({
    countries,
    selectedCountries,
    onCountryChange,
    roles,
    selectedRoles,
    onRoleChange,
}: ProfileFiltersProps) => (
    <div className="profile-filters">
        <MultiSelect
            label="Country"
            noun={{ one: 'country', many: 'countries' }}
            options={countries.map(({ code, label }) => ({
                value: code,
                label,
            }))}
            selected={selectedCountries}
            onToggle={onCountryChange}
        />
        <MultiSelect
            label="Role"
            noun={{ one: 'role', many: 'roles' }}
            options={roles.map(({ id, label }) => ({ value: id, label }))}
            selected={selectedRoles}
            onToggle={onRoleChange}
        />
    </div>
)

export default ProfileFilters
