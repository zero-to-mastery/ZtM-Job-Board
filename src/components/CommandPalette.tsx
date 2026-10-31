import React, { useEffect, useId, useRef, useState } from 'react'
import '../styles/CommandPalette.scss'
import {
    buildPaletteCommands,
    filterPaletteCommands,
    PaletteCommand,
    searchCommand,
    PaletteSource,
} from '../util/paletteCommands'

interface CommandPaletteProps extends PaletteSource {
    open: boolean
    onClose: () => void
}

function CommandPalette({ open, onClose, ...source }: CommandPaletteProps) {
    if (!open) return null
    return <PaletteDialog source={source} onClose={onClose} />
}

interface PaletteDialogProps {
    source: PaletteSource
    onClose: () => void
}

// Mounted only while open, so the input focuses on mount and focus is
// restored on unmount.
function PaletteDialog({ source, onClose }: PaletteDialogProps) {
    const [query, setQuery] = useState('')
    const [activeIndex, setActiveIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    // Read during the first render, before this dialog commits, so it names
    // the control that had focus when the palette opened.
    const returnFocus = useRef<Element | null>(document.activeElement)
    const baseId = useId()
    const listId = `${baseId}-list`

    const matches = filterPaletteCommands(buildPaletteCommands(source), query)
    const search = searchCommand(query, source.onSearch)
    const rows = search ? [...matches, search] : matches
    const active =
        rows.length === 0 ? -1 : Math.min(activeIndex, rows.length - 1)
    const activeOptionId =
        active >= 0 ? `${baseId}-option-${active}` : undefined

    useEffect(() => {
        inputRef.current?.focus()
        const previous = returnFocus.current
        return () => {
            if (previous instanceof HTMLElement && previous.isConnected) {
                previous.focus()
            }
        }
    }, [])

    useEffect(() => {
        if (active >= 0) {
            document
                .getElementById(`${baseId}-option-${active}`)
                ?.scrollIntoView?.({ block: 'nearest' })
        }
    }, [active, baseId])

    function run(command: PaletteCommand) {
        command.apply()
        onClose()
    }

    function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        if (event.nativeEvent.isComposing) return
        const count = rows.length

        if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            onClose()
        } else if (event.key === 'Tab') {
            // The input is the only focusable control, so keep focus here.
            event.preventDefault()
        } else if (event.key === 'ArrowDown' && count > 0) {
            event.preventDefault()
            setActiveIndex((active + 1) % count)
        } else if (event.key === 'ArrowUp' && count > 0) {
            event.preventDefault()
            setActiveIndex((active - 1 + count) % count)
        } else if (event.key === 'Enter' && active >= 0) {
            event.preventDefault()
            run(rows[active])
        }
    }

    return (
        <div
            className="command-palette-backdrop"
            onPointerDown={(event) => {
                if (event.target === event.currentTarget) onClose()
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Command palette"
                className="command-palette"
                onKeyDown={onKeyDown}
            >
                <input
                    ref={inputRef}
                    type="text"
                    role="combobox"
                    aria-label="Search commands"
                    aria-autocomplete="list"
                    aria-expanded="true"
                    aria-controls={listId}
                    aria-activedescendant={activeOptionId}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Type a skill, country, role or sort"
                    className="command-palette__input"
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value)
                        setActiveIndex(0)
                    }}
                />
                <ul
                    id={listId}
                    role="listbox"
                    aria-label="Commands"
                    className="command-palette__list"
                >
                    {rows.map((command, index) => (
                        <li
                            key={command.id}
                            id={`${baseId}-option-${index}`}
                            role="option"
                            aria-selected={index === active}
                            className={
                                index === active
                                    ? 'command-palette__option command-palette__option--active'
                                    : 'command-palette__option'
                            }
                            onMouseMove={() => setActiveIndex(index)}
                            onClick={() => run(command)}
                        >
                            <span className="command-palette__category">
                                {command.category}
                            </span>
                            <span className="command-palette__label">
                                {command.label}
                            </span>
                            {command.selected && (
                                <span className="command-palette__state">
                                    Selected
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default CommandPalette
