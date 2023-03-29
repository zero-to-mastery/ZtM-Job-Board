import React from "react"

// Creating a component for the Pointers of the Navbar and adding Tooltips

type Props = {
  onClick: any
  Text: string
  TooltipText: string
}

export const Pointer = ({ onClick, Text, TooltipText }: Props) => {
  return (
    <div className="searchbox-tooltip">
      <span className="f3 mr4 pointer" onClick={onClick}>
        {Text}
      </span>
      <span className="tooltiptext">{TooltipText}</span>
    </div>
  )
}
