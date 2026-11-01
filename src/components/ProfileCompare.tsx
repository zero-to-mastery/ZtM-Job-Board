
import React from 'react'
import Person from '../interfaces/person'
import Card from './Card'
import { getProfileTimezone } from '../util/profileComparison'

interface ProfileCompareProps {
    persons: Person[]
    selectedSkills?: string[]
    onClear: () => void
    onBack: () => void
}

const ProfileCompare = ({
    persons,
    selectedSkills = [],
    onClear,
    onBack,
}: ProfileCompareProps) => {
    return (
        <section
            className="profile-compare"
            aria-label="Developer profile comparison"
        >
            <div className="profile-compare__header">
                <div>
                    <h2>Compare developers</h2>
                    <p>
                        Reviewing {persons.length} selected{' '}
                        {persons.length === 1 ? 'profile' : 'profiles'}
                    </p>
                </div>

                <div className="profile-compare__actions">
                    <button type="button" onClick={onBack}>
                        Back to profiles
                    </button>
                    <button type="button" onClick={onClear}>
                        Clear comparison
                    </button>
                </div>
            </div>

            <div className="profile-compare__grid">
                {persons.map((person) => (
                    <article
                        className="profile-compare__column"
                        key={person.id}
                        aria-label={`${person.name} comparison column`}
                    >
                        <Card
                            user={person}
                            selectedSkills={selectedSkills}
                            comparisonMode
                        />

                        <div className="profile-compare__timezone">
                            <h3>Timezone / UTC offset</h3>
                            <p>{getProfileTimezone(person.location)}</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}

export default ProfileCompare
