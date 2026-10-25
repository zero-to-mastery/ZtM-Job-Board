# ZtM-Job-Board &emsp; [![Build Project](https://github.com/zero-to-mastery/ZtM-Job-Board/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/zero-to-mastery/ZtM-Job-Board/actions/workflows/build.yml)

A place for developers from the [**Zero To Mastery Community**](https://zerotomastery.io/?utm_source=github&utm_medium=ZtM-Job-Board) to show recruiters that they are available for hire. Feel free to contribute and improve this in any way you see fit.

Link to the webpage: [**ZtM JOB Board**](https://zero-to-mastery.github.io/ZtM-Job-Board/).

### How to run the project in your local machine

- `git clone https://github.com/zero-to-mastery/ZtM-Job-Board.git`

- `cd ZtM-Job-Board`

- `npm ci`

- `npm start`

`npm start` validates submissions while generating the profile dataset. Invalid JSON or an invalid `skills` value causes aggregation to exit with an error instead of writing a partial dataset. Fix the reported submission and rerun `npm start`; the existing generated dataset is left untouched when validation fails.

### How to add your name to the list

Note: **You will first need to make a fork of the project!**

![fork image](https://docs.github.com/assets/cb-79331/mw-1440/images/help/repository/fork-button.webp)

If you are unclear on how the GitHub workflow works, you can check the [Make a Pull Request guide](https://makeapullrequest.com/).

---

To add your name to the list, create a file `<YOUR_GH_USERNAME>.json`
inside `Submissions/` folder, and then fill it up with following content.  
⚠️ Please remove the `@` from your GitHub username.  
(**Don't include the square brackets "[ ]" or angle brackets "< >" !!! They are just there to indicate an example placeholder.**)

```json
{
    "name": "[YOUR_FULL_NAME]",
    "img": "[YOUR_IMG_URL]",
    "email": "[YOUR_EMAIL_ADDRESS]",
    "links": {
        "website": "[YOUR_WEBSITE_URL]",
        "linkedin": "https://www.linkedin.com/in/<YOUR_LINKEDIN_USERNAME>",
        "github": "https://github.com/<YOUR_GH_USERNAME>"
    },
    "jobTitle": "[YOUR_TITLE]",
    "skills": ["[SKILL_1]", "[SKILL_2]", "[SKILL_3]"],
    "location": {
        "city": "[YOUR_CITY]",
        "state": "[YOUR_STATE_OR_PROVINCE]",
        "country": "[YOUR_COUNTRY]"
    }
}
```

**Optional map coordinates**

- `coordinates` is optional. If omitted, your profile will continue to use the existing country-level map marker.
- Add `coordinates` only if you want an individual map pin for your profile. If you do not want an exact pin, leave out the entire `coordinates` object.
- If included, `coordinates` must contain exactly two numeric properties: `lat` and `lng`. For example:

    ```json
    "coordinates": {
      "lat": 40.71,
      "lng": -74.00
    }
    ```

- `lat` must be between `-90` and `90`, and `lng` must be between `-180` and `180`.
- Both values must have at most two decimal places for privacy.
- Use approximate city or town coordinates. Do not share your home address or precise residential location.
- Invalid coordinates will cause aggregation to fail and report the affected submission filename.

### Please note!

- Profile pictures and/or images\* are allowed.
- If you do not want to fill some of the fields, leave them blank (e.g. `state: "",`).
- Use your country's name (e.g. `"United States"`, `"Germany"`) for `country`. It is matched to a standard country for the filters and map; see [country normalization](docs/country-normalization.md) for maintainers' notes.
- `skills` is optional. Omit it or use `[]` if you do not want to declare skills. When provided, it must be an array of nonblank strings.
- Only list skills you personally claim; skills are self-reported, not verified. Whitespace is trimmed and duplicate labels are combined case-insensitively. Use familiar technology names such as `React`, `TypeScript`, or `Node.js`; aliases such as `React.js` and `React` are not automatically combined.
- Your pull request will only be accepted if it follows the example above. It **cannot** have anything else.

Please submit a Pull Request to be added to this list. If you are unsure how to do this, please check out _Contributing To Open Source_ video in the course curriculum.

### Finding developers by skills

Use **Required skills** to search the declared skills and select the technologies you need. Results must match **all** selected skills, together with any text, country, or role filters. Remove an individual skill using its chip, or use **Clear filters** to reset the search and filters.

Cards show self-reported skills and mark the ones matching your requirements. Profiles without declared skills still appear when no skill filter is selected. Existing contributors can add a `skills` array to their own submission in a pull request; no skills are inferred from job titles or external profiles.

- How to add profile image to your ZTM JobBoard profile using Github avatars.

1. Go to your profile on GitHub.com
2. Append to your GitHub profile url “.png”, so it will look like this:

https://github.com/example.png

3. Hit enter and the browser will generate a page with your image, it look like this:
   https://avatars.githubusercontent.com/u/57936?v=4

4. Copy url of this page and paste it in `Submissions/<YOUR_GH_USERNAME>.json` file

### Resources

All icons have been sourced from [Material Design Icons](https://materialdesignicons.com) and [Octicons](https://octicons.github.com/)
