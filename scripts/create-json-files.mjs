import url from "url"
import fs from "fs"
import { data } from "../src/assets/persons.js"

for (let i = 0; i < data.people.length; i++) {
  const links = data.people[i].links
  let flag = true
  let file_name = ""

  if (links.github) {
    const gh_url = url.parse(links.github)
    gh_url.hostname.startsWith("github") ||
    gh_url.hostname.startsWith("www.github")
      ? (flag = true)
      : (flag = false)
  }

  if (flag) {
    file_name = links.github.split("/")[3]
  } else {
    file_name = data.people[i].name.replace(/\ /gi, "-")
  }

  const file_exists = fs.existsSync("Submissions/" + file_name + ".json")

  if (file_exists) {
    console.log("[!] File Exists: " + file_name + ". Overwriting...")
    console.log("[+] Current Data in File")
    const file_data = fs.readFileSync("Submissions/" + file_name + ".json", {
      encoding: "utf-8",
    })
    console.log(file_data)
    console.log("[+] Replaced With...")
    console.log(JSON.stringify(data.people[i], null, 2) + "\n\n\n\n")
  }

  // write file finally
  fs.writeFileSync(
    "Submissions/" + file_name + ".json",
    JSON.stringify(data.people[i], null, 2),
    { encoding: "utf-8" }
  )
}
