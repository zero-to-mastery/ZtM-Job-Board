import React from 'react'
import '../styles/MapSkeleton.scss'

function MapSkeleton() {
    return (
        <div className="map-skeleton" aria-label="Loading map">
            <div className="map-skeleton__grid">
                <div className="map-skeleton__tile" />
                <div className="map-skeleton__tile" />
                <div className="map-skeleton__tile" />
                <div className="map-skeleton__tile" />
                <div className="map-skeleton__tile" />
                <div className="map-skeleton__tile" />
            </div>
            <div className="map-skeleton__marker" />
            <div className="map-skeleton__attribution" />
        </div>
    )
}

export default MapSkeleton