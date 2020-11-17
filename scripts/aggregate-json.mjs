import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

const JSON_SOURCE_DIR = "Submissions"
const FINAL_JSON_FILE = "src/assets/persons.json"
let dirContent = null
const finalJSON = []

try {
  dirContent = fs.readdirSync(path.resolve(JSON_SOURCE_DIR))
} catch (e) {
  console.log(`error while reading "${JSON_SOURCE_DIR}": ` + e.message)
}

try {
  for (let i = 0; i < dirContent.length; i++) {
    const jsonContent__raw = fs.readFileSync(
      path.resolve(JSON_SOURCE_DIR, dirContent[i]),
      { encoding: "utf-8" }
    )

    const jsonContent__parsed = JSON.parse(jsonContent__raw)
    jsonContent__parsed.id = uuidv4()
    finalJSON.push(jsonContent__parsed)
  }
} catch (e) {
  console.log(`error: ` + e.message)
}

fs.writeFileSync(
  path.resolve(FINAL_JSON_FILE),
  JSON.stringify(finalJSON, null, 2)
)
