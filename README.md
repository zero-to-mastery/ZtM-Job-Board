# ZtM-Job-Board &emsp; [![Build Project](https://github.com/zero-to-mastery/ZtM-Job-Board/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/zero-to-mastery/ZtM-Job-Board/actions/workflows/build.yml)

A place for developers from the [**Zero To Mastery Community**](https://zerotomastery.io/?utm_source=github&utm_medium=ZtM-Job-Board) to show recruiters that they are available for hire. Feel free to contribute and improve this in any way you see fit.

Link to the webpage: [**ZtM JOB Board**](https://zero-to-mastery.github.io/ZtM-Job-Board/).

### Finding developers

The working-hours filter compares local 9–5 workdays. Search for a city or
region (for example, `New York`), or type `UTC`/`GMT` to browse fixed offsets.
`UTC-5` and `GMT-5` mean the same fixed offset; unlike a named city zone,
they do not change with daylight saving time. Fractional offsets such as
`GMT+5:30` are supported. Click a suggestion or press Enter to select the first
match; use the arrow keys to choose another. The clear button resets the
selection to your browser's current time zone.

### How to run the project in your local machine

- `git clone https://github.com/zero-to-mastery/ZtM-Job-Board.git`

- `cd ZtM-Job-Board`

- `npm ci`

- `npm start`

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
  "location": {
    "city": "[YOUR_CITY]",
    "state": "[YOUR_STATE_OR_PROVINCE]",
    "country": "[YOUR_COUNTRY]"
  }
}
```

Example with dummy values:
```json
{
  "name": "John Example",
  "img": "https://avatars.githubusercontent.com/u/57936?v=4",
  "email": "example@example.com",
  "links": {
    "website": "example.com",
    "linkedin": "https://www.linkedin.com/in/example",
    "github": "https://github.com/example"
  },
  "jobTitle": "Software Developer",
  "location": {
    "city": "Example City",
    "state": "Example State",
    "country": "Example Country"
  }
}
```

### Please note!

- Profile pictures and/or images\* are allowed.
- If you do not want to fill some of the fields, leave them blank (e.g. `state: "",`).
- Use your country's name (e.g. `"United States"`, `"Germany"`) for `country`. It is matched to a standard country for the filters and map; see [country normalization](docs/country-normalization.md) for maintainers' notes.
- Your pull request will only be accepted if it follows the example above. It **cannot** have anything else, apart from the optional `coordinates` described below.

#### Optional: your exact map location

The map places you by your city. Small towns may not be recognized, and you are then shown at the center of your state or country. To be placed exactly, add `coordinates` to `location`:

```json
  "location": {
    "city": "Gormania",
    "state": "West Virginia",
    "country": "United States",
    "coordinates": { "lat": 39.29, "lng": -79.34 }
  }
```

1. Find your town on [Google Maps](https://maps.google.com) or [OpenStreetMap](https://www.openstreetmap.org), right-click it, and copy the coordinates (Google Maps shows them first in the menu).
2. The first number is `lat` (latitude), the second is `lng` (longitude). Places south of the equator have a negative `lat`, and places west of Greenwich (all of the Americas) have a negative `lng`.
3. Round both to **2 decimal places** (about 1 km). More precise values are rejected so that a home address is never published.

Leave `coordinates` out if your city is placed correctly.

Please submit a Pull Request to be added to this list. If you are unsure how to do this, please check out _Contributing To Open Source_ video in the course curriculum.

- How to add profile image to your ZTM JobBoard profile using Github avatars.

1. Go to your profile on GitHub.com
2. Append to your GitHub profile url “.png”, so it will look like this:

https://github.com/example.png

3. Hit enter and the browser will generate a page with your image, it look like this:
  https://avatars.githubusercontent.com/u/57936?v=4


4. Copy url of this page and paste it in `Submissions/<YOUR_GH_USERNAME>.json` file

### Resources

All icons have been sourced from [Material Design Icons](https://materialdesignicons.com) and [Octicons](https://octicons.github.com/)
