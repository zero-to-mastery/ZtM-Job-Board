# Role normalization

Contributors type their job title as free text. The same role shows up as
`Front-End Developer`, `Front End Developer`, `FrontEnd Developer`,
`Fronted Web Developer` and so on, and the Role filter used to list every
spelling as its own option (839 options for 2,362 profiles). Normalization
maps each title to a small set of canonical role categories without changing
what contributors wrote.

It works like [country normalization](country-normalization.md) and runs in the
same aggregation step.

## Where it happens

| Step                                         | File                                                                  |
| -------------------------------------------- | --------------------------------------------------------------------- |
| Categories, labels and seniority levels      | [`src/util/roles/roleTaxonomy.js`](../src/util/roles/roleTaxonomy.js) |
| Typos, rules, technology aliases             | [`src/util/roles/roleAliases.js`](../src/util/roles/roleAliases.js)   |
| Resolve title → roles, seniority, technology | [`src/util/roles/resolveRole.js`](../src/util/roles/resolveRole.js)   |
| Aggregation (adds the metadata)              | [`scripts/lib/aggregate.mjs`](../scripts/lib/aggregate.mjs)           |
| Role filter options and matching             | [`src/util/roleFilters.ts`](../src/util/roleFilters.ts)               |
| Search, country, role and sort pipeline      | [`src/util/profileFilters.ts`](../src/util/profileFilters.ts)         |

`npm run aggregate-json` adds three fields next to `countries`:

```json
{
    "jobTitle": "Senior Front-End React Developer",
    "normalized": {
        "countries": ["US"],
        "roles": ["frontend-developer"],
        "seniority": "senior",
        "technologies": ["react"]
    }
}
```

- `roles`: role ids in taxonomy order (the order of `ROLE_TAXONOMY`), without
  duplicates. Empty when the title is unclassified.
- `seniority`: `intern`, `junior`, `mid`, `senior`, `staff`, `principal`,
  `lead` or `null`.
- `technologies`: technology ids in order of appearance.

The original `jobTitle` is unchanged and is what profile cards show. Unknown
or missing titles are never an aggregation error, and a profile with several
roles is still one profile.

## Categories

| Id                     | Label                          | Typical titles                                     |
| ---------------------- | ------------------------------ | -------------------------------------------------- |
| `frontend-developer`   | Frontend Developer             | Front-End Developer, React Developer, UI Developer |
| `backend-developer`    | Backend Developer              | Back-end Engineer, Node.js Developer               |
| `full-stack-developer` | Full Stack Developer           | Full Stack Web Developer, MERN Stack Developer     |
| `web-developer`        | Web Developer                  | Web Developer, WordPress Developer                 |
| `software-engineer`    | Software Engineer / Developer  | Software Engineer, Software Developer, SDE         |
| `mobile-developer`     | Mobile Developer               | Android/iOS/Flutter/React Native Developer         |
| `game-developer`       | Game Developer                 | Game Developer, Unity Developer                    |
| `blockchain-developer` | Blockchain / Web3 Developer    | Blockchain Engineer, Web3 Developer                |
| `devops-engineer`      | DevOps Engineer                | DevOps Engineer, DevOps Practitioner               |
| `cloud-engineer`       | Cloud Engineer                 | Cloud Engineer, Cloud Application Engineer         |
| `data-analyst`         | Data Analyst                   | Data Analyst, Technical Data Analyst               |
| `data-engineer`        | Data Engineer                  | Data Engineer, Big Data Engineer                   |
| `data-scientist`       | Data Scientist                 | Data Scientist, Chief Data Scientist               |
| `ml-engineer`          | AI / Machine Learning Engineer | ML Engineer, AI Engineer, Deep Learning Engineer   |
| `qa-engineer`          | QA / Test Engineer             | QA Engineer, SDET, Software Developer in Test      |
| `security-engineer`    | Cybersecurity                  | Cybersecurity Practitioner, Ethical Hacker         |
| `ui-ux-designer`       | UI / UX Designer               | UI/UX Designer, Product Designer, Web Designer     |
| `solutions-architect`  | Solutions Architect            | Solution Architect, Cloud Solutions Architect      |
| `engineering-manager`  | Engineering Manager            | Software Engineering Manager                       |
| `product-manager`      | Product Manager                | Product Manager                                    |
| `technical-writer`     | Technical Writer               | Technical Writer                                   |

