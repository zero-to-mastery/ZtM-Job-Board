import L from 'leaflet'
import React, { memo, useMemo } from 'react'
import { Marker } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import Person from '../interfaces/person'
import {
    escapeHtml,
    initials,
    personGeo,
    safeImageUrl,
} from '../util/mapGeometry'

const MARKER_SIZE = 34

const iconCache = new Map<string, L.DivIcon>()

function personIcon(person: Person, selected: boolean, starred: boolean) {
    const key = `${person.id}|${selected}|${starred}`
    const cached = iconCache.get(key)
    if (cached) return cached

    const approximate = personGeo(person)?.approximate
    const photo = safeImageUrl(person.img)
    const label = [
        person.name,
        person.jobTitle,
        approximate ? 'approximate location' : '',
        starred ? 'shortlisted' : '',
    ]
        .filter(Boolean)
        .join(', ')
    const classes = [
        'devmap-pin',
        approximate ? 'devmap-pin--approximate' : '',
        selected ? 'devmap-pin--selected' : '',
        starred ? 'devmap-pin--starred' : '',
    ]
        .filter(Boolean)
        .join(' ')

    const icon = L.divIcon({
        className: 'devmap-marker',
        iconSize: [MARKER_SIZE, MARKER_SIZE],
        iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE / 2],
        html:
            `<span class="${classes}">` +
            `<span class="devmap-pin__initials" aria-hidden="true">${escapeHtml(initials(person.name))}</span>` +
            (photo
                ? `<span class="devmap-pin__photo" aria-hidden="true" style="background-image:url('${escapeHtml(photo)}')"></span>`
                : '') +
            `<span class="sr-only">${escapeHtml(label)}</span>` +
            '</span>' +
            (starred
                ? '<span class="devmap-pin__star" aria-hidden="true">★</span>'
                : ''),
    })
    iconCache.set(key, icon)
    return icon
}

// Cluster bubbles are buttons too: Leaflet makes markers focusable and
// Enter activates them, which zooms into the cluster
function clusterIcon(cluster: L.MarkerCluster) {
    const count = cluster.getChildCount()
    const size = count < 10 ? 36 : count < 100 ? 44 : 54
    return L.divIcon({
        className: 'devmap-marker devmap-cluster-marker',
        iconSize: [size, size],
        html:
            `<span class="devmap-cluster" style="width:${size}px;height:${size}px">` +
            `<span aria-hidden="true">${count}</span>` +
            `<span class="sr-only">${count} developers here. Press Enter to zoom in.</span>` +
            '</span>',
    })
}

interface MarkerItemProps {
    person: Person
    selected: boolean
    starred: boolean
    onSelect: (id: string) => void
    registerMarker: (id: string, marker: L.Marker | null) => void
}

const MarkerItem = memo(function MarkerItem({
    person,
    selected,
    starred,
    onSelect,
    registerMarker,
}: MarkerItemProps) {
    const position = useMemo<[number, number]>(
        () => [personGeo(person)!.lat, personGeo(person)!.lng],
        [person]
    )
    const eventHandlers = useMemo(
        () => ({ click: () => onSelect(person.id) }),
        [onSelect, person.id]
    )
    return (
        <Marker
            ref={(marker) => registerMarker(person.id, marker)}
            position={position}
            icon={personIcon(person, selected, starred)}
            zIndexOffset={selected ? 1000 : 0}
            eventHandlers={eventHandlers}
        />
    )
})

interface DeveloperMarkersProps {
    people: Person[]
    selectedId: string | null
    isStarred: (id: string) => boolean
    onSelect: (id: string) => void
    registerMarker: (id: string, marker: L.Marker | null) => void
    clusterRef: React.Ref<L.MarkerClusterGroup>
}

// One clustered marker per developer with known coordinates
function DeveloperMarkers({
    people,
    selectedId,
    isStarred,
    onSelect,
    registerMarker,
    clusterRef,
}: DeveloperMarkersProps) {
    return (
        <MarkerClusterGroup
            ref={clusterRef}
            chunkedLoading
            showCoverageOnHover={false}
            maxClusterRadius={48}
            spiderfyOnMaxZoom
            iconCreateFunction={clusterIcon}
        >
            {people.map((person) =>
                personGeo(person) ? (
                    <MarkerItem
                        key={person.id}
                        person={person}
                        selected={person.id === selectedId}
                        starred={isStarred(person.id)}
                        onSelect={onSelect}
                        registerMarker={registerMarker}
                    />
                ) : null
            )}
        </MarkerClusterGroup>
    )
}

export default DeveloperMarkers
