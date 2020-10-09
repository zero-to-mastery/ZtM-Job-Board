import { v4 as uuidv4 } from "uuid"

export const data = {
  people: [
    {
      id: uuidv4(),
      name: "Saurabh Kamble",
      img: "https://avatars0.githubusercontent.com/u/2873636?v=4",
      links: {
        website: "https://stackoverflow.com/users/2488916/saurabh-kamble",
        linkedin: "https://www.linkedin.com/in/saurabh-kamble/",
        github: "https://github.com/saurabh2836",
      },
      jobTitle: "Full Stack Developer",
      location: {
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
      },
    },
  ],
}
