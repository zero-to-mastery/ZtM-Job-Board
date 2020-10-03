import React, { useState } from "react"
import CountUp from "react-countup"

import CardList from "./CardList"
import BasicButton from "./BasicButton"
import { countriesWithNumOfDevsObj } from "../util/UsersDataCleanup"
const countryNamesAndNumOfDevsArr = Object.entries(countriesWithNumOfDevsObj)

const BatchCards = ({ persons, numberPerBatch = 16 }: any) => {
  const [batch, setBatch] = useState(1)

  const addToBatch = () => {
    if (persons.length > batch * numberPerBatch) {
      setBatch(batch + 1)
    }
  }

  const infoCardContainer: object = {
    padding: 20,
    backgroundColor: "#42a5f5",
    borderRadius: 10,
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-between",
  }
  const infoView: object = {
    background: "#212121",
    padding: 10,
    borderRadius: 10,
  }
  const infoLabel: object = {
    fontSize: 20,
    margin: 0,
    padding: 0,
    color: "white",
  }
  const infoValue: object = {
    fontSize: 25,
    margin: 0,
    padding: 0,
    color: "white",
  }

  return (
    <div>
      <div style={{ flex: 1 }}>
        <div style={infoCardContainer}>
          <div style={infoView}>
            <p style={infoLabel}>Total Profiles</p>
            <p style={infoValue}>
              <CountUp end={persons.length} delay={1} />
            </p>
          </div>
          <div style={infoView}>
            <p style={infoLabel}>Total Countries</p>
            <p style={infoValue}>
              <CountUp end={countryNamesAndNumOfDevsArr.length} delay={1} />
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center">
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
