// Explicit rules used by resolveCountry.js.
//
// Every display name in countryNames.js is already accepted automatically, so
// only list *other* spellings here. Write entries the way people type them:
// keys are passed through normalizeCountryKey() when the module loads, so case,
// accents, punctuation, "&" vs "and", hyphens and a leading "The" do not matter.
//
// See docs/country-normalization.md before editing.

/**
 * Alternative names, abbreviations, native names and known typos.
 * Value is an ISO 3166-1 alpha-2 code.
 */
export const COUNTRY_ALIASES = Object.freeze({
    // United States
    US: 'US',
    USA: 'US',
    'U.S.': 'US',
    'U.S.A.': 'US',
    'United States of America': 'US',
    'United States America': 'US',
    'United State': 'US', // typo seen in submissions

    // United Kingdom (including its constituent countries)
    UK: 'GB',
    'U.K.': 'GB',
    'Great Britain': 'GB',
    Britain: 'GB',
    England: 'GB',
    Scotland: 'GB',
    Wales: 'GB',
    'Northern Ireland': 'GB',

    // United Arab Emirates
    UAE: 'AE',
    'U.A.E.': 'AE',
    'United Arab Emirate': 'AE', // typo seen in submissions

    // Native-language names
    Brasil: 'BR',
    Deutschland: 'DE',
    Nederland: 'NL',
    España: 'ES',
    Italia: 'IT',
    Polska: 'PL',

    // Former, formal or alternative English names
    Turkey: 'TR',
    'Czech Republic': 'CZ',
    'Russian Federation': 'RU',
    'Viet Nam': 'VN',
    'Brunei Darussalam': 'BN',
    Burma: 'MM',
    'Ivory Coast': 'CI',
    'Cape Verde': 'CV',
    Swaziland: 'SZ',
    'East Timor': 'TL',
    'Holy See': 'VA',
    Macau: 'MO',
    'Hong Kong SAR': 'HK',
    'Hong Kong SAR China': 'HK',
    'Palestinian Territories': 'PS',
    'Palestinian Territory': 'PS',
    'State of Palestine': 'PS',
    'Iran (Islamic Republic of)': 'IR',
    'Islamic Republic of Iran': 'IR',
    'Syrian Arab Republic': 'SY',
    'Lao PDR': 'LA',
    "Lao People's Democratic Republic": 'LA',
    'Republic of Moldova': 'MD',
    'United Republic of Tanzania': 'TZ',
    'Bolivia (Plurinational State of)': 'BO',
    'Venezuela (Bolivarian Republic of)': 'VE',
    'Federated States of Micronesia': 'FM',
    'Korea (Republic of)': 'KR',
    'Korea, Republic of': 'KR',
    'Republic of Korea': 'KR',
    "Korea (Democratic People's Republic of)": 'KP',
    DPRK: 'KP',
    'Democratic Republic of Congo': 'CD',
    'DR Congo': 'CD',
    DRC: 'CD',
    'Congo DRC': 'CD',
    'Congo - Kinshasa': 'CD',
    'Congo - Brazzaville': 'CG',
    'Congo-Brazzaville': 'CG',
    'Republic of North Macedonia': 'MK',
    // The country's official short name until 2019. Every submission using it
    // is from North Macedonia (Skopje, Bitola); the Greek region of the same
    // name is not a country, so there is no country-level ambiguity.
    Macedonia: 'MK',
    'St Lucia': 'LC',
    'St Kitts and Nevis': 'KN',
    'St Vincent and the Grenadines': 'VC',

    // Known typos seen in submissions
    Eygpt: 'EG',
    SriLanka: 'LK',
})

/**
 * Values that look like a country but cannot be attributed to one without more
 * context. These are never resolved; they are reported as "ambiguous".
 *
 * Bare two-letter codes are handled by a separate rule in resolveCountry.js.
 */
export const AMBIGUOUS_COUNTRY_TERMS = Object.freeze({
    Georgia: 'Could be the country Georgia or the US state of Georgia',
    Korea: 'Could be South Korea or North Korea',
    Congo: 'Could be the Republic of the Congo or the Democratic Republic of the Congo',
    America: 'Could be the United States or the Americas',
    Jerusalem: 'City whose national attribution is disputed, not a country',
})

/**
 * Values that are clearly not a place of residence.
 */
export const NON_LOCATION_TERMS = Object.freeze({
    Earth: 'Not a country',
    'Planet Earth': 'Not a country',
    World: 'Not a country',
    Worldwide: 'Not a country',
    Global: 'Not a country',
    Anywhere: 'Not a country',
    Everywhere: 'Not a country',
})
