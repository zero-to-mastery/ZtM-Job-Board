import L from 'leaflet'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    MapContainer as LeafletMap,
    Popup,
    TileLayer,
    useMap,
    useMapEvents,
} from 'react-leaflet'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import '../styles/DeveloperMap.scss'

import Person from '../interfaces/person'
import { BoundsBox, peopleInBounds, personGeo } from '../util/mapGeometry'
import DeveloperList from './DeveloperList'
import DeveloperMarkers from './DeveloperMarkers'
import DeveloperPopupCard from './DeveloperPopupCard'
import DeveloperTimeInfo from './DeveloperTimeInfo'
import ShortlistControls, {
    CopyLinkButton,
    StarButton,
} from './ShortlistControls'
import { useNow } from '../hooks/useNow'
import { Shortlist } from '../hooks/useShortlist'
import { personHash } from '../util/shortlist'

// Start from a world view rather than a single country
export const WORLD_CENTER: [number, number] = [20, 0]

const toBox = (bounds: L.LatLngBounds): BoundsBox => ({
    south: bounds.getSouth(),
    west: bounds.getWest(),
    north: bounds.getNorth(),
    east: bounds.getEast(),
})

// Reports the visible area whenever the map stops moving
function ViewTracker({ onChange }: { onChange: (box: BoundsBox) => void }) {
    const map = useMap()
    useMapEvents({ moveend: () => onChange(toBox(map.getBounds())) })
    useEffect(() => onChange(toBox(map.getBounds())), [map, onChange])
    return null
}

interface SimpleMapProps {
    // Developers matching the shared search and filters
    people: Person[]
    // Everyone, so the shortlist can list developers hidden by filters
    allPeople: Person[]
    // The recruiter's UTC offset, for working-hours overlap
    recruiterOffset: number
    shortlist: Shortlist
    // Developer to open from a #person-<id> link
    focusId: string | null
    onFocusHandled: () => void
    zoom?: number
}

// Keeps the address bar pointing at the selected developer
const showInAddressBar = (id: string) => {
    try {
        window.history.replaceState(null, '', personHash(id))
    } catch {
        // Not allowed in some sandboxed frames; the map still works
    }
}

