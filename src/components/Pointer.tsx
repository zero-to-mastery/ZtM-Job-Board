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
            <span className="f3 mr4 pointer" onClick={onClick}>
                {Text}
            </span>
            <span className="tooltiptext">{TooltipText}</span>
        </div>
    )
}
