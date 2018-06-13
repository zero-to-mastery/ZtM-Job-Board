import React from "react";
import { withStyles } from "@material-ui/core/styles";
import styles from "./HeaderStyle";

const Header = ({ classes }) => {
  return (
    <div className={classes.header}>
      <h1 className={classes.header_h1}>Junior to Senior Job Board</h1>
    </div>
  );
};

export default withStyles(styles)(Header);
