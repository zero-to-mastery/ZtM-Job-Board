import React, { useState } from 'react'
import { Shortlist } from '../hooks/useShortlist'
import Person from '../interfaces/person'
import { personUrl, shortlistCsv } from '../util/shortlist'

/** Copies text, falling back to a hidden textarea for older browsers. */
export async function copyText(text: string) {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        const area = document.createElement('textarea')
        area.value = text
        area.setAttribute('readonly', '')
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        try {
            return document.execCommand('copy')
        } catch {
            return false
        } finally {
            area.remove()
        }
    }
}

interface StarButtonProps {
    person: Person
    shortlist: Shortlist
}

export function StarButton({ person, shortlist }: StarButtonProps) {
    const starred = shortlist.has(person.id)
    return (
        <button
            type="button"
            className="devmap-icon-button devmap-star-button"
            aria-pressed={starred}
            aria-label={`${starred ? 'Remove' : 'Add'} ${person.name} ${starred ? 'from' : 'to'} shortlist`}
            title={starred ? 'Remove from shortlist' : 'Add to shortlist'}
            onClick={() => shortlist.toggle(person.id)}
        >
            <span aria-hidden="true">{starred ? '★' : '☆'}</span>
        </button>
    )
}

export function CopyLinkButton({ person }: { person: Person }) {
    const [status, setStatus] = useState('')
    return (
        <>
            <button
                type="button"
                className="devmap-icon-button"
                aria-label={`Copy link to ${person.name}`}
                title="Copy link to this developer"
                onClick={async () => {
                    const copied = await copyText(
                        personUrl(person.id, window.location)
                    )
                    setStatus(copied ? 'Link copied' : 'Could not copy link')
                }}
            >
                <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z" />
                </svg>
            </button>
            <span className="devmap-status" role="status">
                {status}
            </span>
        </>
    )
}

interface ShortlistControlsProps {
    shortlist: Shortlist
    // Shortlisted developers in shortlist order
    people: Person[]
    showing: boolean
    onShowingChange: (showing: boolean) => void
}

// Shortlist toggle, CSV copy and clear, shown in the results panel
function ShortlistControls({
    shortlist,
    people,
    showing,
    onShowingChange,
}: ShortlistControlsProps) {
    const [status, setStatus] = useState('')
    const count = people.length

    return (
        <div className="devmap-shortlist">
            <button
                type="button"
                className="devmap-button"
                aria-pressed={showing}
                onClick={() => onShowingChange(!showing)}
            >
                <span aria-hidden="true">★</span> Shortlist ({count})
            </button>
            <button
                type="button"
                className="devmap-button"
                disabled={count === 0}
                onClick={async () => {
                    const copied = await copyText(
                        shortlistCsv(people, window.location)
                    )
                    setStatus(
                        copied
                            ? `Copied ${count} ${count === 1 ? 'developer' : 'developers'} as CSV`
                            : 'Could not copy. Your browser blocked clipboard access.'
                    )
                }}
            >
                Copy as CSV
            </button>
            {count > 0 && (
                <button
                    type="button"
                    className="devmap-button"
                    onClick={() => {
                        if (
                            window.confirm(
                                'Remove everyone from your shortlist?'
                            )
                        ) {
                            shortlist.clear()
                            setStatus('Shortlist cleared')
                        }
                    }}
                >
                    Clear
                </button>
            )}
            <span className="devmap-status" role="status">
                {status}
            </span>
        </div>
    )
}

export default ShortlistControls
