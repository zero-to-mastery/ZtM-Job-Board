import React, { useEffect, useRef, useState } from 'react'
import '../styles/RecruiterFilters.scss'
import { CountryOption } from '../util/countryFilters'
import { RoleOption } from '../util/roleFilters'

interface ProfileFiltersProps {
    countries: CountryOption[]
    selectedCountries: string[]
    onCountryChange: (countryCode: string) => void
    roles: RoleOption[]
    selectedRoles: string[]
    onRoleChange: (roleId: string) => void
}

interface Option {
    value: string
    label: string
}

interface MultiSelectProps {
    id: string
    label: string
    // Plural used in "Search countries…" and "Any country"
    noun: { one: string; many: string }
    options: Option[]
    selected: string[]
    open: boolean
    onOpenChange: (open: boolean) => void
    onToggle: (value: string) => void
}

// "Any country", "United States", "United States +2"
const summary = (
    options: Option[],
    selected: string[],
    noun: MultiSelectProps['noun']
) => {
    if (selected.length === 0) return `Any ${noun.one}`
    const first =
        options.find(({ value }) => value === selected[0])?.label ?? selected[0]
    return selected.length === 1 ? first : `${first} +${selected.length - 1}`
}

const MultiSelect = ({
    id,
    label,
    noun,
    options,
    selected,
    open,
    onOpenChange,
    onToggle,
}: MultiSelectProps) => {
    const [search, setSearch] = useState('')
    const ref = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)

    // Close on a click outside the dropdown
    useEffect(() => {
        if (!open) return
        const onPointerDown = (event: PointerEvent) => {
            if (!ref.current?.contains(event.target as Node)) {
                onOpenChange(false)
            }
        }
        document.addEventListener('pointerdown', onPointerDown)
        return () => document.removeEventListener('pointerdown', onPointerDown)
    }, [open, onOpenChange])

    const visible = options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
    )
    const menuId = `${id}-filter-options`

    return (
        <div
            className="profile-filters__dropdown"
            ref={ref}
            onKeyDown={(event) => {
                if (event.key === 'Escape' && open) {
                    event.stopPropagation()
                    onOpenChange(false)
                    triggerRef.current?.focus()
                }
            }}
        >
            <button
                ref={triggerRef}
                type="button"
                className="profile-filters__trigger"
                data-active={selected.length > 0}
                aria-expanded={open}
                aria-controls={menuId}
                onClick={() => onOpenChange(!open)}
            >
                {label}
                <span className="profile-filters__trigger-value">
                    {summary(options, selected, noun)}
                </span>
                <span className="profile-filters__chevron" aria-hidden="true" />
            </button>

            {open && (
                <div className="profile-filters__menu" id={menuId}>
                    <input
                        aria-label={`Search ${noun.many}`}
                        type="search"
                        value={search}
                        autoFocus
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={`Search ${noun.many}…`}
                        className="profile-filters__search"
                    />

                    <div className="profile-filters__options">
                        {visible.map((option) => (
                            <label
                                key={option.value}
                                className="profile-filters__option"
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.includes(option.value)}
                                    onChange={() => onToggle(option.value)}
                                />{' '}
                                {option.label}
                            </label>
                        ))}
                        {visible.length === 0 && (
                            <p className="profile-filters__empty">
                                No {noun.many} match “{search}”
                            </p>
                        )}
                    </div>

                    <div className="profile-filters__menu-footer">
                        <span>{selected.length} selected</span>
                        <button
                            type="button"
                            className="profile-filters__link"
                            disabled={selected.length === 0}
                            onClick={() => selected.forEach(onToggle)}
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
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
}: ProfileFiltersProps) => {
    const [openFilter, setOpenFilter] = useState('')
    const openChange = (id: string) => (open: boolean) =>
        setOpenFilter((current) => (open ? id : current === id ? '' : current))

    return (
        <div className="profile-filters">
            <MultiSelect
                id="country"
                label="Country"
                noun={{ one: 'country', many: 'countries' }}
                options={countries.map(({ code, label }) => ({
                    value: code,
                    label,
                }))}
                selected={selectedCountries}
                open={openFilter === 'country'}
                onOpenChange={openChange('country')}
                onToggle={onCountryChange}
            />
            <MultiSelect
                id="role"
                label="Role"
                noun={{ one: 'role', many: 'roles' }}
                options={roles.map(({ id, label }) => ({ value: id, label }))}
                selected={selectedRoles}
                open={openFilter === 'role'}
                onOpenChange={openChange('role')}
                onToggle={onRoleChange}
            />
        </div>
    )
}

export default ProfileFilters
