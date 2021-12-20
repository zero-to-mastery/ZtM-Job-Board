import React from "react"
import Card from "./Card"

import Person from "../interfaces/person"

type CardListProps = {
  persons: Person[]
}

const CardList: React.FC<CardListProps> = ({ persons }) => {
  return (
    <>
      {persons.map((user: Person) => (
        <Card key={user.id} user={user} />
      ))}
    </>
  )
}

export default CardList
