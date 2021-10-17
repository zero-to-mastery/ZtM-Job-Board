# ZtM-Job-Board &emsp; [![Build Project](https://github.com/zero-to-mastery/ZtM-Job-Board/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/zero-to-mastery/ZtM-Job-Board/actions/workflows/build.yml)

A place for developers from the [**Zero To Mastery Community**](https://zerotomastery.io/?utm_source=github&utm_medium=ZtM-Job-Board) to show recruiters that they are available for hire. Feel free to contribute and improve this in any way you see fit.

Link to the webpage: [**ZtM JOB Board**](https://zero-to-mastery.github.io/ZtM-Job-Board/).

### How to run the project in your local machine

- `git clone https://github.com/zero-to-mastery/ZtM-Job-Board.git`

- `yarn install` or `npm install`

- `yarn start` or `npm start`

### How to add your name to the list

Note: **You will first need to make a fork of the project!**

![fork image](https://help.github.com/assets/images/help/repository/fork_button.jpg)

If you are unclear on how the GitHub workflow works, you can check the [Make a Pull Request guide](https://makeapullrequest.com/).

---

To add your name to the list, create a file `<YOUR_GH_USERNAME>.json`
inside `Submissions/` folder, and then fill it up with following content.
( **Don't include the square brackets "[ ]" or angle brackets "< >" !!! They
are just there to indicate an example placeholder.** )

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


### Please note!

- Profile pictures and/or images\* are allowed.
- If you do not want to fill some of the fields, leave them blank (e.g. `state: "",`).
- Your pull request will only be accepted if it follows the example above. It **cannot** have anything else.

Please submit a Pull Request to be added to this list. If you are unsure how to do this, please check out _Contributing To Open Source_ video in the course curriculum.

- How to add profile image to your ZTM JobBoard profile using Github avatars.

1. Go to your profile on GitHub.com
2. Append to your GitHub profile url “.png”, so it will look like this:

https://github.com/aneta-s.png

3. Hit enter and the browser will generate a page with your image, it look like this:
   https://avatars2.githubusercontent.com/u/54153719?v=4

4. Copy url of this page and paste it in `Submissions/<YOUR_GH_USERNAME>.json` file

### Resources

All icons have been sourced from [Material Design Icons](https://materialdesignicons.com) and [Octicons](https://octicons.github.com/)
