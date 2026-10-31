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

// Older versions of the app registered a service worker. Unregister any
// registrations left behind so returning visitors do not keep serving stale,
// pre-Vite cached assets.
if ('serviceWorker' in navigator) {
    void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
            Promise.all(
                registrations.map((registration) => registration.unregister())
            )
        )
}

const container = document.getElementById('root')

if (!container) {
    throw new Error('Failed to find the root element for React rendering.')
}

const root = createRoot(container)
root.render(<App />)
