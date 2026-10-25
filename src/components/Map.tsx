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
import { groupPeopleByCoordinates } from '../util/groupPeopleByCoordinates'

const DEFAULT_CENTER: [number, number] = [55.378052, -3.435973]

const people: Person[] = persons

function SimpleMap({ zoom = 3 }) {
    const peopleWithCoordinates = []
    const peopleWithoutCoordinates = []
    for (const person of people) {
        if (person.location?.coordinates) {
            peopleWithCoordinates.push(person)
        } else {
            peopleWithoutCoordinates.push(person)
        }
    }

    const countryMarkers = getCountryMarkers(peopleWithoutCoordinates)
    const coordinateGroups = groupPeopleByCoordinates(peopleWithCoordinates)

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
                                    ? '1 developer without an exact pin from ' +
                                      country
                                    : numberOfDevs +
                                      ' developers without exact pins from ' +
                                      country
                            return (
                                <Marker key={code} position={latlng}>
                                    <Tooltip>{countText}</Tooltip>
                                    <Popup>{countText}</Popup>
                                </Marker>
                            )
                        }
                    )}
                    {coordinateGroups.map(
                        ({ key, lat, lng, people: group }) => (
                            <Marker
                                key={`coordinates-${key}`}
                                position={[lat, lng]}
                            >
                                <Tooltip>
                                    {group.length === 1
                                        ? group[0].name
                                        : `${group.length} developers at this location`}
                                </Tooltip>
                                <Popup>
                                    <strong>
                                        {group.length === 1
                                            ? 'Developer'
                                            : `${group.length} developers at this location`}
                                    </strong>
                                    {group.map((person) => {
                                        const locationText = [
                                            person.location?.city,
                                            person.location?.state,
                                            person.location?.country,
                                        ]
                                            .filter(Boolean)
                                            .join(', ')

                                        return (
                                            <div key={person.id}>
                                                <p>
                                                    <strong>
                                                        {person.name}
                                                    </strong>
                                                </p>
                                                {locationText && (
                                                    <p>{locationText}</p>
                                                )}
                                                {person.links?.github && (
                                                    <p>
                                                        <a
                                                            href={
                                                                person.links
                                                                    .github
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            GitHub profile
                                                        </a>
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    })}
                                </Popup>
                            </Marker>
                        )
                    )}
                </LeafletMap>
            </div>
        </section>
    )
}

export default SimpleMap
