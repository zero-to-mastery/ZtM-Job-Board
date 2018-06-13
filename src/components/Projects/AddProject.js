import React, { Component } from "react";
import styles from "./ProjectStyle";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import axios from "axios";

class AddProject extends Component {
  constructor() {
    super();
    this.state = {
      title: "",
      img: "",
      url: "",
      errors: ""
    };
    this.auth = localStorage.getItem("AUTH_TOKEN");
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        {this.auth ? (
          <div className={classes.form}>
            <label className={classes.label}>Title: *</label>
            <input
              autoFocus
              className={classes.input}
              placeholder="Title"
              type="title"
              onChange={e => this.setState({ title: e.target.value })}
              value={this.state.title}
            />
            <label className={classes.label}>Foto: *</label>
            <input
              className={classes.input}
              placeholder="Foto"
              type="foto"
              onChange={e => this.setState({ img: e.target.value })}
              value={this.state.img}
            />
            <label className={classes.label}>URL: *</label>
            <input
              className={classes.input}
              placeholder="URL"
              type="url"
              onChange={e => this.setState({ url: e.target.value })}
              value={this.state.url}
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
    const { title, img, url } = this.state;
    const projectFields = {};
    title && (projectFields.title = title);
    img && (projectFields.img = img);
    url && (projectFields.url = url);
    axios
      .post(
        "https://afternoon-river-43445.herokuapp.com/project",
        projectFields,
        {
          headers: { Authorization: this.auth }
        }
      )
      .then(res => {})
      .then(() => this.props.history.push(`/`))
      .catch(err => this.setState({ errors: err.response.data }));
  };
}

export default withStyles(styles)(AddProject);
