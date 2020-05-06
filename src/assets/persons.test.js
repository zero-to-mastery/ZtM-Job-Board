import * as PERSONS from "./persons.json"
import jsonlint from "jsonlint"

test("Persons object is a valid JSON object", () => {
  const peopleString = JSON.stringify(PERSONS)
  jsonlint.parse(peopleString)
})
