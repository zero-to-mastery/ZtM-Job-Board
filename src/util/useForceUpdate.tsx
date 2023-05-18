import React, { useState } from "react"

const useForceUpdate = () => {
  const [value, setValue] = useState(0)
  return () => setValue((prev) => prev + 1)
}

export default useForceUpdate
