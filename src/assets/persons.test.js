import { data } from "./persons.js"
import jsonlint from "jsonlint"

test("Persons object is a valid JSON object", () => {
  const peopleString = JSON.stringify(data)
  jsonlint.parse(peopleString)
})
