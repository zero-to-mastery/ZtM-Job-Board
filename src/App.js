import React, { useState } from "react"
import BatchCards from "./components/BatchCards"
import Navbar from "./components/Navbar"
import { people } from "./assets/persons"
import Search from "./components/Search"
import SimpleMap from "./components/Map"
import { createFilter } from "react-search-input"
import { shuffle } from "./util/shuffle"
import "./styles/SearchBarMobileView.css"

const style = {
  background: "#fff",
  padding: "1rem",
  width: "100%",
  margin: "0 0 2rem 0",
  zIndex: "1",
  borderRadius: "5px"
}
const responsiveSearch = {
  width: "100%",
  marginBottom: "0.5rem",
  padding: "0.5rem"
}
const KEYS_TO_FILTERS = [
  "name",
  "jobTitle",
  "location.city",
  "location.state",
  "location.country"
]

function App() {
  const [searchfield, setSearchfield] = useState("")

  const [map, setMap] = useState(false)

  const filteredPersons = searchFilter =>
    people.filter(createFilter(searchFilter, KEYS_TO_FILTERS))

  //note: shuffle function is not pure function, it mutates original array
  //in order to avoid memory duplication
  shuffle(people)

  return (
    <div className="flex flex-column min-vh-100 tc">
      <header className="custom--unselectable fixed top-0 w-100 white custom--bg-additional3 custom--shadow-4 z-9999">
        <Navbar
          onLogoClick={() => setMap(false)}
          onSearchChange={e => setSearchfield(e.target.value)}
          onMapClick={() => setMap(!map)}
        />
      </header>
      <main className="flex-auto">
        {map ? (
          <SimpleMap />
        ) : (
          <div id="sketch-particles">
            <div className="visible-on-mobileview-only" style={style}>
              <Search
                onSearchChange={e => setSearchfield(e.target.value)}
                responsiveSearch={responsiveSearch}
              />
            </div>

            <BatchCards
              persons={filteredPersons(searchfield)}
              numberPerBatch={16}
            />
          </div>
        )}
      </main>
      <footer className="custom--unselectable w-100 h3 flex items-center justify-center justify-end-l white custom--bg-additional3 z-2">
        <a
          href="https://github.com/zero-to-mastery/ZtM-Job-Board"
          title="Repository"
        >
          <svg
            className="repo w2 h2"
            viewBox="0 0 12 16"
            version="1.1"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4 9H3V8h1v1zm0-3H3v1h1V6zm0-2H3v1h1V4zm0-2H3v1h1V2zm8-1v12c0 .55-.45 1-1 1H6v2l-1.5-1.5L3 16v-2H1c-.55 0-1-.45-1-1V1c0-.55.45-1 1-1h10c.55 0 1 .45 1 1zm-1 10H1v2h2v-1h3v1h5v-2zm0-10H2v9h9V1z"
            />
          </svg>
        </a>
      </footer>
    </div>
  )
}

export default App
