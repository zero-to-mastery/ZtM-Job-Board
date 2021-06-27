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
  const { filterData } = useData()
  shuffle(people)

  return (
    <>
      <div style={{ height: "100vh" }}>
        <Card style={{ height: "100%", borderRadius: 0, overflowY: "auto" }}>
          <SNavbar>
            <Logo style={{ width: "7rem" }} />
            Home
          </SNavbar>
          <div
            style={{
              width: "100%",
              position: "relative",
              backgroundColor: "#D8F1FD",
              height: "16rem",
            }}
          >
            <img src={Banner} alt="" />

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
            >
              Search
            </Searcher>

            <img src={R} alt="" />
          </div>

          <br />
          <br />

          <div style={{ padding: "2rem" }}>
            <UsersGridContainer people={people} />
          </div>
        </Card>
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
