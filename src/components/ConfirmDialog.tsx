import React, { useEffect, useId, useRef } from 'react'

interface ConfirmDialogProps {
    open: boolean
    title: string
    message: React.ReactNode
    confirmLabel: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
}

// Modal confirmation built on <dialog>, which traps focus, closes on Escape
// and sits above the map. Cancel gets focus first so Enter is never destructive.
function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel,
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const cancelRef = useRef<HTMLButtonElement>(null)
    const titleId = useId()
    const messageId = useId()

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (open && !dialog.open) {
            // Older browsers and jsdom may not support showModal
            if (typeof dialog.showModal === 'function') dialog.showModal()
            else dialog.setAttribute('open', '')
            cancelRef.current?.focus()
        } else if (!open && dialog.open) {
            if (typeof dialog.close === 'function') dialog.close()
            else dialog.removeAttribute('open')
        }
    }, [open])

    return (
        <dialog
            ref={dialogRef}
            className="devmap-dialog"
            aria-labelledby={titleId}
            aria-describedby={messageId}
            onCancel={(event) => {
                // Escape: let React state close the dialog
                event.preventDefault()
                onCancel()
            }}
            onClick={(event) => {
                // A click on the backdrop lands on the dialog element itself
                if (event.target === event.currentTarget) onCancel()
            }}
        >
            <div className="devmap-dialog__content">
                <h2 id={titleId} className="devmap-dialog__title">
                    {title}
                </h2>
                <p id={messageId} className="devmap-dialog__message">
                    {message}
                </p>
                <div className="devmap-dialog__actions">
                    <button
                        ref={cancelRef}
                        type="button"
                        className="devmap-button"
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        className="devmap-button devmap-button--danger"
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </dialog>
    )
}

export default ConfirmDialog
