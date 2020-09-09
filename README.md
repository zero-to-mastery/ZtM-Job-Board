# ZtM-Job-Board &emsp; [![TravisCI Build Status](https://travis-ci.org/zero-to-mastery/ZtM-Job-Board.svg?branch=master)](https://travis-ci.org/zero-to-mastery/ZtM-Job-Board)

A place for developers from the [**Zero To Mastery Community**](https://zerotomastery.io/?utm_source=github&utm_medium=ZtM-Job-Board) to show recruiters that they are available for hire. Feel free to contribute and improve this in any way you see fit.

Link to the webpage: [**ZtM JOB Board**](https://alumni-board.netlify.app/).

### How to run the project in your local machine

- `git clone https://github.com/zero-to-mastery/ZtM-Job-Board.git`

- `yarn install` or `npm install`

- `yarn start` or `npm start`

### How to add your name to the list

To add your name to the list, simply open `persons.js` file in the `src/assets` folder, and then add your own row at the bottom, using the below template:
( **Don't include the square brackets "[ ]" !!! They are just there to indicate an example placeholder.** )

```moonscript
  ,{
    id: uuidv4(),
    name: "[YOUR_FULL_NAME]",
    img: "[YOUR_IMG_URL]",
    links: {
      website: "[YOUR_WEBSITE_URL]",
      linkedin: "[YOUR_LINKEDIN_URL]",
      github: "[YOUR_GITHUB_URL]"
    },
    jobTitle: "[YOUR_TITLE]",
    location: {
      city: "[YOUR_CITY]",
      state: "[YOUR_STATE_OR_PROVINCE]",
      country: "[YOUR_COUNTRY]"
    }
  }
```

### Please note!

- Profile pictures and/or images\* are allowed.
- If you do not want to fill some of the fields, leave them blank (e.g. `state: "",`).
- Your pull request will only be accepted if it follows the example above. It **cannot** have anything else.

Please submit a Pull Request for your row to be added to this list. If you are unsure how to do this, please check out _Contributing To Open Source_ video in the course curriculum.

- How to add profile image to your ZTM JobBoard profile using Github avatars.

1. Go to your profile on GitHub.com
2. Append to your GitHub profile url “.png”, so it will look like this:

https://github.com/aneta-s.png

3. Hit enter and the browser will generate a page with your image, it look like this:
   https://avatars2.githubusercontent.com/u/54153719?v=4

4. Copy url of this page and paste it in persons.js file

### Resources

All icons have been sourced from [Material Design Icons](https://materialdesignicons.com) and [Octicons](https://octicons.github.com/)