`Web Developer` and `Software Engineer / Developer` exist because they are
the second and third most common titles. Folding them into a specialization
would be a guess: a Web Developer is not necessarily frontend or full stack.

Roles are not interchangeable. A Software Engineer is not a Frontend
Developer, a Frontend Developer is not Full Stack, React Native is Mobile (not
Frontend), a Data Scientist is not a Data Engineer, and a UI Designer is not a
Frontend Developer. A title only gets the categories it names.

## How a title is resolved

1.  **Normalise.** Accents, emoji and stray HTML entities are removed, `C#`,
    `C++` and `.NET` become `csharp`, `cpp` and `dotnet`, text is lowercased,
    punctuation and hyphens become spaces, and known typos are fixed
    (`TOKEN_TYPOS`: `Fronted`, `Sofeware`, `Developper`, `Enginner`, …).
    Multi-word terms are joined (`PHRASE_REWRITES`), so `Front End`,
    `Front-End` and `FrontEnd` all become `frontend`.
2.  **Ignore parentheses.** `Full Stack Developer (React, Node)` is classified
    as `Full Stack Developer`. Only if that yields nothing are the parentheses
    unwrapped: `(Full Stack/Game) Developer`.
3.  **Split into parts** on `|` `,` `;` `•` `/` `&` `+` `and` and `. `.
    `/`, `&`, `+` and `and` join closely related parts, so a part without a
    job-title noun borrows one: `Mobile/Web Developer` becomes
    `Mobile Developer` + `Web Developer`, and `Web Designer and Developer`
    becomes `Web Designer` + `Web Developer`. A spaced hyphen does not split,
    so `Software Engineer - Frontend` is one part. `at Company` and
    `@ Place` are dropped.
4.  **Drop aspirations.** A part containing `aspiring`, `enthusiast`,
    `interest`, `candidate`, … yields no role (`AI Enthusiast`,
    `Aspiring Data Scientist`). Other parts of the title still count.
5.  **Match rules** from `roleAliases.js`, strongest tier first (see the table
    below).
6.  **Order** the role ids by the taxonomy and remove duplicates.

| Tier      | Example                                 | Applies when                                 |
| --------- | --------------------------------------- | -------------------------------------------- |
| specific  | `Front-End`, `DevOps`, `Data Scientist` | always; every match counts                   |
| framework | `React Developer` → frontend            | no part of the title matched a specific rule |
| generic   | `Web Developer`, `Software Engineer`    | nothing more specific matched this part      |
| language  | `Python Developer` → software engineer  | the whole title has no other role            |

So `Full Stack Web Developer` is only full stack, `Back-end Software Engineer`
is only backend, `Full Stack Developer | Python Developer` is only full stack,
and `Data Scientist / Python Developer` is only data scientist. Area words
such as `Front End`, `Full Stack`, `MERN Stack` or `DevOps` count on their own;
others need a developer or engineer noun (`Mobile` alone does not).

There is no fuzzy matching. A misspelling is only recognised once it has been
added to `TOKEN_TYPOS`.

### Seniority

Seniority comes only from explicit words anywhere in the title
(`SENIORITY_TERMS`): `Intern`/`Internship`, `Junior`/`Jr`/`Jnr`,
`Mid`/`Intermediate`, `Senior`/`Sr`, `Staff`, `Principal`,
`Lead`/`Leader`. It is never inferred from student status or years, and
numbered levels like `Software Engineer 2` or `SDE III` are ignored because
they mean different things at different companies. Staff, principal and lead
are kept apart from senior. If a title names two different levels
(`Tech Lead and Senior Software Engineer`), seniority is `null` and the
diagnostics report it as `conflicting`.

