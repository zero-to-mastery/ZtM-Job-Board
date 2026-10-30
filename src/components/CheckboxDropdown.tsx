import React, { useId } from 'react'

interface CheckboxDropdownProps {
    id: string
    label: string
    isOpen: boolean
    selectedCount: number
    options: ReadonlyArray<{ value: string; label: string }>
    selectedValues: string[]
    searchValue: string
    onSearchChange: (value: string) => void
    onOptionChange: (value: string) => void
    onToggle: () => void
    searchLabel?: string
    helpText?: string
    noResultsMessage?: string // default: "No matches found."
}

function CheckboxDropdown({
    id,
    label,
    isOpen,
    selectedCount,
    options,
    selectedValues,
    searchValue,
    onSearchChange,
    onOptionChange,
    onToggle,
    searchLabel,
    helpText,
    noResultsMessage,
}: CheckboxDropdownProps) {
    const helpId = useId()
    const searchInputId = `${id}-search`

    return (
        <>
            <button
                type="button"
                className="profile-filters__control w-100 pa2 br2 tl"
                aria-expanded={isOpen}
                aria-controls={id}
                aria-describedby={helpText ? helpId : undefined}
                onClick={onToggle}
            >
                {label}
                {selectedCount > 0 && ` (${selectedCount})`}
            </button>

            {helpText && (
                <p id={helpId} className="f6 mt2 mb0">
                    {helpText}
                </p>
            )}

            {isOpen && (
                <div id={id} className="profile-filters__dropdown">
                    {searchLabel && (
                        <label htmlFor={searchInputId} className="db mb2">
                            {searchLabel}
                        </label>
                    )}

                    <input
                        id={searchInputId}
                        type="search"
                        value={searchValue}
                        onChange={(event) => onSearchChange(event.target.value)}
                        className="profile-filters__control w-100 pa2 br2"
                    />

                    <div className="profile-filters__options">
                        {options.length === 0 && (
                            <p role="status">
                                {noResultsMessage ?? 'No matches found.'}
                            </p>
                        )}

                        {options.map((option) => {
                            const value = option.value
                            const optionLabel = option.label

                            return (
                                <label
                                    key={value}
                                    className="profile-filters__option db pv2 ph1 pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedValues.includes(value)}
                                        onChange={() => onOptionChange(value)}
                                    />{' '}
                                    {optionLabel}
                                </label>
                            )
                        })}
                    </div>
                </div>
            )}
        </>
    )
}

export default CheckboxDropdown
