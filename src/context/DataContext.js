import React from "react"
import { test } from "../util/paginator"

export const DataContext = React.createContext()

export const DataProvider = (props) => {
  const { dataSource } = props
  const [data, setData] = React.useState(dataSource)

  const filterData = (filters) => {
    const filtersName = Object.keys(filters)
    filtersName.forEach((name) => {
      const value = filters[name]
      if (value == "") {
        setData(dataSource)
      } else {
        const aux = dataSource.filter((item) => {
          const { name: uName, jobTitle, location } = item
          const { city, state, country } = location
          const str = `${uName} ${jobTitle} ${city} ${state} ${country}`
          return test(str, value)
        })
        setData(aux)
      }
    })
  }

  const value = React.useMemo(() => {
    return {
      data,
      filterData,
    }
  }, [data])

  return <DataContext.Provider value={value} {...props} />
}
