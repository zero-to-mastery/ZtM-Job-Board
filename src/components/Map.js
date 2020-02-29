import React, { useEffect, useState } from "react";
import { Map as LeafletMap, TileLayer, Marker, Popup } from "react-leaflet";
import { countriesWithNumOfDevsObj } from "./UsersDataCleanup";

// console.log(countriesWithNumOfDevsObj);

// Array of country names and number of devs in those countries
/* Needed to match country names from countriesWithNumOfDevsObj against 
country names fetched from API to get their latitude and longitude for markers */
const countryNamesAndNumOfDevsArr = Object.entries(countriesWithNumOfDevsObj);

// console.log(countryNamesAndNumOfDevsArr);

let centerLatLngArr = [];

function SimpleMap({ zoom = 3 }) {
  const [allCountriesLatLang, setAllCountriesLatLang] = useState([]);

  useEffect(() => {
    fetch(`https://restcountries.eu/rest/v2/all`)
      .then(resp => resp.json())
      .then(data => setAllCountriesLatLang(data))
      .catch(err => console.error(err));
  }, []);

  // console.log(allCountriesLatLang);

  let countriesLatLngArr = allCountriesLatLang.map(({ name, latlng }) => ({
    name,
    latlng
  }));
  // console.log(countriesLatLngArr);

  /* 
  Made separate variable for UK because name of UK in API is "United Kingdom 
  of Great Britain and Northern Ireland" which probably none of the users will use
  */
  const UK = {
    country: "United Kingdom",
    latlng: [54, -2], // copied from API
    numberOfDevs: countriesWithNumOfDevsObj["United Kingdom"]
  };

  // Two nested for loops are okay as array items will always be < 250 in both arrays
  let finalArrayWithCountryAndLatLng = [];
  function finalCountryAndLocationArray() {
    for (let i = 0; i < countryNamesAndNumOfDevsArr.length; i++) {
      for (let j = 0; j < countriesLatLngArr.length; j++) {
        if (
          countryNamesAndNumOfDevsArr[i][0].toLowerCase() ===
          countriesLatLngArr[j].name.toLowerCase()
        ) {
          finalArrayWithCountryAndLatLng.push({
            country: countryNamesAndNumOfDevsArr[i][0],
            latlng: countriesLatLngArr[j].latlng,
            numberOfDevs: countryNamesAndNumOfDevsArr[i][1]
          });
        }
      }
    }
    // Add UK to final array of countries and co-ordinates
    finalArrayWithCountryAndLatLng.push(UK);
    return finalArrayWithCountryAndLatLng;
  }
  finalCountryAndLocationArray();
  // console.log(finalArrayWithCountryAndLatLng);

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
    ({ country, latlng, numberOfDevs }) => {
      return (
        <Marker
          key={country}
          position={[latlng[0], latlng[1]]}
          color="royalblue"
          title={
            numberOfDevs === 1
              ? numberOfDevs + " Developer from " + country
              : numberOfDevs + " Developers from " + country
          }
          text={numberOfDevs}
        >
          <Popup>
            {numberOfDevs === 1
              ? numberOfDevs + " Developer from " + country
              : numberOfDevs + " Developers from " + country}
          </Popup>
        </Marker>
      );
    }
  );

  const center =
    centerLatLngArr.length > 0
      ? [centerLatLngArr[0].lat, centerLatLngArr[0].lng]
      : [55.378052, -3.435973];

  return (
    <div style={{ height: "90vh", width: "100%", margin: 0 }}>
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
        animate={true}
        easeLinearity={0.35}
      >
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
        />
        {markersArray}
      </LeafletMap>
    </div>
  );
}

export default SimpleMap;
