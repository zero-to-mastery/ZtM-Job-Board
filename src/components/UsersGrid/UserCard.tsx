import React from "react"
import { Card, Button, Avatar, useTheme } from "../super-components/core"
import DefaultAvatar from "../../assets/DefaultAvatar.png"
import { Theme } from "../super-components/core/interfaces/theme"
import { Icons } from "../super-components/core/Icons"

const IconsDictionary: any = {
  github: Icons.GithubIcon,
  linkedin: Icons.LinkedinIcon,
  website: Icons.WebsiteIcon,
}

const useStyles = (theme: Theme) => {
  return {
    container: {
      padding: "1rem",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
      textAlign: "center",
    },
    userName: {
      margin: 0,
      color: theme.palette.text.main,
    },
    jobName: {
      margin: "5px 0",
      color: theme.palette.text.disabled,
    },
  }
}

const UserCard = (props: any) => {
  const { name, jobTitle, img, links, location } = props

  const { theme } = useTheme()
  const styles = useStyles(theme)

  return (
    <Card key={1} style={styles.container}>
      <Avatar src={img || DefaultAvatar} />
      <br />
      <h2 style={styles.userName}>{name}</h2>
      <p style={styles.jobName}>{jobTitle}</p>

      <small style={{ color: theme.palette.primary.main }}>
        {Object.keys(location).map((n, i) => {
          const aux = location[n],
            l = Object.keys(location).length
          return aux ? `${aux} ${i < l - 1 ? "•" : ""} ` : null
        })}
      </small>

      <br />
      <div style={{ display: "flex" }}>
        {Object.keys(links).map((name, i) => {
          const link = links[name]
          const Icon = IconsDictionary[name]
          return (
            <a
              target="_blank"
              key={i}
              href={link}
              style={{ padding: "0.5rem", color: theme.palette.text.disabled }}
            >
              <Icon style={{ width: "1.4rem" }} />
            </a>
          )
        })}
      </div>

      <br />

      <Button>View Profile</Button>
    </Card>
  )
}

export default UserCard
