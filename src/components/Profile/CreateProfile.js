import React, { Component } from "react";
import styles from "./ProfileStyle";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import axios from "axios";

class CreateProfile extends Component {
  constructor() {
    super();
    this.state = {
      firstName: "",
      lastName: "",
      jobTitle: "",
      img: "",
      website: "",
      linkedin: "",
      github: "",
      city: "",
      state: "",
      country: "",
      errors: ""
    };
    this.auth = localStorage.getItem("AUTH_TOKEN");
  }

  componentDidMount() {
    axios
      .get("https://afternoon-river-43445.herokuapp.com/profile", {
        headers: { Authorization: this.auth }
      })
      .then(res => {
        const {
          firstName,
          lastName,
          jobTitle,
          img,
          website,
          linkedin,
          github,
          city,
          state,
          country
        } = this.state;
        const profile = {};
        profile.firstName = !res.data.firstName
          ? firstName
          : res.data.firstName;
        profile.lastName = !res.data.lastName ? lastName : res.data.lastName;
        profile.jobTitle = !res.data.jobTitle ? jobTitle : res.data.jobTitle;
        profile.img = !res.data.img ? img : res.data.img;
        res.data.links &&
          (profile.website = !res.data.links.website
            ? website
            : res.data.links.website);
        res.data.links &&
          (profile.linkedin = !res.data.links.linkedin
            ? linkedin
            : res.data.links.linkedin);
        res.data.links &&
          (profile.github = !res.data.links.github
            ? github
            : res.data.links.github);
        res.data.location &&
          (profile.city = !res.data.location.city
            ? city
            : res.data.location.city);
        res.data.location &&
          (profile.state = !res.data.location.state
            ? state
            : res.data.location.state);
        res.data.location &&
          (profile.country = !res.data.location.city
            ? country
            : res.data.location.country);

        this.setState({
          firstName: profile.firstName,
          lastName: profile.lastName,
          jobTitle: profile.jobTitle,
          img: profile.img,
          website: profile.website,
          linkedin: profile.linkedin,
          github: profile.github,
          city: profile.city,
          state: profile.state,
          country: profile.country
        });
      });
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        {this.auth ? (
          <div className={classes.form}>
            <label className={classes.label}>First Name: *</label>
            <input
              autoFocus
              className={classes.input}
              placeholder="First Name"
              type="firstName"
              onChange={e => this.setState({ firstName: e.target.value })}
              value={this.state.firstName}
            />
            <label className={classes.label}>Last Name: *</label>
            <input
              className={classes.input}
              placeholder="Last Name"
              type="lastName"
              onChange={e => this.setState({ lastName: e.target.value })}
              value={this.state.lastName}
            />
            <label className={classes.label}>JobTitle: *</label>
            <input
              className={classes.input}
              placeholder="JobTitle"
              type="jobTitle"
              onChange={e => this.setState({ jobTitle: e.target.value })}
              value={this.state.jobTitle}
            />
            <label className={classes.label}>Foto: *</label>
            <input
              className={classes.input}
              placeholder="Foto"
              type="img"
              onChange={e => this.setState({ img: e.target.value })}
              value={this.state.img}
            />
            <label className={classes.label}>links:</label>
            <input
              className={classes.input}
              placeholder="Website"
              type="website"
              onChange={e => this.setState({ website: e.target.value })}
              value={this.state.website}
            />
            <input
              className={classes.input}
              placeholder="Linkedin"
              type="linkedin"
              onChange={e => this.setState({ linkedin: e.target.value })}
              value={this.state.linkedin}
            />
            <input
              className={classes.input}
              placeholder="Github"
              type="github"
              onChange={e => this.setState({ github: e.target.value })}
              value={this.state.github}
            />
            <label className={classes.label}>location:</label>
            <input
              className={classes.input}
              placeholder="City"
              type="city"
              onChange={e => this.setState({ city: e.target.value })}
              value={this.state.city}
            />
            <input
              className={classes.input}
              placeholder="State"
              type="state"
              onChange={e => this.setState({ state: e.target.value })}
              value={this.state.state}
            />
            <input
              className={classes.input}
              placeholder="Country"
              type="country"
              onChange={e => this.setState({ country: e.target.value })}
              value={this.state.country}
            />
            <p className={classes.err}>{this.state.errors}</p>
            <Button className={classes.button} onClick={this._add}>
              Add
            </Button>
          </div>
        ) : (
          this.props.history.push(`/login`)
        )}
      </div>
    );
  }
  _add = () => {
    const {
      firstName,
      lastName,
      jobTitle,
      img,
      website,
      linkedin,
      github,
      city,
      state,
      country
    } = this.state;
    const profileFields = {};
    firstName && (profileFields.firstName = firstName);
    lastName && (profileFields.lastName = lastName);
    jobTitle && (profileFields.jobTitle = jobTitle);
    img && (profileFields.img = img);
    website && (profileFields.website = website);
    linkedin && (profileFields.linkedin = linkedin);
    github && (profileFields.github = github);
    city && (profileFields.city = city);
    state && (profileFields.state = state);
    country && (profileFields.country = country);
    axios
      .post(
        "https://afternoon-river-43445.herokuapp.com/profile",
        profileFields,
        {
          headers: { Authorization: this.auth }
        }
      )
      .then(res => {})
      .then(() => this.props.history.push(`/`))
      .catch(err => this.setState({ errors: err.response.data }));
  };
}

export default withStyles(styles)(CreateProfile);
