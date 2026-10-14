import React, { useState } from 'react'
import CardList from './CardList'
import BasicButton from './BasicButton'
import Person from '../interfaces/person'

interface BatchCardsProps {
    persons: Person[]
    numberPerBatch?: number
    selectedSkills?: string[]
    onClear: () => void
}

const BatchCards = ({
    persons,
    numberPerBatch = 16,
    selectedSkills = [],
    onClear,
}: BatchCardsProps) => {
    const [batch, setBatch] = useState(1)
    const visibleCount = batch * numberPerBatch

    return (
        <div>
            {persons.length === 0 ? (
                <div className="empty-state" role="status">
                    <p className="empty-state__title">
                        No developers match your criteria
                    </p>
                    <p>
                        Try removing a required skill or broadening your search,
                        country, or role filters.
                    </p>
                    <button
                        type="button"
                        className="theme-button pv2 ph3 mt3 br2 pointer"
                        onClick={onClear}
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="flex flex-wrap justify-center">
                    <CardList
                        persons={persons.slice(0, visibleCount)}
                        selectedSkills={selectedSkills}
                    />
                </div>
            )}
            {persons.length > visibleCount && (
                <BasicButton action={() => setBatch((current) => current + 1)}>
                    Show More
                </BasicButton>
            )}
        </div>
    )
}

export default BatchCards
