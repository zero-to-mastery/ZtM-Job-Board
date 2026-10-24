# Country normalization

Contributors type their country as free text, so the same country shows up as
`USA`, `US`, `U.S.A`, `United States of America`, `USA (Willing to relocate!)`
and so on. Without normalization each spelling became its own filter option and
map entry. Normalization maps these values to one canonical country without
changing what contributors wrote.

## Where it happens

| Step                                   | File                                                                              |
| -------------------------------------- | --------------------------------------------------------------------------------- |
| Resolve text → ISO codes               | [`src/util/countries/resolveCountry.js`](../src/util/countries/resolveCountry.js) |
| Aliases, ambiguous and non-place terms | [`src/util/countries/countryAliases.js`](../src/util/countries/countryAliases.js) |
| ISO code → display name                | [`src/util/countries/countryNames.js`](../src/util/countries/countryNames.js)     |
| Aggregation (adds the metadata)        | [`scripts/lib/aggregate.mjs`](../scripts/lib/aggregate.mjs)                       |
| Recruiter country filter               | [`src/util/countryFilters.ts`](../src/util/countryFilters.ts)                     |
| Map marker counts                      | [`src/util/countryMarkers.ts`](../src/util/countryMarkers.ts)                     |

`npm run aggregate-json` reads `Submissions/*.json` and writes
`src/assets/persons.json`. Submissions are never modified. Each profile keeps its
original fields and gets two generated fields:

```json
{
    "location": {
        "city": "Austin",
        "state": "Texas",
        "country": "USA (Willing to relocate)"
    },
    "id": "3f1c…",
    "normalized": { "countries": ["US"] }
}
```

- `normalized.countries` is a list of [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)
  codes, in order of appearance. It is empty when nothing could be resolved.
- `id` is derived from the submission filename (SHA-256, 32 hex characters), so
  it stays the same across runs.
- Files are processed in filename order, so the output is byte-for-byte
  identical for identical input.
- If any submission cannot be read, is not a JSON object, or has an invalid
  `skills` value, the script lists every
  failing file, exits with status 1 and leaves the existing `persons.json`
  untouched. An unrecognised country is **not** an error.
- The script prints nothing on success, because the Build workflow posts its
  output as a commit comment.

## Canonical identifiers

Profiles store ISO codes only. Display names come from `COUNTRY_NAMES` in
`countryNames.js` (for example `TR` → `Türkiye`, `KR` → `South Korea`), so a
country is labelled the same way everywhere.

## Resolution rules

A value is compared using a normalised key: accents, emoji/flags, punctuation,
case and a leading "The" are removed, `&` becomes `and`, and hyphens and
repeated whitespace become a single space. `" México 🇲🇽"` becomes `mexico`, and
`U.S.A` becomes `usa`.

The key is then checked in this order:

1. **Ambiguous terms** (`AMBIGUOUS_COUNTRY_TERMS`): never resolved. Examples are
   `Georgia` (the country or the US state), `Korea`, `Congo` and `Jerusalem`.
2. **Non-locations** (`NON_LOCATION_TERMS`): `Earth`, `Anywhere`, `Worldwide`.
3. **Countries**: every display name in `COUNTRY_NAMES` plus every entry in
   `COUNTRY_ALIASES` (abbreviations like `USA`/`UK`/`UAE`, native names like
   `Brasil`/`Deutschland`/`Nederland`, former names like `Turkey`/`Macedonia`,
   and typos seen in submissions like `eygpt`/`United State`).
4. **Bare two-letter codes** other than explicit aliases (`US`, `UK`) are
   ambiguous. `IN`, `CH` and `RU` collide with state and province
   abbreviations, and `CH` has been used to mean China.
5. **Preference statements**: text that starts with phrases like
   `willing to relocate`, `remote`, `open to` or `looking forward to move to` is
   ignored. If it comes after a recognised country (`India Remote`,
   `USA willing to relocate`), only the country is kept.

