import React from 'react'

interface CheckboxDropdownProps<T> {
    id: string
    searchInputId: string
    label: string
    isOpen: boolean
    selectedCount: number
    options: T[]
    selectedValues: string[]
    getOptionValue: (option: T) => string
    getOptionLabel: (option: T) => string
    searchValue: string
    onSearchChange: (value: string) => void
    onOptionChange: (value: string) => void
    onToggle: () => void
    searchPlaceholder: string
    searchAriaLabel: string
    searchLabel?: string
    describedBy?: string
    inputType?: 'text' | 'search'
    noResultsMessage?: string
}

function CheckboxDropdown<T>({
    id,
    searchInputId,
    label,
    isOpen,
    selectedCount,
    options,
    selectedValues,
    getOptionValue,
    getOptionLabel,
    searchValue,
    onSearchChange,
    onOptionChange,
    onToggle,
    searchPlaceholder,
    searchAriaLabel,
    searchLabel,
    describedBy,
    inputType = 'text',
    noResultsMessage,
}: CheckboxDropdownProps<T>) {
    return (
        <>
            <button
                type="button"
                className="profile-filters__control w-100 pa2 br2 tl"
                aria-expanded={isOpen}
                aria-controls={id}
                aria-describedby={describedBy}
                onClick={onToggle}
            >
                {label}
                {selectedCount > 0 && ` (${selectedCount})`}
            </button>

            {isOpen && (
                <div
                    id={id}
                    className="profile-filters__dropdown"
                >
                    {searchLabel && (
                        <label
                            htmlFor={searchInputId}
                            className="db mb2"
                        >
                            {searchLabel}
                        </label>
                    )}

                    <input
                        id={searchInputId}
                        type={inputType}
                        aria-label={searchAriaLabel}
                        value={searchValue}
                        onChange={(event) =>
                            onSearchChange(event.target.value)
                        }
                        placeholder={searchPlaceholder}
                        className="profile-filters__control w-100 pa2 br2"
                    />

                    <div className="profile-filters__options">
                        {options.length === 0 && noResultsMessage && (
                            <p role="status">{noResultsMessage}</p>
                        )}

                        {options.map((option) => {
                            const value = getOptionValue(option)
                            const optionLabel = getOptionLabel(option)

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
