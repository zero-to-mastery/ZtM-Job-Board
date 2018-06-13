import React, { Component } from "react";
import styles from "./ProfileStyle";
import { withStyles } from "@material-ui/core/styles";
import axios from "axios";
import Avatar from "@material-ui/core/Avatar";
import ProjectCardList from "../Projects/ProjectCardList";

class Profile extends Component {
  constructor() {
    super();
    this.state = {
      profile: {},
      errors: ""
    };
  }

  componentDidMount() {
    const { userId } = this.props.match.params;
    axios
      .get(`https://afternoon-river-43445.herokuapp.com/users/${userId}`)
      .then(res => this.setState({ profile: res.data }))
      .catch(err => this.setState({ errors: err.response.data }));
  }

  render() {
    const { classes } = this.props;
    const {
      firstName,
      lastName,
      img,
      jobTitle,
      location,
      links
    } = this.state.profile;
    return (
      <div>
        {this.state.errors ? (
          <div className={classes.root}>
            <div className={classes.center}>
              <p className={classes.text}>{this.state.errors}</p>
            </div>
          </div>
        ) : !Object.keys(this.state.profile).length ? (
          <div className={classes.root}>
            <p className={classes.text}>Loading</p>
          </div>
        ) : (
          <div className={classes.root}>
            <Avatar alt={firstName} src={img} className={classes.avatar} />
            <p className={classes.text}>
              {firstName} {lastName}
            </p>
            <p className={classes.text}>{jobTitle}</p>
            {links && (
              <div className={classes.fotter_row}>
                {links.website && (
                  <Avatar className={classes.fotter_icon}>
                    <a
                      className={classes.fotter_icon_link}
                      href={links.website}
                    >
                      <i className="fas fa-globe" />
                    </a>
                  </Avatar>
                )}
                {links.github && (
                  <Avatar className={classes.fotter_icon}>
                    <a className={classes.fotter_icon_link} href={links.github}>
                      <i className="fab fa-github" />
                    </a>
                  </Avatar>
                )}
                {links.linkedin && (
                  <Avatar className={classes.fotter_icon}>
                    <a
                      className={classes.fotter_icon_link}
                      href={links.linkedin}
                    >
                      <i className="fab fa-linkedin-in" />
                    </a>
                  </Avatar>
                )}
              </div>
            )}
            {location && (
              <p className={classes.location}>
                {location.city}, {location.state}, {location.country}
              </p>
            )}
          </div>
        )}
        <ProjectCardList />
      </div>
    );
  }
}

export default withStyles(styles)(Profile);
