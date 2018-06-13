import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import styles from "./LoginStyle";
import Button from "@material-ui/core/Button";
import axios from "axios";

class Login extends Component {
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
              autoFocus
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
            <Button className={classes.button} onClick={this._login}>
              Login
            </Button>
            <p className={classes.message}>
              Not registered?{" "}
              <a className={classes.message_a} href="/signup">
                Create an account
              </a>
            </p>
          </div>
        )}
      </div>
    );
  }

  _login = () => {
    const { email, password } = this.state;
    axios
      .post("https://afternoon-river-43445.herokuapp.com/login", {
        email,
        password
      })
      .then(res => {
        const { token } = res.data;
        localStorage.setItem("AUTH_TOKEN", token);
      })
      .then(() => this.props.history.push(`/`))
      .catch(err => this.setState({ errors: err.response.data }));
  };
}

export default withStyles(styles)(Login);
