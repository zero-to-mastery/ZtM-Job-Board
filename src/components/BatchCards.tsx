
import React from 'react'
import CardList from './CardList'
import BasicButton from './BasicButton'
import Person from '../interfaces/person'

interface BatchCardsProps {
    persons: Person[]
    batch: number
    numberPerBatch?: number
    selectedSkills?: string[]
    selectedProfileIds?: string[]
    comparisonLimitReached?: boolean
    onCompareToggle?: (profileId: string) => void
    onShowMore: () => void
    onClear: () => void
}

const BatchCards = ({
    persons,
    batch,
    numberPerBatch = 16,
    selectedSkills = [],
    selectedProfileIds = [],
    comparisonLimitReached = false,
    onCompareToggle,
    onShowMore,
    onClear,
}: BatchCardsProps) => {
    const visibleCount = batch * numberPerBatch

    return (
        <div className="developer-results">
            {persons.length === 0 ? (
                <div className="developer-results__empty">
                    <h2>No developers match your criteria</h2>
                    <p>
                        Try removing a required skill or broadening your search,
                        country, or role filters.
                    </p>
                    <button type="button" onClick={onClear}>
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="flex flex-wrap justify-center">
                    <CardList
                        persons={persons.slice(0, visibleCount)}
                        selectedSkills={selectedSkills}
                        selectedProfileIds={selectedProfileIds}
                        comparisonLimitReached={comparisonLimitReached}
                        onCompareToggle={onCompareToggle}
                    />
                </div>
            )}

            {persons.length > visibleCount && (
                <BasicButton action={onShowMore}>Show More</BasicButton>
            )}
        </div>
    )
}

export default BatchCards
