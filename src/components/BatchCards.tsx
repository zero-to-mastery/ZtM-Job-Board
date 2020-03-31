import React, { useState } from "react"
import CardList from "./CardList"
import BasicButton from "./BasicButton"

const BatchCards = ({ persons, numberPerBatch = 16 }: any) => {
  const [batch, setBatch] = useState(1)

  const addToBatch = () => {
    if (persons.length > batch * numberPerBatch) {
      setBatch(batch + 1)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap justify-center">
        <div style={{ flex: "1 1 100%" }}>
          <p>Total Profiles: {persons.length}</p>
        </div>

        <CardList
          persons={persons.slice(0, batch * numberPerBatch)}
          card
          ma4
          w5
          tc
          bg-white
          br2
          custom--shadow-2
          custom--shadow-hover-8
          custom--o-95
          z-1
        />
      </div>
      {persons.length >= batch * numberPerBatch && (
        <BasicButton action={addToBatch}>Show More</BasicButton>
      )}
    </div>
  )
}

export default BatchCards
