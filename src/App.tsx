import React from "react"

import { shuffle } from "./util/shuffle"
import persons from "./assets/persons.json"

import {
  Card,
  ThemeProvider,
  light,
  Searcher,
  Navbar as SNavbar,
} from "./components/super-components/core"
import Banner from "./assets/002.png"
import R from "./assets/003.png"
import { Logo } from "./components/Brand/Logo"
import { UsersGridContainer } from "./components/UsersGrid/index"
import { PaginationContextProvider } from "./context/PaginationContext"
import { useData } from "./hooks/useData"
import { DataProvider } from "./context/DataContext"

import "./styles/SearchBarMobileView.scss"
import { useTheme } from "./components/super-components/core/hooks/useTheme"

const people: any = persons

const AppWrapper = (props: any) => {
  const { children } = props
  const { data } = useData()
  return (
    <PaginationContextProvider dataSource={data}>
      <ThemeProvider theme={light}>{children}</ThemeProvider>;
    </PaginationContextProvider>
  )
}

function Appaaa() {
  const { filterData, data } = useData()
  const { theme } = useTheme()
  shuffle(people)

  return (
    <>
      <div
        style={{
          height: "100%",
          borderRadius: 0,
          overflowY: "auto",
          background: theme.palette.common.light,
        }}
      >
        <SNavbar>
          <h1 id="title" className="relative ma0 pa0 fl-l pointer">
            <span className="fw3">Job</span>
            <span className="fw7" style={{ color: theme.palette.primary.main }}>
              Board
            </span>
          </h1>
        </SNavbar>
        <div
          style={{
            width: "100%",
            position: "relative",
            backgroundColor: "#D8F1FD",
            height: "16rem",
          }}
        >
          <div
            style={{
              padding: "1rem",
              width: "50rem",
              position: "absolute",
              bottom: "2rem",
              textAlign: "center",
              left: "50%",
              transform: "translate(-50%)",
            }}
          >
            <h1
              style={{
                fontFamily: `'Roboto', sans-serif`,

                margin: 0,
                fontSize: "4rem",
                color: "#1D2346",
                fontWeight: "bold",
              }}
            >
              A free code project
            </h1>
            <h1>Let's create a better web!</h1>
          </div>
          <Searcher
            name="name"
            placeholder=" search by name, job, city, state or country..."
            style={{
              padding: "1rem",
              width: "50rem",
              position: "absolute",
              bottom: "-1rem",
              left: "50%",
              transform: "translate(-50%)",
            }}
            onChange={(e: any) => {
              console.log(e)
              filterData(e)
            }}
          />
        </div>
        <br />
        <div style={{ textAlign: "center", padding: "1rem" }}>
          <p style={{ color: theme.palette.primary.main }}>
            {data.length} Users
          </p>
        </div>
        <div style={{ padding: "0 2rem 2rem 2rem" }}>
          <UsersGridContainer people={people} />
        </div>
      </div>
    </>
  )
}

const App = () => {
  return (
    <DataProvider dataSource={people}>
      <AppWrapper>
        <Appaaa />
      </AppWrapper>
    </DataProvider>
  )
}

export default App
