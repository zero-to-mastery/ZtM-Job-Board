import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import styles from "./SignupStyle";
import Button from "@material-ui/core/Button";
import axios from "axios";

class Signup extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
      errors: ""
    };
    this.auth = localStorage.getItem("AUTH_TOKEN");
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        {this.auth ? (
          this.props.history.push(`/`)
        ) : (
          <div className={classes.form}>
            <input
              className={classes.input}
              placeholder="Email"
              type="email"
              onChange={e => this.setState({ email: e.target.value })}
              value={this.state.email}
            />
            <input
              className={classes.input}
              placeholder="Password"
              type="password"
              onChange={e => this.setState({ password: e.target.value })}
              value={this.state.password}
            />
            {this.state.errors && (
              <div className={classes.err}>{this.state.errors}</div>
            )}
            <Button className={classes.button} onClick={this._signup}>
              Sign up
            </Button>
            <p className={classes.message}>
              Already have an account?{" "}
              <a className={classes.message_a} href="/login">
                Login
              </a>
            </p>
          </div>
        )}
      </div>
    );
  }
  _signup = () => {
    const { email, password } = this.state;
    axios
      .post("https://afternoon-river-43445.herokuapp.com/signup", {
        email,
        password
      })
      .then(res => {
        const { token } = res.data;
        localStorage.setItem("AUTH_TOKEN", token);
      })
      .then(() => this.props.history.push(`/profile`))
      .catch(err => this.setState({ errors: err.response.data }));
  };
}

export default withStyles(styles)(Signup);
