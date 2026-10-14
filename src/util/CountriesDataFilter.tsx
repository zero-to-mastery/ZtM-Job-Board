import countriesData from '../assets/countries.json'

import Country from '../interfaces/country'

const countries: any = countriesData

// Filter the country data to return only an ISO code, a name and [lat,lng] values
const filteredCountryData = countries.map((country: Country) => {
    return {
        iso: country.ISO,
        name: country.COUNTRY,
        latlng: [
            parseFloat(country.latitude).toFixed(1),
            parseFloat(country.longitude).toFixed(1),
        ],
    }
})

export const countriesWithLatLng = filteredCountryData
