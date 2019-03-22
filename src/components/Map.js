import React from 'react';
import GoogleMapReact from 'google-map-react';
import Canvas from './Canvas';
import { persons } from './persons';

const AnyReactComponent = props => <div>{props.children}</div>;

let arr = [];

//This should be in the life-cycle method componentDIdMount but all efforts
//to make it work from there wasn't successful, the state doesn't update properly
//Now the api is fetched when the site runs. This is not good

persons.forEach(person => {
  let location;
  if (person.location.country) {
    //remove unnecessary characters from person.location.country where possible
    location = person.location.country.toLowerCase();
    if (location.search(/\s(?=\(|<)/) !== -1)
      location = location.slice(0, location.search(/\s(?=\(|<)/g));
  }

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
          } else if (location === 'united states') {
            // hard coded for some students in usa, becus of API return
            arr.push({ lat: data[1].latlng[0], lng: data[1].latlng[1] });
          } else if (location === 'uk') {
            //hard coded for some students in uk,  becus of API returns
            arr.push({ lat: data[3].latlng[0], lng: data[3].latlng[1] });
          }
        }
      }
    })
    .catch(err => console.error(err));
});

function SimpleMap({ center = { lat: 55.378052, lng: -3.435973 }, zoom = 4 }) {
  return (
    // Important! Always set the container height explicitly
    <div style={{ height: '100vh', width: '100%' }}>
      <GoogleMapReact
        //I could not figure out a safe place to store this key, since there's no server
        bootstrapURLKeys={{ key: 'AIzaSyAc9rLvEJvIGk_UZ6af_kiC5_xenNVLaMU' }}
        defaultCenter={center}
        defaultZoom={zoom}
      >
        {arr.length !== 0 ? (
          arr.map((location, i) => (
            <AnyReactComponent
              key={i}
              lat={location.lat + Math.random()}
              lng={location.lng + Math.random()}
            >
              <Canvas />
            </AnyReactComponent>
          ))
        ) : (
          <AnyReactComponent lat={55.378052} lng={-3.764658}>
            <Canvas />
          </AnyReactComponent>
        )}
      </GoogleMapReact>
    </div>
  );
}

export default SimpleMap;
