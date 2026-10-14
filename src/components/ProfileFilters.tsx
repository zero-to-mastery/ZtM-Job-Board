import React from 'react'
import '../styles/RecruiterFilters.scss'
import { CountryOption } from '../util/countryFilters'
import { RoleOption } from '../util/roleFilters'
import { FilterDropdown, MultiSelect } from './FilterDropdown'

interface ProfileFiltersProps {
    countries: CountryOption[]
    selectedCountries: string[]
    onCountryChange: (countryCode: string) => void
    roles: RoleOption[]
    selectedRoles: string[]
    onRoleChange: (roleId: string) => void
    // Declared skills across all profiles, see src/util/skills.js
    skills: string[]
    selectedSkills: string[]
    onSkillChange: (skill: string) => void
}

// Skill, country and role multi-selects. Sort, seniority and the other
// recruiter filters live in DiscoveryFilters and RecruiterFilters.
const ProfileFilters = ({
    countries,
    selectedCountries,
    onCountryChange,
    roles,
    selectedRoles,
    onRoleChange,
    skills,
    selectedSkills,
    onSkillChange,
}: ProfileFiltersProps) => (
    <div className="profile-filters">
        {skills.length === 0 ? (
            <FilterDropdown
                label="Skills"
                value="None declared yet"
                active={false}
            >
                <p className="profile-filters__hint">
                    No profiles have declared skills yet. Developers can add a
                    skills list to their submission to appear in skills-based
                    searches.
                </p>
            </FilterDropdown>
        ) : (
            <MultiSelect
                label="Skills"
                noun={{ one: 'skill', many: 'skills' }}
                options={skills.map((skill) => ({
                    value: skill,
                    label: skill,
                }))}
                selected={selectedSkills}
                onToggle={onSkillChange}
                hint="Matches all selected skills. Skills are self-reported."
            />
        )}
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
