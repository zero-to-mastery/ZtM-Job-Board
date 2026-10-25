import React from 'react'

import '../styles/BasicButton.scss'

interface BasicButtonProps {
    action: () => void
    children?: React.ReactNode
    disabled?: boolean
}

const BasicButton = ({ action, children, disabled }: BasicButtonProps) => {
    return (
        <div className="flex items-center justify-center pa4 custom--basic-button">
            <button
                className={`theme-button f5 no-underline bg-animate inline-flex items-center pa3 ba border-box br2 ${disabled ? 'disabled' : ''}`}
                onClick={action}
                disabled={disabled}
            >
                {children}
            </button>
        </div>
    )
}

export default BasicButton
