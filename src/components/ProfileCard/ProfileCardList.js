import React, { Component } from "react";
import ProfileCard from "./ProfileCard";
import styles from "./ProfileCardStyle";
import { withStyles } from "@material-ui/core/styles";
import axios from "axios";

class ProfileCardList extends Component {
  constructor() {
    super();
    this.state = {
      users: []
    };
  }

  componentDidMount() {
    axios
      .get("https://afternoon-river-43445.herokuapp.com/profile/all")
      .then(res => this.setState({ users: res.data }));
  }
  render() {
    const { classes, serarchfield, category } = this.props;
    const { users } = this.state;
    const filteredUsers = users.filter(user => {
      const title = user.jobTitle;
      const name = `${user.firstName} ${user.lastName}`;
      const location = `${user.location.city} ${user.location.state} ${
        user.location.country
      }`;

      category === "name" && (user = name);
      category === "location" && (user = location);
      category === "title" && (user = title);

      return user.toLowerCase().includes(serarchfield.toLowerCase());
    });
    return (
      <div className={classes.top}>
        {!filteredUsers.length && <p className={classes.name}>Loading</p>}
        {filteredUsers.map(user => <ProfileCard key={user._id} user={user} />)}
      </div>
    );
  }
}

export default withStyles(styles)(ProfileCardList);
