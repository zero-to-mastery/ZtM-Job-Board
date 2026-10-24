import React from 'react'
import Card from './Card'

import Person from '../interfaces/person'
interface CardListProps {
    persons: Person[]
    selectedSkills?: string[]
}

const CardList = ({ persons, selectedSkills = [] }: CardListProps) => {
    return (
        <>
            {persons.map((user: Person) => (
                <Card
                    key={user.id}
                    user={user}
                    selectedSkills={selectedSkills}
                />
            ))}
        </>
    )
}

export default CardList
