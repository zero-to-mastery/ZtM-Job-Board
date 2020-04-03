import React from "react"
import ReactDOM from "react-dom"
import WebFont from "webfontloader"
import App from "./App"
import "tachyons"
import "./index.scss"
import registerServiceWorker from "./registerServiceWorker"

WebFont.load({
  google: {
    // families: ["Roboto Condensed:300,400,700", "sans-serif"]
    // families: ["Roboto Condensed:300,400,700&display=swap"]
    families: ["Roboto Condensed:300,400,700&display=swap&subset=latin-ext"]
  }
})

ReactDOM.render(<App />, document.getElementById("root"))
registerServiceWorker()
