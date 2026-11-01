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
import { buildLocationMarkers } from '../util/locationMarkers'
import DeveloperLocationPopup from './DeveloperLocationPopup'

const DEFAULT_CENTER: [number, number] = [55.378052, -3.435973]

// Approximate pins use the default icon, like exact pins, but are drawn faded
const APPROXIMATE_OPACITY = 0.6

const people: Person[] = persons

function SimpleMap({ zoom = 3 }) {
    const { countryMarkers, coordinateGroups, approximateMarkers } =
        buildLocationMarkers(people)

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
                                    <DeveloperLocationPopup people={group} />
                                </Popup>
                            </Marker>
                        )
                    )}
                    {approximateMarkers.map(
                        ({ person, lat, lng, approximate }) => {
                            const locationText = [
                                person.location?.city,
                                person.location?.state,
                                person.location?.country,
                            ]
                                .filter(Boolean)
                                .join(', ')
                            const placementText = approximate
                                ? 'Approximate location: region or country centre'
                                : 'Estimated from city name'
                            return (
                                <Marker
                                    key={`approximate-${person.id}`}
                                    position={[lat, lng]}
                                    opacity={APPROXIMATE_OPACITY}
                                >
                                    <Tooltip>{person.name}</Tooltip>
                                    <Popup>
                                        <strong>{person.name}</strong>
                                        {locationText && <p>{locationText}</p>}
                                        <p>{placementText}</p>
                                        {person.links?.github && (
                                            <p>
                                                <a
                                                    href={person.links.github}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    GitHub profile
                                                </a>
                                            </p>
                                        )}
                                    </Popup>
                                </Marker>
                            )
                        }
                    )}
                </LeafletMap>
            </div>
            <p className="f6 ph3 pv2 ma0">
                Faded pins are approximate: they show a city, region or country
                centre, not an exact location.
            </p>
        </section>
    )
}

export default SimpleMap
