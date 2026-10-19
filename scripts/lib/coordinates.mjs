/**
 * Checks the optional `location.coordinates` of a submission: an exact map
 * position for places the city lookup cannot find. Two decimal places (about
 * 1 km) is enough to place a town and keeps a street address private.
 *
 * @param {unknown} coordinates
 */
export function validateCoordinates(coordinates) {
    if (coordinates === undefined) return

    const valid = (value, limit) =>
        typeof value === 'number' &&
        Number.isFinite(value) &&
        Math.abs(value) <= limit &&
        Math.round(value * 100) / 100 === value

    if (
        coordinates === null ||
        typeof coordinates !== 'object' ||
        Array.isArray(coordinates) ||
        Object.keys(coordinates).sort().join() !== 'lat,lng' ||
        !valid(coordinates.lat, 90) ||
        !valid(coordinates.lng, 180)
    ) {
        throw new Error(
            '"location.coordinates" must be { "lat": <-90 to 90>, "lng": <-180 to 180> } ' +
                'with at most 2 decimal places, for example { "lat": 39.29, "lng": -79.34 }. ' +
                'Omit it to be placed by your city.'
        )
    }
}
