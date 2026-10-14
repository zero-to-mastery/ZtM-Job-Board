import React, { useState } from 'react'
import '../styles/RecruiterFilters.scss'
import { LEVEL_NOT_STATED, PeopleFilters } from '../util/filterPeople'
import { ContactSignal } from '../util/contactLinks'
import {
    browserTimeZone,
    getTimeZoneGroups,
    searchTimeZones,
    timeZoneLabel,
} from '../util/timezone'

const timeZoneGroups = getTimeZoneGroups()
const timeZones = timeZoneGroups.flatMap(({ zones }) => zones)

export interface LevelOption {
    // A value from SENIORITY_LEVELS, or LEVEL_NOT_STATED
    value: string
    count: number
}

export interface SignalOption {
    value: ContactSignal
    label: string
    count: number
}

// "senior" -> "Senior", LEVEL_NOT_STATED -> "Not stated"
export const levelLabel = (value: string) =>
    value === LEVEL_NOT_STATED
        ? 'Not stated'
        : value.charAt(0).toUpperCase() + value.slice(1)

interface SeniorityFilterProps {
    levels: LevelOption[]
    value: string
    onChange: (level: string) => void
}

// Single-choice seniority, styled like the country and role triggers
export const SeniorityFilter = ({
    levels,
    value,
    onChange,
}: SeniorityFilterProps) => (
    <label className="recruiter-filters__select" data-active={value !== ''}>
        <span>Seniority</span>
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
        >
            <option value="">Any level</option>
            {levels.map((level) => (
                <option key={level.value} value={level.value}>
                    {levelLabel(level.value)} ({level.count})
                </option>
            ))}
        </select>
        <span className="profile-filters__chevron" aria-hidden="true" />
    </label>
)

// Shortcuts for the overlap slider
const OVERLAP_PRESETS = [0, 2, 4, 6]

interface RecruiterFiltersProps {
    signals: SignalOption[]
    filters: PeopleFilters
    onSignalChange: (signal: ContactSignal) => void
    onOverlapChange: (overlap: Partial<PeopleFilters['overlap']>) => void
}

interface ChipProps {
    pressed: boolean
    onClick: () => void
    children: React.ReactNode
}

const Chip = ({ pressed, onClick, children }: ChipProps) => (
    <button
        type="button"
        className="recruiter-filters__chip"
        aria-pressed={pressed}
        onClick={onClick}
    >
        {children}
    </button>
)

