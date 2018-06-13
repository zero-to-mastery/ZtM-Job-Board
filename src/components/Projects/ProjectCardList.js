import React, { Component } from "react";
import ProjectCard from "./ProjectCard";
import styles from "./ProjectStyle";
import { withStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router";
import axios from "axios";

class ProjectCardList extends Component {
  constructor() {
    super();
    this.state = {
      projects: [],
      errors: ""
    };
  }

  componentDidMount() {
    const { userId } = this.props.match.params;
    axios
      .get(`https://afternoon-river-43445.herokuapp.com/projects/all/${userId}`)
      .then(res => this.setState({ projects: res.data }))
      .catch(err => this.setState({ errors: err.response.data }));
  }
  render() {
    const { classes } = this.props;
    const { projects, errors } = this.state;
    return (
      <div className={classes.top}>
        {errors ? (
          <p className={classes.title}>{errors}</p>
        ) : (
          !projects.length && <p className={classes.title}>Loading</p>
        )}
        {projects.map(project => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
    );
  }
}

export default withStyles(styles)(withRouter(ProjectCardList));
