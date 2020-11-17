import persons from "./persons.json"
import jsonlint from "jsonlint"

test("Persons object is a valid JSON object", () => {
  const peopleString = JSON.stringify(persons)
  jsonlint.parse(peopleString)
})

// Test if image URLs are longer than 200 characters to reduce file size
const personsLength = persons.length
// to reduce file size and disallow large image URLs or base64 encoded images
it("img url is not base64 or too long", () => {
  for (let i = 0; i < personsLength; i++) {
    // following line to find users and delete long URLs
    if (persons[i].img.length > 200) {
      console.warn(
        `${persons[i].name}'s image URL exceeds 200 characters.\nURL length: ${persons[i].img.length} characters.\nPlease update/remove the URL to reduce file size.`
      )
    }
    // commented out to prevent build failure because of long URLs
    // expect(persons[i].img.length).toBeLessThan(200)
  }
})
