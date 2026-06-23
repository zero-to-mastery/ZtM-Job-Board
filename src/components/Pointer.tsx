import React from 'react'

interface PointerProps {
    onClick: () => void
    Text: React.ReactNode
    TooltipText: string
}

// Creating a component for the Pointers of the Navbar and adding Tooltips
export const Pointer = ({ onClick, Text, TooltipText }: PointerProps) => {
    return (
        <div className="searchbox-tooltip">
            <button
                className="f3 mr4 pointer bg-transparent bn pa0"
                onClick={onClick}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onClick()
                    }
                }}
                aria-label={TooltipText}
            >
                {Text}
            </button>
        </div>
    )
}
