import React, { useEffect, useState } from 'react'
import {
    MapContainer as LeafletMap,
    Marker,
    Popup,
    TileLayer,
    Tooltip,
} from 'react-leaflet'

import { countriesWithNumOfDevsObj } from '../util/UsersDataCleanup'
import { countriesWithLatLng } from '../util/CountriesDataFilter'
import { buildCountryMarkers } from '../util/countryMarkers'

let centerLatLngArr: any = []

function SimpleMap({ zoom = 3 }) {
    const [allCountriesLatLang, setAllCountriesLatLang] = useState([])
    useEffect(() => {
        setAllCountriesLatLang(countriesWithLatLng)
    }, [])

    // Developer counts and marker coordinates are both keyed by ISO country code
    let finalArrayWithCountryAndLatLng: any = buildCountryMarkers(
        countriesWithNumOfDevsObj,
        allCountriesLatLang
    )

    // DO NOT DELETE THIS COMMENTED OUT CODE BELOW
    // Might need it to check for unexpected repeated entries which is easier with sorted countries
    /*
  let sorterFunction = finalArrayWithCountryAndLatLng.sort(function(a, b) {
    var nameA = a.country.toUpperCase(); // ignore upper and lowercase
    var nameB = b.country.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    // names must be equal
    return 0;
  });
  console.log(sorterFunction);
  */

    const markersArray = finalArrayWithCountryAndLatLng.map(
        ({ code, country, latlng, numberOfDevs }: any) => {
            let numberOfDevsText =
                numberOfDevs === 1
                    ? numberOfDevs + ' Developer from ' + country
                    : numberOfDevs + ' Developers from ' + country
            return (
                <Marker key={code} position={[latlng[0], latlng[1]]}>
                    <Tooltip>{numberOfDevsText}</Tooltip>
                    <Popup>{numberOfDevsText}</Popup>
                </Marker>
            )
        }
    )

    const center: any =
        centerLatLngArr.length > 0
            ? [centerLatLngArr[0].lat, centerLatLngArr[0].lng]
            : [55.378052, -3.435973]

        return (
             <section aria-label="Developer locations map">
                <div style={{ height: '90vh', width: '100%', margin: 0 }}>
                <LeafletMap
                    center={center}
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
