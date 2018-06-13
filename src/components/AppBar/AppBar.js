import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import styles from "./AppBarStyle";
import { withRouter } from "react-router";

class Appbar extends Component {
  constructor() {
    super();
    this.state = {
      anchorEl: null
    };
  }

  render() {
    this.auth = localStorage.getItem("AUTH_TOKEN");
    const { classes } = this.props;
    const { anchorEl } = this.state;
    return (
      <div className={classes.root}>
        <AppBar className={classes.shadow} position="fixed" color="inherit">
          <Toolbar>
            <Typography
              variant="title"
              color="inherit"
              className={classes.flex}
            >
              <a className={classes._a} href="/">
                Job Bord
              </a>
            </Typography>
            {!this.auth ? (
              <div>
                <Button className={classes.button} href="/login">
                  Login
                </Button>
                <Button className={classes.button} href="/signup">
                  signup
                </Button>
              </div>
            ) : (
              <div>
                <Button
                  className={classes.button}
                  aria-owns={anchorEl ? "menu" : null}
                  aria-haspopup="true"
                  onClick={this.handleClick}
                >
                  Settings
                </Button>
                <Menu
                  id="menu"
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={this.handleClose}
                >
                  <a className={classes._a} href="/profile">
                    <MenuItem onClick={this.handleClose}>Profile</MenuItem>
                  </a>
                  <a className={classes._a} href="/add">
                    <MenuItem onClick={this.handleClose}>Add Project</MenuItem>
                  </a>
                  <a className={classes._a} href="/del">
                    <MenuItem onClick={this.handleClose}>
                      Delete Project
                    </MenuItem>
                  </a>
                  <MenuItem onClick={this._logout}>Logout</MenuItem>
                </Menu>
              </div>
            )}
          </Toolbar>
        </AppBar>
      </div>
    );
  }

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };
  _logout = () => {
    this.setState({ anchorEl: null });
    localStorage.removeItem("AUTH_TOKEN");
    this.props.history.push(`/`);
  };
}

export default withStyles(styles)(withRouter(Appbar));
