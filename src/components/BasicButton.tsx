import React from "react"

import "../styles/BasicButton.scss"

interface BasicButtonProps {
  action: () => void
  children: string
  disabled?: boolean
}

const BasicButton: React.FC<BasicButtonProps> = ({
  action,
  children,
  disabled,
}: any) => {
  console.log("BasicButton", action, children, disabled)
  return (
    <div className="flex items-center justify-center pa4 custom--basic-button">
      <button
        className={
          "f5 no-underline black bg-animate hover-bg-black hover-white inline-flex items-center pa3 ba border-box b--dark-gray br2 " +
          (disabled ? "disabled" : "")
        }
        onClick={action}
        disabled={disabled}
      >
        {children}
      </button>
    </div>
  )
}

export default BasicButton
