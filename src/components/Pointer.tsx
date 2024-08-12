import React from 'react'

// Pointer component
export const Pointer = ({ onClick, Text, TooltipText, Icon }: any) => {
    return (
        <div className="searchbox-tooltip">
            <span className="f3 mr4 pointer" onClick={onClick}>
                {Icon && <span className="icon">{Icon}</span>}
                {Text}
            </span>
            <span className="tooltiptext">{TooltipText}</span>
        </div>
    )
}
