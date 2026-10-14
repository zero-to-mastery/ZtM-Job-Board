import React from 'react'
import '../styles/RecruiterFilters.scss'
import { LEVEL_NOT_STATED, PeopleFilters } from '../util/filterPeople'
import { formatOffset, UTC_OFFSETS } from '../util/timezone'

export interface LevelOption {
    // A value from SENIORITY_LEVELS, or LEVEL_NOT_STATED
    value: string
    count: number
}

// "senior" -> "Senior", LEVEL_NOT_STATED -> "Not stated"
export const levelLabel = (value: string) =>
    value === LEVEL_NOT_STATED
        ? 'Not stated'
        : value.charAt(0).toUpperCase() + value.slice(1)

interface RecruiterFiltersProps {
    levels: LevelOption[]
    filters: PeopleFilters
    onLevelChange: (level: string) => void
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

// Seniority and time-zone overlap filters shared by both views.
// Country and role filters live in ProfileFilters.
const RecruiterFilters = ({
    levels,
    filters,
    onLevelChange,
    onOverlapChange,
}: RecruiterFiltersProps) => (
    <div className="recruiter-filters">
        <fieldset className="recruiter-filters__group">
            <legend>Seniority</legend>
            <div className="recruiter-filters__chips">
                {levels.map(({ value, count }) => (
                    <Chip
                        key={value}
                        pressed={filters.levels.includes(value)}
                        onClick={() => onLevelChange(value)}
                    >
                        {levelLabel(value)}{' '}
                        <span className="recruiter-filters__count">
                            {count}
                        </span>
                    </Chip>
                ))}
            </div>
        </fieldset>

        <fieldset className="recruiter-filters__group">
            <legend>Working-hours overlap (9–5 local time)</legend>
            <div className="recruiter-filters__row">
                <label>
                    My time zone{' '}
                    <select
                        value={filters.overlap.offset}
                        onChange={(event) =>
                            onOverlapChange({
                                offset: Number(event.target.value),
                            })
                        }
                    >
                        {UTC_OFFSETS.map((offset) => (
                            <option key={offset} value={offset}>
                                {formatOffset(offset)}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    At least{' '}
                    <select
                        value={filters.overlap.minHours}
                        onChange={(event) =>
                            onOverlapChange({
                                minHours: Number(event.target.value),
                            })
                        }
                    >
                        <option value={0}>any</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
                            <option key={hours} value={hours}>
                                {hours} {hours === 1 ? 'hour' : 'hours'}
                            </option>
                        ))}
                    </select>{' '}
                    of overlap
                </label>
            </div>
        </fieldset>
    </div>
)

export default RecruiterFilters
