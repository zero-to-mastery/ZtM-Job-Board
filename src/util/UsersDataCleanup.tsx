import persons from '../assets/persons.json'
import { countDevelopersByCountry } from './countryMarkers'

/* Number of developers per country, keyed by ISO 3166-1 alpha-2 code.
Country values are normalized during JSON aggregation
(see docs/country-normalization.md), so aliases such as "USA",
"US" and "United States" are already grouped under one code. */

const people: any = persons

export const countriesWithNumOfDevsObj = countDevelopersByCountry(people)
