# Country normalization

Contributors type their country as free text, so the same country shows up as
`USA`, `US`, `U.S.A`, `United States of America`, `USA (Willing to relocate!)`
and so on. Without normalization each spelling became its own filter option and
map entry. Normalization maps these values to one canonical country without
changing what contributors wrote.

## Where it happens

| Step                                   | File                                                                                      |
| -------------------------------------- | ----------------------------------------------------------------------------------------- |
| Resolve text → ISO codes               | [`src/util/countries/resolveCountry.js`](../src/util/countries/resolveCountry.js)         |
| Aliases, ambiguous and non-place terms | [`src/util/countries/countryAliases.js`](../src/util/countries/countryAliases.js)         |
| ISO code → display name                | [`src/util/countries/countryNames.js`](../src/util/countries/countryNames.js)             |
| ISO code → map coordinates (generated) | [`src/util/countries/countryCoordinates.js`](../src/util/countries/countryCoordinates.js) |
| Aggregation (adds the metadata)        | [`scripts/lib/aggregate.mjs`](../scripts/lib/aggregate.mjs)                               |
| Recruiter country filter               | [`src/util/personCountries.ts`](../src/util/personCountries.ts)                           |
| Map marker counts                      | [`src/util/personCountries.ts`](../src/util/personCountries.ts)                           |

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
- Apart from the warning below, the script prints nothing on success, because
  the Build workflow posts its output as a commit comment.

The one exception is the warning for unrecognised country values, printed to
stdout only when at least one value resolves with an `unknown` issue — the
actionable case, fixed by adding an alias:

```
Unrecognised country value(s) (add an alias, see docs/country-normalization.md):
- "Azad Kashmir Pakistan" (Saad-Abbasi.json)
```

Values are distinct and sorted, one line per value listing the submission
files that use it, capped at 10 value lines plus a final `…and N more` line.
A run with nothing to report still prints nothing, and the exit code stays 0
either way. Ambiguous, non-location and statement-only issues are deliberate
policy; they never appear in the warning, only in the diagnostics report
below.

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

The whole value is looked up first, so an exact name or alias always wins
before statement stripping or splitting: `Korea (Republic of)` stays one
country instead of being cut at the brackets. Outside brackets a preference
statement ends the scope — everything after it is dropped; inside brackets it
ends only that bracket's content, so `USA (remote), Belgium (remote), Canada`
still yields `US, BE, CA`.

There is **no fuzzy matching**. `Nigerria` stays unresolved until someone adds
it as an alias.

### Compound values

If the whole value does not match, it is split, and each piece goes through the
same rules. Splitting runs only where the piece has not already been
classified — an exact name or a preference statement stays whole:

1. Parenthesised or bracketed text is handled separately first, before any
   list or `&` split, so `USA (remote), Canada` → `US, CA` rather than
   `US`, `remote`, `CA`. Each closed, non-nested pair is extracted in order of
   appearance: `Bolivia (Willing to Relocate or Work Remotely)` → `BO`, and
   repeated pairs work too: `USA (remote), Belgium (remote), Canada` →
   `US, BE, CA`.
2. Then each piece is split on `,` `/` `|` `;` `<->` `->`:
   `USA/Belgium` → `US, BE` and `Poland <-> USA` → `PL, US`.
3. Then on `&`, but only when the piece is not itself an exact name, so
   `Bosnia & Herzegovina` stays one country.

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

- **Country filter**: `getCountryOptions` builds one option per ISO code
  found in `normalized.countries`, labelled with `COUNTRY_NAMES` and sorted
  by label. Profiles whose country did not resolve add no option. Filtering
  goes through the `matchesCountries(person, codes)` predicate: an empty
  selection matches everyone, otherwise a profile matches when any of its
  countries is in the selection (multi-country profiles match any of theirs).
  Cards and free-text search still use the original `location` text.
- **Map**: `getCountryMarkers` counts developers per ISO code — a developer
  listing several countries is counted once in each, never twice in the same
  country — and joins the counts with `getCountryCoordinates`, producing one
  marker per code with `latlng` as a `[latitude, longitude]` number tuple at
  full precision. Codes without coordinates (currently `AX`, `EH`, `HK`,
  `MO`) get no marker.

## Map coordinates

`countryCoordinates.js` maps an ISO code to one `[latitude, longitude]` tuple
(full precision). It is **generated — never hand-edited**; the file starts with
a `// @generated — do not edit` header and is listed in `.prettierignore`, so
the `lint-staged` prettier hook leaves it alone.

```bash
npm run countries-json   # regenerate (network; run manually)
```

The generator ([`scripts/countries-json.mjs`](../scripts/countries-json.mjs))
reads the pinned CSV from
[`world-countries-centroids@v0.2.0`](https://cdn.jsdelivr.net/gh/gavinr/world-countries-centroids@v0.2.0/dist/countries.csv)
and applies, in order:

1. **Name-sort** rows by country name. This order decides duplicates.
2. **Dedupe by ISO** — first name-sorted row wins (`BQ` → Bonaire, `TF` →
   French Southern Territories), with one override: `ES` → Spain, not
   Canarias.
3. **ISO-keyed coordinate fixes** for centroids that land in the ocean
   (Chile, Denmark, Greece, …), stored next to the fixes in the generator —
   keyed by code, not by name. Denmark's old `'56.26392-35.6'` typo is fixed.
4. **Supplements** for codes missing from the CSV entirely (`TW` — removed
   upstream), so the marker set stays identical to the previously committed
   data.

Unused CSV columns (`COUNTRY`, `COUNTRYAFF`, `AFF_ISO`) are dropped. Output is
deterministic: same CSV → byte-identical file (verified by running twice and
diffing). `getCountryCoordinates(code)` returns the tuple or `undefined`.

Coverage is enforced by `countryCoordinates.test.js`: every code in
`COUNTRY_NAMES` must have coordinates except the documented allowlist
`AX`, `EH`, `HK`, `MO` (no data upstream). The test fails if any code loses
coordinates — and fails if an allowlisted code gains them, so the list cannot
rot.

## Adding or changing a country

Up to four files, depending on what is wrong:

1. **Label** wrong or missing → `countryNames.js` (`COUNTRY_NAMES`, ISO code →
   display name). This is hand-curated UI policy; the coverage test requires
   coordinates for any code added here.
2. **Marker in the wrong place** → the `countryFixes` table in
   `scripts/countries-json.mjs`, keyed by ISO (`DK: [lat, lng]`). Regenerate
   with `npm run countries-json` and commit the generated file.
3. **Country text in submissions doesn't resolve** → `countryAliases.js`
   (see "Adding or changing an alias" above).
4. **No coordinate data exists upstream** → add an entry to
   `coordinateSupplements` in the generator _and_ to the allowlist in
   `countryCoordinates.test.js`. Ask the owner first (spec: filling
   `AX`/`EH`/`HK`/`MO` coordinates needs approval).

## Adding or changing an alias

1. Run the aggregation and read its warning (above), or run the diagnostics
   (below), to see what is unresolved.
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

The resolver tests in `src/util/countries/resolveCountry.test.js` are the
behavioural contract for the rules above; `scripts/lib/countryWarning.test.mjs`
covers the aggregation warning.

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