// Time-zone overlap and contact-signal filters shared by both views.
// Country and role filters live in ProfileFilters.
const RecruiterFilters = ({
    signals,
    filters,
    onSignalChange,
    onOverlapChange,
}: RecruiterFiltersProps) => {
    const [timeZoneQuery, setTimeZoneQuery] = useState(() =>
        timeZoneLabel(filters.overlap.timeZone)
    )
    const [timeZonePickerOpen, setTimeZonePickerOpen] = useState(false)
    const [activeTimeZoneIndex, setActiveTimeZoneIndex] = useState(-1)
    const [editingTimeZone, setEditingTimeZone] = useState(false)

    const timeZoneResults = searchTimeZones(timeZoneQuery, timeZones)

    const selectTimeZone = (timeZone: string) => {
        onOverlapChange({ timeZone })
        setTimeZoneQuery(timeZoneLabel(timeZone))
        setTimeZonePickerOpen(false)
        setEditingTimeZone(false)
    }

    const startTimeZoneSearch = () => {
        if (editingTimeZone) return
        setEditingTimeZone(true)
        setTimeZoneQuery('')
        setTimeZonePickerOpen(true)
        setActiveTimeZoneIndex(-1)
    }

    const resetTimeZoneToLocal = () => {
        const localTimeZone = browserTimeZone()
        onOverlapChange({ timeZone: localTimeZone })
        setTimeZoneQuery(timeZoneLabel(localTimeZone))
        setTimeZonePickerOpen(false)
        setEditingTimeZone(false)
    }

    const handleTimeZoneKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === 'Escape') {
            setTimeZoneQuery(timeZoneLabel(filters.overlap.timeZone))
            setTimeZonePickerOpen(false)
            setEditingTimeZone(false)
        } else if (event.key === 'ArrowDown' && timeZoneResults.length > 0) {
            event.preventDefault()
            setTimeZonePickerOpen(true)
            setActiveTimeZoneIndex((index) =>
                Math.min(index + 1, timeZoneResults.length - 1)
            )
        } else if (event.key === 'ArrowUp' && timeZoneResults.length > 0) {
            event.preventDefault()
            setActiveTimeZoneIndex((index) => Math.max(index - 1, 0))
        } else if (
            event.key === 'Enter' &&
            timeZonePickerOpen &&
            timeZoneResults[Math.max(activeTimeZoneIndex, 0)]
        ) {
            event.preventDefault()
            selectTimeZone(
                timeZoneResults[Math.max(activeTimeZoneIndex, 0)].value
            )
        }
    }

    return (
        <div className="recruiter-filters">
            <fieldset className="recruiter-filters__group">
                <legend>
                    Working-hours overlap
                    <span className="recruiter-filters__legend-hint">
                        9–5 in each person's local time
                    </span>
                </legend>
                <div className="recruiter-filters__overlap">
                    <div className="recruiter-filters__timezone">
                        <span>My time zone</span>
                        <div className="recruiter-filters__timezone-picker">
                            <input
                                type="text"
                                role="combobox"
                                aria-label="Search time zones by city or region"
                                aria-autocomplete="list"
                                aria-expanded={
                                    timeZonePickerOpen &&
                                    timeZoneQuery.trim().length >= 2
                                }
                                aria-controls="time-zone-options"
                                aria-activedescendant={
                                    timeZonePickerOpen &&
                                    timeZoneResults[activeTimeZoneIndex]
                                        ? `time-zone-option-${activeTimeZoneIndex}`
                                        : undefined
                                }
                                autoComplete="off"
                                value={timeZoneQuery}
                                placeholder="City, region, UTC-5, GMT+2:30"
                                onFocus={startTimeZoneSearch}
                                onClick={startTimeZoneSearch}
                                onChange={(event) => {
                                    setTimeZoneQuery(event.target.value)
                                    setActiveTimeZoneIndex(-1)
                                    setTimeZonePickerOpen(true)
                                }}
                                onKeyDown={handleTimeZoneKeyDown}
                                onBlur={() => {
                                    setTimeZonePickerOpen(false)
                                    setEditingTimeZone(false)
                                    setTimeZoneQuery(
                                        timeZoneLabel(filters.overlap.timeZone)
                                    )
                                }}
                            />
                            {editingTimeZone && timeZoneQuery && (
                                <button
                                    type="button"
                                    className="recruiter-filters__timezone-clear"
                                    aria-label="Reset time zone to my current time zone"
                                    title="Reset to my current time zone"
                                    onMouseDown={(event) =>
                                        event.preventDefault()
                                    }
                                    onClick={resetTimeZoneToLocal}
                                >
                                    ×
                                </button>
                            )}
                            {timeZonePickerOpen &&
                                timeZoneQuery.trim().length >= 2 && (
                                    <div
                                        className="recruiter-filters__timezone-results"
                                        id="time-zone-options"
                                        role="listbox"
                                        aria-label="Matching time zones"
                                    >
                                        {timeZoneResults.length > 0 ? (
                                            timeZoneResults.map(
                                                (timeZone, index) => (
                                                    <button
                                                        key={timeZone.value}
                                                        type="button"
                                                        id={`time-zone-option-${index}`}
                                                        role="option"
                                                        aria-selected={
                                                            timeZone.value ===
                                                            filters.overlap
                                                                .timeZone
                                                        }
                                                        className="recruiter-filters__timezone-option"
                                                        data-active={
                                                            index ===
                                                            activeTimeZoneIndex
                                                        }
                                                        onMouseDown={(event) =>
                                                            event.preventDefault()
                                                        }
                                                        onMouseEnter={() =>
                                                            setActiveTimeZoneIndex(
                                                                index
                                                            )
                                                        }
                                                        onClick={() =>
                                                            selectTimeZone(
                                                                timeZone.value
                                                            )
                                                        }
                                                    >
                                                        {timeZone.label}
                                                        <span>
                                                            {timeZone.detail}
                                                        </span>
                                                    </button>
                                                )
                                            )
                                        ) : (
                                            <p className="recruiter-filters__timezone-empty">
                                                No matching time zones
                                            </p>
                                        )}
                                    </div>
                                )}
                        </div>
                        <span className="recruiter-filters__timezone-hint">
                            Search by city, region, or UTC/GMT offset
                        </span>
                    </div>
                    <div className="recruiter-filters__slider">
                        <div className="recruiter-filters__slider-heading">
                            <label htmlFor="minimum-overlap-hours">
                                Minimum shared work hours
                            </label>
                            <output
                                htmlFor="minimum-overlap-hours"
                                aria-live="polite"
                            >
                                {filters.overlap.minHours === 0
                                    ? 'Any overlap'
                                    : `At least ${filters.overlap.minHours} ${
                                          filters.overlap.minHours === 1
                                              ? 'hour'
                                              : 'hours'
                                      }`}
                            </output>
                        </div>
                        <input
                            id="minimum-overlap-hours"
                            type="range"
                            min={0}
                            max={8}
                            step={0.5}
                            aria-label="Minimum working-hours overlap"
                            value={filters.overlap.minHours}
                            onChange={(event) =>
                                onOverlapChange({
                                    minHours: Number(event.target.value),
                                })
                            }
                        />
                        <div
                            className="recruiter-filters__presets"
                            role="group"
                            aria-label="Overlap shortcuts"
                        >
                            {OVERLAP_PRESETS.map((hours) => (
                                <Chip
                                    key={hours}
                                    pressed={filters.overlap.minHours === hours}
                                    onClick={() =>
                                        onOverlapChange({ minHours: hours })
                                    }
                                >
                                    {hours === 0 ? 'Any' : `${hours}h+`}
                                </Chip>
                            ))}
                        </div>
                    </div>
                </div>
            </fieldset>

            <fieldset className="recruiter-filters__group">
                <legend>
                    How to reach them
                    <span className="recruiter-filters__legend-hint">
                        Profiles must have every selected link
                    </span>
                </legend>
                <div className="recruiter-filters__chips">
                    {signals.map(({ value, label, count }) => (
                        <Chip
                            key={value}
                            pressed={filters.signals.includes(value)}
                            onClick={() => onSignalChange(value)}
                        >
                            Has {label}{' '}
                            <span className="recruiter-filters__count">
                                {count}
                            </span>
                        </Chip>
                    ))}
                </div>
            </fieldset>
        </div>
    )
}

export default RecruiterFilters
