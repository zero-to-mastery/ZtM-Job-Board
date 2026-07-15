import './index.scss'
import 'tachyons'
import App from './App'
import React from 'react'
import WebFont from 'webfontloader'
import { createRoot } from 'react-dom/client'

WebFont.load({
    google: {
        families: [
            'Roboto Condensed:300,400,700&display=swap&subset=latin-ext',
        ],
    },
})

const container = document.getElementById('root')

if (!container) {
    throw new Error('Failed to find the root element for React rendering.')
}

const root = createRoot(container)
root.render(<App />)

// import registerServiceWorker from "./registerServiceWorker";
// registerServiceWorker()
