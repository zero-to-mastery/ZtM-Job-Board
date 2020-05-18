import * as PERSONS from "./persons.json"
import jsonlint from "jsonlint"

describe("Person object", () => {
  it("is a valid JSON object", () => {
    const peopleString = JSON.stringify(PERSONS)
    jsonlint.parse(peopleString)
  })

  const peopleArray = PERSONS.people
  it("has last id equal previous + 1", () => {
    const lastPerson = peopleArray[peopleArray.length - 2]
    const addedPerson = peopleArray[peopleArray.length - 1]
    expect(addedPerson.id).toEqual(lastPerson.id + 1)
  })
})
