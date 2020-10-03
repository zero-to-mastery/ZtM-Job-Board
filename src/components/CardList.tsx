import React from "react"
import Card from "./Card"

import Person from "../interfaces/person"

const CardList = ({ persons }: any) => {
  return (
    <>
      {persons.map((user: Person) => (
        <Card key={user.id} user={user} />
      ))}
    </>
  )
}

export default CardList
