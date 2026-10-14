import React, { useEffect, useRef, useState } from 'react'
import Person from '../interfaces/person'
import { addDefaultImg, defaultImageDataURI } from '../util/avatar'
import { formatLocation, personGeo, safeImageUrl } from '../util/mapGeometry'
import ContactLinks from './ContactLinks'

const BATCH_SIZE = 50

interface DeveloperListProps {
    people: Person[]
    selectedId: string | null
    onSelect: (id: string) => void
    renderExtras?: (person: Person) => React.ReactNode
    renderActions?: (person: Person) => React.ReactNode
    emptyMessage?: string
}

// Results panel beside the map; selecting an entry opens its marker
function DeveloperList({
    people,
    selectedId,
    onSelect,
    renderExtras,
    renderActions,
    emptyMessage = 'No developers match here. Zoom out, move the map or change the filters.',
}: DeveloperListProps) {
    const [visible, setVisible] = useState(BATCH_SIZE)
    const selectedRef = useRef<HTMLLIElement>(null)

    // Start again from the top when the result set changes
    useEffect(() => setVisible(BATCH_SIZE), [people])

    // Make sure the selected developer is rendered and scrolled into view
    const selectedIndex = selectedId
        ? people.findIndex((person) => person.id === selectedId)
        : -1
    useEffect(() => {
        if (selectedIndex >= visible) {
            setVisible(Math.ceil((selectedIndex + 1) / BATCH_SIZE) * BATCH_SIZE)
        }
    }, [selectedIndex, visible])
    useEffect(() => {
        selectedRef.current?.scrollIntoView?.({ block: 'nearest' })
    }, [selectedId, visible])

    if (people.length === 0) {
        return <p className="devmap-empty">{emptyMessage}</p>
    }

    return (
        <>
            <ul className="devmap-list">
                {people.slice(0, visible).map((person) => {
                    const selected = person.id === selectedId
                    return (
                        <li
                            key={person.id}
                            ref={selected ? selectedRef : undefined}
                            className={`devmap-entry${selected ? ' devmap-entry--selected' : ''}`}
                        >
                            <button
                                type="button"
                                className="devmap-entry__select"
                                aria-pressed={selected}
                                onClick={() => onSelect(person.id)}
                            >
                                <img
                                    className="devmap-avatar"
                                    src={
                                        safeImageUrl(person.img) ??
                                        defaultImageDataURI
                                    }
                                    alt=""
                                    width={40}
                                    height={40}
                                    loading="lazy"
                                    decoding="async"
                                    onError={addDefaultImg}
                                />
                                <span className="devmap-entry__text">
                                    <span className="devmap-entry__name">
                                        {person.name}
                                    </span>
                                    <span className="devmap-entry__meta">
                                        {person.jobTitle}
                                    </span>
                                    <span className="devmap-entry__meta">
                                        {formatLocation(person) ||
                                            'Location not given'}
                                        {personGeo(person)?.approximate &&
                                            ' (approximate)'}
                                    </span>
                                    {renderExtras?.(person)}
                                </span>
                            </button>
                            <div className="devmap-entry__actions">
                                {renderActions?.(person)}
                                <ContactLinks
                                    person={person}
                                    linkClassName="devmap-link"
                                    iconClassName="devmap-link__icon"
                                />
                            </div>
                        </li>
                    )
                })}
            </ul>
            {people.length > visible && (
                <button
                    type="button"
                    className="devmap-button devmap-more"
                    onClick={() => setVisible(visible + BATCH_SIZE)}
                >
                    Show more ({people.length - visible} left)
                </button>
            )}
        </>
    )
}

export default DeveloperList
