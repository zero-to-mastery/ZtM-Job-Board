import React from "react";
import { withStyles } from "@material-ui/core/styles";
import styles from "./FooterStyle";
import Avatar from "@material-ui/core/Avatar";

const Fotter = ({ classes }) => {
  return (
    <div className={classes.fotter}>
      <h1 className={classes.fotter_text}>Made with ❤ by Romany.B</h1>
      <div className={classes.fotter_row}>
        <Avatar className={classes.fotter_icon}>
          <a className={classes.fotter_icon_link} href="#!">
            <i className="fas fa-globe" />
          </a>
        </Avatar>
        <Avatar className={classes.fotter_icon}>
          <a
            className={classes.fotter_icon_link}
            href="https://github.com/remo758"
          >
            <i className="fab fa-github" />
          </a>
        </Avatar>
        <Avatar className={classes.fotter_icon}>
          <a
            className={classes.fotter_icon_link}
            href="https://www.linkedin.com/in/romany-bibawy/"
          >
            <i className="fab fa-linkedin-in" />
          </a>
        </Avatar>
      </div>
    </div>
  );
};

export default withStyles(styles)(Fotter);