There is **no fuzzy matching**. `Nigerria` stays unresolved until someone adds
it as an alias.

### Compound values

If the whole value does not match, it is split, and each piece goes through the
same rules:

1. Parenthesised or bracketed text is handled separately, in order of appearance:
   `Bolivia (Willing to Relocate or Work Remotely)` → `BO`. A preference note
   ends at its closing bracket, so `USA (remote), Belgium` → `US, BE` and
   `USA (Willing to relocate), Canada` → `US, CA`.
2. Then the value is split on `,` `/` `|` `;` `<->` `->`:
   `USA/Belgium` → `US, BE` and `Poland <-> USA` → `PL, US`.
3. Then it is split on `&`, but only if the whole value did not already
   match, so `Bosnia & Herzegovina` stays one country.

All listed countries count as current locations. A relocation destination is
not included: `Spain | Looking forward to move to New Zealand` → `ES`.
Outside brackets, a preference statement applies to the remainder of the
list, including subsequent separators and bracketed destinations:
`Canada, USA, willing to relocate to Germany, France` → `CA, US` and
`USA/Belgium willing to relocate to Canada, China` → `US, BE`.
Duplicate aliases are collapsed, so `United Kingdom, UK` → `GB`.

### Result status

`resolveCountry()` returns `{ original, countries, status, issues }`.

| Status       | Meaning                                                                    |
| ------------ | -------------------------------------------------------------------------- |
| `resolved`   | At least one country and nothing left over                                 |
| `partial`    | At least one country, plus unresolved fragments (`Nigeria/Istanbul/…`)     |
| `ambiguous`  | No country; at least one fragment is ambiguous (`Georgia`)                 |
| `unresolved` | No country; unknown text, a non-location, or only a relocation/remote note |
| `empty`      | Missing, `null` or blank                                                   |

## How the data is used

- **Country filter**: one option per ISO code found in `normalized.countries`,
  labelled with `COUNTRY_NAMES` and sorted by label. Selecting a country
  matches every profile that lists it, including multi-country profiles.
  Profiles that did not resolve add no option. Cards and free-text search still
  use the original `location` text.
- **Map**: developers are counted per ISO code and placed using the `ISO`
  column of `src/assets/countries.json`. A developer listing several countries
  is counted once in each of them. Codes without coordinates in
  `countries.json` (currently `AX`, `EH`, `HK`, `MO`) get no marker.

## Adding or changing an alias

1. Run the diagnostics (below) to see what is unresolved.
2. Add the spelling to `COUNTRY_ALIASES` in `countryAliases.js` as people write
   it (`'Holland': 'NL'`). Normalization is applied automatically, and a
   duplicate key pointing to a different code throws when the module loads.
3. Use `AMBIGUOUS_COUNTRY_TERMS` instead when the value could reasonably mean
   more than one place. When in doubt, leave it unresolved: a missing filter
   entry is better than placing someone in the wrong country.
4. Add a test case to `src/util/countries/resolveCountry.test.js`.

## Tests

```bash
npm run aggregate-json
npx vitest run                                    # everything
npx vitest run src/util/countries scripts/lib     # resolver + aggregation only
```

`npm test` runs the same suite, but in watch mode outside CI.

## Diagnostics

```bash
npm run --silent country-diagnostics > country-diagnostics.json
# or
npm run country-diagnostics -- --out country-diagnostics.json
```

The report includes summary counts and one entry per distinct value that is
`partial`, `ambiguous` or `unresolved`. Each entry lists the reasons and the
submission filenames that use the value. Entries are sorted, so the output is
deterministic. No names, emails or links are included.

```json
{
    "original": "Georgia",
    "status": "ambiguous",
    "countries": [],
    "issues": [
        {
            "fragment": "Georgia",
            "type": "ambiguous",
            "reason": "Could be the country Georgia or the US state of Georgia"
        }
    ],
    "submissions": ["GigaBerdzenishvili.json", "Spie1er.json", "mamatsa.json"]
}
```
