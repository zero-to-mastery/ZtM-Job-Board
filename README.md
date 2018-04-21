# ZtM-Job-Board

A place for developers to show recruiters they are available for hire. Feel free to contribute and improve this in any way you see fit.

### How to add your name to the list
To add your name to the list, simply open src folder then `robots.js` file and add your own row at the bottom like the below example:
```html
{
  id: [PREVIOUS_PLUS_ONE],
  name: "[YOUR FULL NAME]",
  img: "[YOUR_IMG_URL]",
  links: {
    website: "[YOUR_WEBSITE_URL]",
    linkedin: "[YOUR_LINKEDIN_URL]",
    github: "[YOUR_GITHUB_URL]"
  },
  jobTitle: "Web Developer",
  location: {
    city: "[YOUR CITY]",
    state: "[YOUR_STATE_OR_PROVINCE]",
    country: "[YOUR_COUNTRY]"
  }
}


```

#### Deprecated keys
Starting in version 0.2.0, the Job Board is using a better structure for handling the keys and minimizing HTML included in the developers list. For backward compatibility, previous id, website and location have been renamed respectively to deprecated_id, deprecated_website and deprecated_location as shown below: 
```html
// DEPRECATED
  deprecated_id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`YOUR IMG LINK HERE ` }/>,
  deprecated_website: <div> <a href="YOUR LINKEDIN OR PORTFOLIO" target="_blank" rel="noopener noreferrer">Portfolio Site</a>
  <br></br>
<a href="YOUR LINKEDIN OR PORTFOLIO" target="_blank" rel="noopener noreferrer">Linkedin</a>
</div>,
deprecated_location: "I ALSO SUGGEST PUTTING THE COUNTRY YOU'RE FROM",
},
```

### Please note! 
- Profile pictures and/or images are NOW allowed.
- If you do not have an image replace id line with id:"" .
- Your pull request will only be accepted if it follows the example above. It <strong>cannot</strong> have anything else.
Please submit a Pull Request for your row to be added to this list. If you are unsure how to do this, please check out *Contributing To Open Source* video in the course curriculum. 

### Resources
#### Icons
All social media icons have been sourced from [iconfinder.com](https://www.iconfinder.com/iconsets/socialcones) 
