import React from "react"
import Card from "./Card"

const CardList = ({ persons }) => {
  return (
    <>
      {persons.map((user, i) => (
        <Card key={i} user={user} />
      ))}
    </>
  )
}

export default CardList