function SimpleMap({
    people,
    allPeople,
    recruiterOffset,
    shortlist,
    focusId,
    onFocusHandled,
    zoom = 2,
}: SimpleMapProps) {
    const now = useNow()
    const [showShortlist, setShowShortlist] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [popupId, setPopupId] = useState<string | null>(null)
    const [inViewOnly, setInViewOnly] = useState(true)
    const [bounds, setBounds] = useState<BoundsBox | null>(null)
    const clusterRef = useRef<L.MarkerClusterGroup>(null)
    const markers = useRef(new Map<string, L.Marker>())
    const listHeading = useRef<HTMLParagraphElement>(null)

    const plotted = useMemo(
        () => people.filter((person) => personGeo(person) !== null),
        [people]
    )
    const shortlisted = useMemo(() => {
        const byId = new Map(allPeople.map((person) => [person.id, person]))
        return shortlist.ids
            .map((id) => byId.get(id))
            .filter((person): person is Person => Boolean(person))
    }, [allPeople, shortlist.ids])
    const listed = useMemo(() => {
        if (showShortlist) return shortlisted
        return inViewOnly ? peopleInBounds(plotted, bounds) : people
    }, [showShortlist, shortlisted, inViewOnly, plotted, people, bounds])
    const popupPerson = useMemo(
        () => plotted.find((person) => person.id === popupId) ?? null,
        [plotted, popupId]
    )
    const popupPosition = useMemo<[number, number] | null>(() => {
        const geo = popupPerson && personGeo(popupPerson)
        return geo ? [geo.lat, geo.lng] : null
    }, [popupPerson])

    // Drop the selection when filters remove that developer
    useEffect(() => {
        if (selectedId && !people.some((person) => person.id === selectedId)) {
            setSelectedId(null)
            setPopupId(null)
        }
    }, [people, selectedId])

    const registerMarker = useCallback(
        (id: string, marker: L.Marker | null) => {
            if (marker) markers.current.set(id, marker)
            else markers.current.delete(id)
        },
        []
    )

    // Marker click: highlight the list entry and open the popup
    const selectFromMap = useCallback((id: string) => {
        setSelectedId(id)
        setPopupId(id)
        showInAddressBar(id)
    }, [])

    // Zoom until the marker is out of its cluster, then open its popup.
    // Markers join the cluster in batches, so wait briefly for new ones.
    const openMarker = useCallback((id: string, attempts = 20) => {
        const marker = markers.current.get(id)
        const cluster = clusterRef.current
        if (marker && cluster?.hasLayer(marker)) {
            cluster.zoomToShowLayer(marker, () => setPopupId(id))
        } else if (attempts > 0) {
            setTimeout(() => openMarker(id, attempts - 1), 100)
        }
    }, [])

    // List click: highlight it and open the marker
    const selectFromList = useCallback(
        (id: string) => {
            setSelectedId(id)
            setPopupId(null)
            showInAddressBar(id)
            openMarker(id)
        },
        [openMarker]
    )

    // #person-<id> links
    useEffect(() => {
        if (!focusId) return
        if (people.some((person) => person.id === focusId)) {
            selectFromList(focusId)
        }
        onFocusHandled()
    }, [focusId, people, selectFromList, onFocusHandled])

    const closePopup = useCallback((id: string) => {
        setPopupId((current) => (current === id ? null : current))
    }, [])

    const handleBounds = useCallback((box: BoundsBox) => setBounds(box), [])

    const unplotted = people.length - plotted.length

    return (
        <section className="devmap" aria-label="Developer map">
            {/* Lets keyboard users jump past the map markers */}
            <button
                type="button"
                className="devmap-button devmap-skip"
                onClick={() => listHeading.current?.focus()}
            >
                Skip to developer list
            </button>
            <div className="devmap__map">
                <LeafletMap
                    center={WORLD_CENTER}
                    zoom={zoom}
                    minZoom={1}
                    maxZoom={12}
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
                    <ViewTracker onChange={handleBounds} />
                    <DeveloperMarkers
                        people={plotted}
                        selectedId={selectedId}
                        isStarred={shortlist.has}
                        onSelect={selectFromMap}
                        registerMarker={registerMarker}
                        clusterRef={clusterRef}
                    />
                    {popupPerson && popupPosition && (
                        <Popup
                            key={popupPerson.id}
                            position={popupPosition}
                            offset={[0, -12]}
                            maxWidth={320}
                            minWidth={240}
                            eventHandlers={{
                                remove: () => closePopup(popupPerson.id),
                            }}
                        >
                            <DeveloperPopupCard
                                person={popupPerson}
                                actions={
                                    <>
                                        <StarButton
                                            person={popupPerson}
                                            shortlist={shortlist}
                                        />
                                        <CopyLinkButton person={popupPerson} />
                                    </>
                                }
                            >
                                <p className="devmap-card__extra">
                                    <DeveloperTimeInfo
                                        person={popupPerson}
                                        recruiterOffset={recruiterOffset}
                                        now={now}
                                    />
                                </p>
                            </DeveloperPopupCard>
                        </Popup>
                    )}
                </LeafletMap>
            </div>

            <aside className="devmap__panel" aria-label="Developers">
                <div className="devmap__panel-header">
                    <p
                        className="devmap__count"
                        aria-live="polite"
                        ref={listHeading}
                        tabIndex={-1}
                    >
                        {showShortlist
                            ? `${listed.length} shortlisted ${listed.length === 1 ? 'developer' : 'developers'}`
                            : inViewOnly
                              ? `${listed.length} of ${people.length} developers in this map area`
                              : `${people.length} matching developers`}
                    </p>
                    <label className="devmap-toggle">
                        <input
                            type="checkbox"
                            disabled={showShortlist}
                            checked={inViewOnly}
                            onChange={(event) =>
                                setInViewOnly(event.target.checked)
                            }
                        />
                        Only list developers in the map area
                    </label>
                    <ShortlistControls
                        shortlist={shortlist}
                        people={shortlisted}
                        showing={showShortlist}
                        onShowingChange={setShowShortlist}
                    />
                    {!showShortlist && !inViewOnly && unplotted > 0 && (
                        <p className="devmap__note">
                            {unplotted} without a recognizable location are
                            listed but not on the map.
                        </p>
                    )}
                </div>
                <DeveloperList
                    people={listed}
                    selectedId={selectedId}
                    onSelect={selectFromList}
                    emptyMessage={
                        showShortlist
                            ? 'No developers shortlisted yet. Use the star on a developer to add them.'
                            : undefined
                    }
                    renderActions={(person) => (
                        <StarButton person={person} shortlist={shortlist} />
                    )}
                    renderExtras={(person) => (
                        <DeveloperTimeInfo
                            className="devmap-entry__meta"
                            person={person}
                            recruiterOffset={recruiterOffset}
                            now={now}
                        />
                    )}
                />
            </aside>
        </section>
    )
}

export default SimpleMap
