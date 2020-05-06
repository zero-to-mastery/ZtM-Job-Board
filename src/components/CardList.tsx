import React from "react"
import Card from "./Card"

import Person from "../interfaces/person"

const CardList = ({ persons }: any) => {
  return (
    <>
      {persons.map((user: Person, i: any) => (
        <Card key={i} user={user} />
      ))}
    </>
  )
}

export default CardList
