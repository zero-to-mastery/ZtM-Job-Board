// US state codes, names and a predominant IANA time zone for each state.
//
// Offline and deterministic: a lookup is an exact match after lowercasing and
// removing every character outside a-z, so "California", "ca." and "CA" all
// resolve to "CA". Nothing is fuzzy-matched. Only the 50 states and DC are
// covered. Territories (for example "Puerto Rico"), abbreviations that are not
// USPS codes (for example "Calif.") and any other text return null.
//
// The input must be a US state field. Text that is also a country or another
// place name, such as "Georgia" or "Washington", resolves to the state, so do
// not pass free-form country text here.
//
// Zones are predominant-state approximations, not city-level claims. Many
// states span more than one zone: Texas includes El Paso on Mountain time, and
// the western Florida panhandle is on Central time. Prefer a resolved city's
// zone when one is known, and use these values only as a fallback.

type StateRow = readonly [code: string, name: string, zone: string]

const STATES: readonly StateRow[] = [
    ['AL', 'Alabama', 'America/Chicago'],
    ['AK', 'Alaska', 'America/Anchorage'],
    ['AZ', 'Arizona', 'America/Phoenix'],
    ['AR', 'Arkansas', 'America/Chicago'],
    ['CA', 'California', 'America/Los_Angeles'],
    ['CO', 'Colorado', 'America/Denver'],
    ['CT', 'Connecticut', 'America/New_York'],
    ['DE', 'Delaware', 'America/New_York'],
    ['DC', 'District of Columbia', 'America/New_York'],
    ['FL', 'Florida', 'America/New_York'],
    ['GA', 'Georgia', 'America/New_York'],
    ['HI', 'Hawaii', 'Pacific/Honolulu'],
    ['ID', 'Idaho', 'America/Boise'],
    ['IL', 'Illinois', 'America/Chicago'],
    ['IN', 'Indiana', 'America/Indiana/Indianapolis'],
    ['IA', 'Iowa', 'America/Chicago'],
    ['KS', 'Kansas', 'America/Chicago'],
    ['KY', 'Kentucky', 'America/New_York'],
    ['LA', 'Louisiana', 'America/Chicago'],
    ['ME', 'Maine', 'America/New_York'],
    ['MD', 'Maryland', 'America/New_York'],
    ['MA', 'Massachusetts', 'America/New_York'],
    ['MI', 'Michigan', 'America/Detroit'],
    ['MN', 'Minnesota', 'America/Chicago'],
    ['MS', 'Mississippi', 'America/Chicago'],
    ['MO', 'Missouri', 'America/Chicago'],
    ['MT', 'Montana', 'America/Denver'],
    ['NE', 'Nebraska', 'America/Chicago'],
    ['NV', 'Nevada', 'America/Los_Angeles'],
    ['NH', 'New Hampshire', 'America/New_York'],
    ['NJ', 'New Jersey', 'America/New_York'],
    ['NM', 'New Mexico', 'America/Denver'],
    ['NY', 'New York', 'America/New_York'],
    ['NC', 'North Carolina', 'America/New_York'],
    ['ND', 'North Dakota', 'America/Chicago'],
    ['OH', 'Ohio', 'America/New_York'],
    ['OK', 'Oklahoma', 'America/Chicago'],
    ['OR', 'Oregon', 'America/Los_Angeles'],
    ['PA', 'Pennsylvania', 'America/New_York'],
    ['RI', 'Rhode Island', 'America/New_York'],
    ['SC', 'South Carolina', 'America/New_York'],
    ['SD', 'South Dakota', 'America/Chicago'],
    ['TN', 'Tennessee', 'America/Chicago'],
    ['TX', 'Texas', 'America/Chicago'],
    ['UT', 'Utah', 'America/Denver'],
    ['VT', 'Vermont', 'America/New_York'],
    ['VA', 'Virginia', 'America/New_York'],
    ['WA', 'Washington', 'America/Los_Angeles'],
    ['WV', 'West Virginia', 'America/New_York'],
    ['WI', 'Wisconsin', 'America/Chicago'],
    ['WY', 'Wyoming', 'America/Denver'],
]

const compact = (value: string): string =>
    value.toLowerCase().replace(/[^a-z]/g, '')

const codeByKey = new Map<string, string>()
STATES.forEach(([code, name]) => {
    codeByKey.set(compact(code), code)
    codeByKey.set(compact(name), code)
})
codeByKey.set('washingtondc', 'DC')

export const US_STATE_TIMEZONES: Readonly<Record<string, string>> =
    Object.fromEntries(
        STATES.map(([code, , zone]): [string, string] => [code, zone])
    )

// "California", "CA", "ca." -> "CA". Anything that is not a state returns null.
export function usStateCode(value: unknown): string | null {
    if (typeof value !== 'string') return null
    return codeByKey.get(compact(value)) ?? null
}