There is no seniority filter yet; the field is metadata for later use.

### Technologies

Technologies named anywhere in the title, including parentheses, are listed
using `TECHNOLOGY_ALIASES` (`React.js` → `react`, `Node` → `nodejs`,
`C#` → `csharp`). `React Native` is `react-native`, not `react`. Stack
abbreviations expand: `MERN` → `mongodb, express, react, nodejs`, likewise
`MEAN` and `MEVN`. Technologies never add or remove roles; they are only
read from the title, not inferred. There is no technology filter yet.

### Unclassified titles

A title with no recognised role keeps `roles: []`. The profile is still listed
and searchable; it just does not appear when a role filter is selected. The
diagnostics give the reason:

| Reason                                                  | Examples                                        |
| ------------------------------------------------------- | ----------------------------------------------- |
| Generic title without a specialization                  | `Developer`, `Engineer`, `Freelance Developer`  |
| Student or academic status, not a professional role     | `Student`, `CS Undergraduate`                   |
| Describes an interest or aspiration, not a current role | `Aspiring Developer`, `AI Enthusiast`           |
| No recognized professional role                         | `Director`, `Problem Solver`, `AR/VR Developer` |

A student is never made junior, `Freelancer` is not a role, and `Director`
does not imply engineering management.

## How the data is used

- **Role filter**: one option per role id found in the data, labelled from
  `ROLE_TAXONOMY` and sorted by label. Selecting several roles matches profiles
  with _any_ of them (OR). Combined with the country filter, a profile must
  match both (AND).
- **Free-text search** matches the original name, title and location as
  before, and also the canonical role labels, so `frontend` finds a
  `React Developer`.

## Changing the taxonomy

1. Run the diagnostics (below) and look at `unclassified` and `partial`
   entries.
2. For a new spelling of an existing role, prefer a `TOKEN_TYPOS` or
   `PHRASE_REWRITES` entry over a new rule.
3. For a new category, add it to `ROLE_TAXONOMY` and add a rule. Only do this
   when several real titles need it and recruiters would search for it; when in
   doubt leave titles unclassified. A wrong category is worse than none.
4. Add the real title to `src/util/roles/resolveRole.test.js`.
5. Changing the order of `ROLE_TAXONOMY` changes the order of `roles` in the
   generated JSON.

Rule ids are checked when the module loads: a rule pointing at an unknown role
id throws.

## Tests

```bash
npm run aggregate-json
npx vitest run                                              # everything
npx vitest run src/util/roles src/util/roleFilters.test.tsx # resolver + filters
npx vitest run scripts/lib                                  # aggregation + diagnostics
```

The resolver tests include real titles from `Submissions/` and check that
every spelling of front-end, back-end and full stack in the current data is
classified.

## Diagnostics

```bash
npm run --silent role-diagnostics > role-diagnostics.json
# or
npm run role-diagnostics -- --out role-diagnostics.json
```

The summary has the number of distinct raw titles and canonical roles,
classified, unclassified and multi-role profile counts, and counts per role
and per seniority level. `entries` lists every distinct title that is
`unclassified`, `partial` (classified, with parts that matched nothing),
`empty`, or has conflicting seniority, with the submission filenames that use
it. The output is sorted and contains no names, emails or links.

```json
{
    "original": "Frontend Developer/Project Manager",
    "status": "partial",
    "roles": ["frontend-developer"],
    "seniority": null,
    "seniorityStatus": "unspecified",
    "reason": null,
    "unmatched": ["Project Manager"],
    "submissions": ["example.json"]
}
```

Do not commit the report; regenerate it when needed.
