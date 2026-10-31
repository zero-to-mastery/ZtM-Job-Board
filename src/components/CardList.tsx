
import React from 'react'
import Card from './Card'
import Person from '../interfaces/person'

interface CardListProps {
    persons: Person[]
    selectedSkills?: string[]
    selectedProfileIds?: string[]
    comparisonLimitReached?: boolean
    onCompareToggle?: (profileId: string) => void
}

const CardList = ({
    persons,
    selectedSkills = [],
    selectedProfileIds = [],
    comparisonLimitReached = false,
    onCompareToggle,
}: CardListProps) => {
    return (
        <>
            {persons.map((user: Person) => {
                const isSelected = selectedProfileIds.includes(user.id)

                return (
                    <Card
                        comparisonMode
                        key={user.id}
                        user={user}
                        selectedSkills={selectedSkills}
                        isCompareSelected={isSelected}
                        isCompareDisabled={comparisonLimitReached}
                        onCompareToggle={onCompareToggle}
                    />
                )
            })}
        </>
    )
}

export default CardList
