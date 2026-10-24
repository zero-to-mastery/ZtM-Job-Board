import React from 'react'
import {
    MapContainer as LeafletMap,
    Marker,
    Popup,
    TileLayer,
    Tooltip,
} from 'react-leaflet'
import persons from '../assets/persons.json'
import type Person from '../interfaces/person'
import { getCountryMarkers } from '../util/personCountries'

const DEFAULT_CENTER: [number, number] = [55.378052, -3.435973]

const people: Person[] = persons

function SimpleMap({ zoom = 3 }) {
    // Profiles with exact coordinates get individual markers.
    const peopleWithCoordinates = people.filter(
        (person) => person.location?.coordinates
    )

    // Profiles without coordinates remain part of country-level counts.
    const peopleWithoutCoordinates = people.filter(
        (person) => !person.location?.coordinates
    )

    const countryMarkers = getCountryMarkers(peopleWithoutCoordinates)

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
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {countryMarkers.map(
                        ({ code, country, latlng, numberOfDevs }) => {
                            const countText =
                                numberOfDevs === 1
                                    ? '1 Developer from ' + country
                                    : numberOfDevs + ' Developers from ' + country

                            return (
                                <Marker key={code} position={latlng}>
                                    <Tooltip>{countText}</Tooltip>
                                    <Popup>{countText}</Popup>
                                </Marker>
                            )
                        }
                    )}

                    {peopleWithCoordinates.map((person) => {
                        const coordinates = person.location?.coordinates
                        if (!coordinates) return null

                        const locationText = [
                            person.location.city,
                            person.location.state,
                            person.location.country,
                        ]
                            .filter(Boolean)
                            .join(', ')

                        return (
                            <Marker
                                key={`person-${person.id}`}
                                position={[coordinates.lat, coordinates.lng]}
                            >
                                <Tooltip>{person.name}</Tooltip>
                                <Popup>
                                    <strong>{person.name}</strong>
                                    {locationText && <p>{locationText}</p>}
                                </Popup>
                            </Marker>
                        )
                    })}
                </LeafletMap>
            </div>
        </section>
    )
}

export default SimpleMap
