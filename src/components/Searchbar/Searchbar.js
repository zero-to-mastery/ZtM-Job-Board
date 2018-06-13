import React from "react";
import { withStyles } from "@material-ui/core/styles";
import styles from "./SearchbarStyle";

const Searchbar = ({ classes, searchChange, categoryChange }) => {
  return (
    <div className={classes.search_box}>
      <button className={classes.search_button}>
        <i className="fa fa-search" />
      </button>
      <input
        onChange={searchChange}
        className={classes.search}
        type="text"
        placeholder="Search"
      />
      <div className={classes.group}>
        <input
          onChange={categoryChange}
          type="radio"
          name="search"
          value="name"
        />{" "}
        Name{" "}
        <input
          onChange={categoryChange}
          type="radio"
          name="search"
          value="location"
        />{" "}
        Location{" "}
        <input
          onChange={categoryChange}
          type="radio"
          name="search"
          value="title"
        />{" "}
        Title{" "}
      </div>
    </div>
  );
};

export default withStyles(styles)(Searchbar);
