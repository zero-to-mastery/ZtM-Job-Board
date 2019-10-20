import React from "react";
import { Map as LeafletMap, TileLayer, Marker } from 'react-leaflet';

import { people } from "../assets/persons";

let arr = [];

//This should be in the life-cycle method componentDIdMount but all efforts
//to make it work from there wasn't successful, the state doesn't update properly
//Now the api is fetched when the site runs. This is not good

people.forEach(person => {
  let location;
  if (person.location.country) {
    //remove unnecessary characters from person.location.country where possible
    location = person.location.country.toLowerCase();
    if (location.search(/\s(?=\(|<)/) !== -1)
      location = location.slice(0, location.search(/\s(?=\(|<)/g));
  }

  // wont make a fetch request if location is not provided/undefined/empty
  if (location) {
    fetch(`https://restcountries.eu/rest/v2/name/${location}`)
      .then(resp => resp.json())
      .then(data => {
        if (data.length === 1) {
          arr.push({ lat: data[0].latlng[0], lng: data[0].latlng[1] });
        } else {
          let someCountry;
          if (data.length) {
            someCountry = data.filter(
              country => country.name.toLowerCase() === location.toLowerCase()
            );
            if (someCountry.length === 1) {
              // mostly students in india, becus of API returns
              arr.push({
                lat: someCountry[0].latlng[0],
                lng: someCountry[0].latlng[1]
              });
            } else if (location === "united states") {
              // hard coded for some students in usa, becus of API return
              arr.push({ lat: data[1].latlng[0], lng: data[1].latlng[1] });
            } else if (location === "uk") {
              //hard coded for some students in uk,  becus of API returns
              arr.push({ lat: data[3].latlng[0], lng: data[3].latlng[1] });
            }
          }
        }
      })
      .catch(err => console.error(err));
  }
});

function SimpleMap({ zoom = 4 }) {

  const center  =  (arr.length > 0) ? [arr[0].lat, arr[0].lng]: [ 55.378052, -3.435973 ] ;

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <LeafletMap
        center={center}
        zoom={zoom}
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
          attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
        />
        { 
            arr.map((location, i) => (
              <Marker 
                key={i}
                position={[location.lat, location.lng]}>
              </Marker>

            ))
        }
      </LeafletMap>
    </div>
  );
}

export default SimpleMap;
