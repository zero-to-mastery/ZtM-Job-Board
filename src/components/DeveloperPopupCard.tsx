import React from 'react'
import Person from '../interfaces/person'
import { addDefaultImg, defaultImageDataURI } from '../util/avatar'
import { formatLocation, personGeo, safeImageUrl } from '../util/mapGeometry'
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
                <img
                    className="devmap-avatar devmap-avatar--large"
                    src={safeImageUrl(person.img) ?? defaultImageDataURI}
                    alt=""
                    width={56}
                    height={56}
                    loading="lazy"
                    decoding="async"
                    onError={addDefaultImg}
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
