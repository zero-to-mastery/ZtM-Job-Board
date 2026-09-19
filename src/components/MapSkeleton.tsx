import React from 'react'

function MapSkeleton() {
    return (
        <div
            className="map-skeleton"
            role="status"
            aria-label="Loading map"
        >
            <div className="map-skeleton__content">
                <div className="map-skeleton__spinner" />
                <p>Loading map...</p>
            </div>
        </div>
    )
}

export default MapSkeleton
