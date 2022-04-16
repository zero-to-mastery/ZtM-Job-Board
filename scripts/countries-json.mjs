import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Destination file location
const JSON_FILE = 'src/assets/countries.json';

/*
 * Friday, 8 April 2022
 *
 * CSV data sourced from:
 * https://www.npmjs.com/package/world-countries-centroids
 * 
 * https://cdn.jsdelivr.net/gh/gavinr/world-countries-centroids@v0.2.0/dist/countries.csv
 */

// CSV data is conveniently available on a CDN
const dataUrl = 'https://cdn.jsdelivr.net/gh/gavinr/world-countries-centroids@v0.2.0/dist/countries.csv';

// Retrieve the data
const response = await fetch(dataUrl);
const body = await response.text();
const data = body.split('\n');

// Store the converted result into an array
const csvToJsonResult = [];

// Store the CSV column headers a variable
const headers = data[0].split(',');

// Iterate over the remaining data rows
for (let i = 1; i < (data.length - 1); i++) {
  // Empty object to store result in key value pair
  const jsonObject = {};
  // Store the current element
  const currentElementString = data[i];
  // Parse the element string to get the JSON properties
  let string = '';
  let quoteFlag = 0;
  for (let character of currentElementString) {
    if (character === '"' && quoteFlag === 0) {
      quoteFlag = 1;
    }
    else if (character === '"' && quoteFlag == 1)
      quoteFlag = 0;
    if (character === ',' && quoteFlag === 0)
      character = '|';
    if (character !== '"')
      string += character;
  }
  // Extract the JSON properties
  let jsonProperties = string.split('|');
    
  for (let j in headers) {
    if (jsonProperties[j].includes(',')) {
      jsonObject[headers[j]] = jsonProperties[j].split(',').map(item => item.trim());
    }
    else jsonObject[headers[j]] = jsonProperties[j];
  }
  // Push the generated JSON object to result array
  csvToJsonResult.push(jsonObject);
}

// Sort the array by COUNTRY property
const sortByCountry = function (a, b) {
  a = a.COUNTRY.toLowerCase();
  b = b.COUNTRY.toLowerCase();
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

csvToJsonResult.sort(sortByCountry);

// The issue with using centroids is that the marker can end up in the ocean
// Supplemental data taken from the following URL is used to correct such issues
//
// https://developers.google.com/public-data/docs/canonical/countries_csv

// In the event that this file is migrated to TypeScript:
//interface LatLngType {
//  [key: string]: [string, string];
//}

const countryFixes = {
  'Chile' : ['-35.675147', '-71.542969'],
  'Denmark' : ['56.26392-35.6', '9.501785'],
  'Ecuador' : ['-1.831239', '-78.183406'],
  'Greece' : ['39.074208', '21.824312'],
  'Indonesia' : ['-0.789275', '113.921327'],
  'Malaysia' : ['4.210484', '101.975766'],
  'Mauritius' : ['-20.348404', '57.552152'],
  'New Zealand' : ['-40.900557', '174.885971'],
  'Norway' : ['60.472024', '8.468946'],
  'Portugal' : ['39.399872', '-8.224454'],
  'Sweden' : ['60.128161', '18.643501'],
  'United States' : ['37.09024', '-95.712891'],
};

const countriesThatNeedFixes = new Set(Object.keys(countryFixes));

const countryLatLngFixes = (country) => {
  const name = country.COUNTRY;
  if (countriesThatNeedFixes.has(name)) {
    const fix = countryFixes[name];
    country = { ...country, 'latitude':fix[0], 'longitude':fix[1] };
  }
  return country;
}

const fixedCountryData = csvToJsonResult.map(countryLatLngFixes);

// Save the countries JSON file to the assets folder
fs.writeFileSync(
  path.resolve(JSON_FILE),
  JSON.stringify(fixedCountryData, null, 2),
  { encoding: 'utf-8' }
);