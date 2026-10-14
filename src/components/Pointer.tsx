import React, { useId } from 'react'

interface PointerProps {
    onClick: () => void
    Text: React.ReactNode
    TooltipText: string
    // Accessible name when Text is an icon
    label?: string
}

// Creating a component for the Pointers of the Navbar and adding Tooltips
export const Pointer = ({
    onClick,
    Text,
    TooltipText,
    label,
}: PointerProps) => {
    const tooltipId = useId()

    return (
        <div className="searchbox-tooltip">
            <button
                type="button"
                className="nav-button f3 mr4 pointer"
                onClick={onClick}
                aria-label={label}
                aria-describedby={tooltipId}
            >
                {Text}
            </button>
            <span id={tooltipId} role="tooltip" className="tooltiptext">
                {TooltipText}
            </span>
        </div>
    )
}
