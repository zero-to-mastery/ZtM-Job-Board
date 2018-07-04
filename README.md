# ZtM-Job-Board &emsp; [![TravisCI Build Status](https://travis-ci.org/zero-to-mastery/ZtM-Job-Board.svg?branch=master)](https://travis-ci.org/zero-to-mastery/ZtM-Job-Board)
A place for developers to show recruiters that they are available for hire. Feel free to contribute and improve this in any way you see fit.

### How to add your name to the list
To add your name to the list, simply open `persons.js` file in the `src` folder, and then add your own row at the bottom, using the below template: ( **Don't include the square brackets "[ ]" !!! They are just there to indicate an example placeholder. ** )

```moonscript
  {
    id: [PREVIOUS_PLUS_ONE],
    name: "[YOUR_FULL_NAME]",
    img: "[YOUR_IMG_URL]",
    links: {
      website: "[YOUR_WEBSITE_URL]",
      linkedin: "[YOUR_LINKEDIN_URL]",
      github: "[YOUR_GITHUB_URL]"
    },
    jobTitle: "[YOUR_TITLE]",
    location: {
      city: "[YOUR CITY]",
      state: "[YOUR_STATE_OR_PROVINCE]",
      country: "[YOUR_COUNTRY]"
    }
  },
```

### Please note!
- Profile pictures and/or images are allowed.
- If you do not want to fill some of the fields, leave them blank (e.g. `state: "",`).
- Your pull request will only be accepted if it follows the example above. It **cannot** have anything else.

Please submit a Pull Request for your row to be added to this list. If you are unsure how to do this, please check out *Contributing To Open Source* video in the course curriculum.

### Resources
All icons have been sourced from [Material Design Icons](https://materialdesignicons.com) and [Octicons](https://octicons.github.com/)
