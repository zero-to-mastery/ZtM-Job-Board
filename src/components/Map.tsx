import React from 'react'
import {
    MapContainer as LeafletMap,
    Marker,
    Popup,
    TileLayer,
    Tooltip,
} from 'react-leaflet'
import persons from '../assets/persons.json'
import Person from '../interfaces/person'
import { getCountryMarkers } from '../util/personCountries'

const DEFAULT_CENTER: [number, number] = [55.378052, -3.435973]

const people: Person[] = persons
const countryMarkers = getCountryMarkers(people)

function SimpleMap({ zoom = 3 }) {
    const markersArray = countryMarkers.map(
        ({ code, country, latlng, numberOfDevs }) => {
            const numberOfDevsText =
                numberOfDevs === 1
                    ? numberOfDevs + ' Developer from ' + country
                    : numberOfDevs + ' Developers from ' + country
            return (
                <Marker key={code} position={latlng}>
                    <Tooltip>{numberOfDevsText}</Tooltip>
                    <Popup>{numberOfDevsText}</Popup>
                </Marker>
            )
        }
    )

    return (
        <section aria-label="Developer locations map">
            <div style={{ height: '90vh', width: '100%', margin: 0 }}>
                <LeafletMap
                    center={DEFAULT_CENTER}
                    zoom={zoom}
                    minZoom={1}
                    maxZoom={10}
                    attributionControl={true}
                    zoomControl={true}
                    doubleClickZoom={true}
                    scrollWheelZoom={true}
                    dragging={true}
                    easeLinearity={0.35}
                >
                    <TileLayer
                        attribution='&amp;copy <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {markersArray}
                </LeafletMap>
            </div>
        </section>
    )
}

export default SimpleMap
