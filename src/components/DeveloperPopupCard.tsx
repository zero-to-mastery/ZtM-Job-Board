import React from 'react'
import Person from '../interfaces/person'
import { formatLocation, personGeo, safeImageUrl } from '../util/mapGeometry'
import Avatar from './Avatar'
import ContactLinks from './ContactLinks'

interface DeveloperPopupCardProps {
    person: Person
    children?: React.ReactNode
    actions?: React.ReactNode
}

// Compact profile card shown in a map popup
function DeveloperPopupCard({
    person,
    children,
    actions,
}: DeveloperPopupCardProps) {
    return (
        <article className="devmap-card" aria-label={person.name}>
            <div className="devmap-card__header">
                <Avatar
                    src={safeImageUrl(person.img)}
                    alt=""
                    size={56}
                    className="devmap-avatar devmap-avatar--large"
                    fallbackClassName="devmap-avatar--fallback"
                />
                <div className="devmap-card__text">
                    <h3 className="devmap-card__name">{person.name}</h3>
                    {person.jobTitle && (
                        <p className="devmap-card__title">{person.jobTitle}</p>
                    )}
                    <p className="devmap-card__location">
                        {formatLocation(person)}
                        {personGeo(person)?.approximate && (
                            <span className="devmap-badge">
                                approximate location
                            </span>
                        )}
                    </p>
                </div>
            </div>
            {children}
            <div className="devmap-links">
                {actions}
                <ContactLinks
                    person={person}
                    linkClassName="devmap-link"
                    iconClassName="devmap-link__icon"
                />
            </div>
        </article>
    )
}

export default DeveloperPopupCard
