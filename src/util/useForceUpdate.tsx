import React, { useState } from "react"

const useForceUpdate = () => {
  const [value, setValue] = useState<number>(0)
  return () => setValue((prev: number) => prev + 1)
}

export default useForceUpdate
