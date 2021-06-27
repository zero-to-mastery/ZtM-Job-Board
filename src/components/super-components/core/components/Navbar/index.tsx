import React from "react"
import { useTheme } from "../../hooks/useTheme"
import { Card } from "../Card"

export const Navbar = (props: any) => {
  const { theme } = useTheme()
  const { style, children } = props

  return (
    <div style={{ padding: "rem", background: theme.palette.background.main }}>
      <Card
        style={{
          padding: "1rem",
          borderRadius: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 3,
          borderBottom: "1px solid #25252528",
          ...style,
        }}
      >
        {children}
      </Card>
    </div>
  )
}
