import React, { useEffect, useId, useRef, useState } from 'react'
import '../styles/RecruiterFilters.scss'

interface FilterDropdownProps {
    label: string
    // Current value shown under the label, e.g. "Any country"
    value: React.ReactNode
    active: boolean
    // Wider panel for content that needs room, like the time-zone search
    wide?: boolean
    children: React.ReactNode
}

// Panel widths from RecruiterFilters.scss, used to keep panels on screen
const PANEL_WIDTH = 260
const WIDE_PANEL_WIDTH = 340

// A filter trigger with a popover panel. Closes on a click outside or Escape;
// opening another dropdown counts as a click outside, so only one is open.
export const FilterDropdown = ({
    label,
    value,
    active,
    wide = false,
    children,
}: FilterDropdownProps) => {
    const [open, setOpen] = useState(false)
    // Open leftwards when the panel would run off the right edge
    const [alignRight, setAlignRight] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const panelId = useId()

    useEffect(() => {
        if (!open) return
        const onPointerDown = (event: PointerEvent) => {
            if (!ref.current?.contains(event.target as Node)) setOpen(false)
        }
        document.addEventListener('pointerdown', onPointerDown)
        return () => document.removeEventListener('pointerdown', onPointerDown)
    }, [open])

    return (
        <div
            className="profile-filters__dropdown"
            ref={ref}
            onKeyDown={(event) => {
                // Controls inside the panel stop Escape when they use it
                if (event.key === 'Escape' && open) {
                    setOpen(false)
                    triggerRef.current?.focus()
                }
            }}
        >
            <button
                ref={triggerRef}
                type="button"
                className="profile-filters__trigger"
                data-active={active}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => {
                    const left =
                        triggerRef.current?.getBoundingClientRect().left ?? 0
                    const width = wide ? WIDE_PANEL_WIDTH : PANEL_WIDTH
                    setAlignRight(left + width > window.innerWidth - 16)
                    setOpen(!open)
                }}
            >
                {label}
                <span className="profile-filters__trigger-value">{value}</span>
                <span className="profile-filters__chevron" aria-hidden="true" />
            </button>

            {open && (
                <div
                    className="profile-filters__menu"
                    data-wide={wide}
                    data-align={alignRight ? 'right' : 'left'}
                    id={panelId}
                >
                    {children}
                </div>
            )}
        </div>
    )
}

export interface Option {
    value: string
    label: string
}

interface MultiSelectProps {
    label: string
    // Used in "Search countries…" and "Any country"
    noun: { one: string; many: string }
    options: Option[]
    selected: string[]
    onToggle: (value: string) => void
    // Short lists do not need a search box
    searchable?: boolean
    // Explains how the selection is applied, shown above the options
    hint?: string
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

export const MultiSelect = ({
    label,
    noun,
    options,
    selected,
    onToggle,
    searchable = true,
    hint,
}: MultiSelectProps) => {
    const [search, setSearch] = useState('')
    const visible = options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <FilterDropdown
            label={label}
            value={summary(options, selected, noun)}
            active={selected.length > 0}
        >
            {hint && <p className="profile-filters__hint">{hint}</p>}
            {searchable && (
                <input
                    aria-label={`Search ${noun.many}`}
                    type="search"
                    value={search}
                    autoFocus
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={`Search ${noun.many}…`}
                    className="profile-filters__search"
                />
            )}

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
        </FilterDropdown>
    )
}
