import { data } from "./persons.js"
import jsonlint from "jsonlint"

test("Persons object is a valid JSON object", () => {
  const peopleString = JSON.stringify(data)
  jsonlint.parse(peopleString)
})

// Test if image URLs are longer than 200 characters to reduce file size
const persons = data.people
const personsLength = persons.length
// to reduce file size and disallow large image URLs or base64 encoded images
it("img url is not base64 or too long", () => {
  for (let i = 0; i < personsLength; i++) {
    // following line to find users and delete long URLs
    // if (persons[i].img.length > 200) console.log(persons[i].name)
    expect(persons[i].img.length).toBeLessThan(200)
  }
})
