import React, { Component } from "react";
import styles from "./ProjectStyle";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import axios from "axios";

class AddProject extends Component {
  constructor() {
    super();
    this.state = {
      projects: []
    };
    this.auth = localStorage.getItem("AUTH_TOKEN");
  }
  componentDidMount() {
    axios
      .get(`https://afternoon-river-43445.herokuapp.com/projects/`, {
        headers: { Authorization: this.auth }
      })
      .then(res => this.setState({ projects: res.data }))
      .catch(err => this.setState({ errors: err.response.data }));
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        {this.auth ? (
          <div className={classes.form}>
            <Paper className={classes.paper}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>projects</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.projects.map(project => {
                    return (
                      <TableRow key={project._id}>
                        <TableCell component="th" scope="row">
                          {project.title}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          <Button
                            className={classes.del}
                            onClick={() => this._del(project._id)}
                          >
                            delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          </div>
        ) : (
          this.props.history.push(`/login`)
        )}
      </div>
    );
  }
  _del = id => {
    axios
      .delete(`https://afternoon-river-43445.herokuapp.com/project/${id}`, {
        headers: { Authorization: this.auth }
      })
      .then(res => {})
      .then(() => this.props.history.push(`/`));
  };
}

export default withStyles(styles)(AddProject);
