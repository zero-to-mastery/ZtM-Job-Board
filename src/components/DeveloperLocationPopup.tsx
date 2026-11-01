import React from 'react'
import type Person from '../interfaces/person'

interface DeveloperLocationPopupProps {
    people: readonly Person[]
    placementText?: string
}

// Popup body for one coordinate pin: header (singular/plural) plus one entry
// per developer with location line and optional GitHub link.
const DeveloperLocationPopup = ({
    people,
    placementText,
}: DeveloperLocationPopupProps) => (
    <>
        <strong>
            {people.length === 1
                ? 'Developer'
                : `${people.length} developers at this location`}
        </strong>
        {placementText && <p>{placementText}</p>}
        {people.map((person) => {
            const locationText = [
                person.location?.city,
                person.location?.state,
                person.location?.country,
            ]
                .filter(Boolean)
                .join(', ')

            return (
                <div key={person.id}>
                    <p>
                        <strong>{person.name}</strong>
                    </p>
                    {locationText && <p>{locationText}</p>}
                    {person.links?.github && (
                        <p>
                            <a
                                href={person.links.github}
                                target="_blank"
                                rel="noreferrer"
                            >
                                GitHub profile
                            </a>
                        </p>
                    )}
                </div>
            )
        })}
    </>
)

export default DeveloperLocationPopup
