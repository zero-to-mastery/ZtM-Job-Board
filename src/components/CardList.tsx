import React from 'react'
import Card from './Card'

import Person from '../interfaces/person'
interface CardListProps {
    persons: Person[]
}

const CardList = ({ persons }: CardListProps) => {
    return (
        <>
            {persons.map((user: Person) => (
                <Card key={user.id} user={user} />
            ))}
        </>
    )
}

export default CardList
