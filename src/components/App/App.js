import React, { Component } from "react";
import Appbar from "../AppBar/AppBar";
import Footer from "../Footer/Footer";
import Searchbar from "../Searchbar/Searchbar";
import Header from "../Header/Header";
import Login from "../Login/Login";
import Signup from "../Signup/Signup";
import Profile from "../Profile/Profile";
import CreateProfile from "../Profile/CreateProfile";
import AddProject from "../Projects/AddProject";
import DeleteProject from "../Projects/DeleteProject";
import ProfileCardList from "../ProfileCard/ProfileCardList";
import { withStyles } from "@material-ui/core/styles";
import Particles from "react-particles-js";
import particlesOptions from "./particlesOptions";
import styles from "./AppStyle";
import { Switch, Route } from "react-router-dom";

class App extends Component {
  state = {
    serarchfield: "",
    category: "name"
  };

  render() {
    const { classes } = this.props;
    const { serarchfield, category } = this.state;
    return (
      <div className={classes.container}>
        <Particles className={classes.particles} params={particlesOptions} />
        <Appbar />
        <Switch>
          <Route
            exact
            path="/"
            render={() => {
              return (
                <div>
                  <Header />
                  <Searchbar
                    searchChange={this.onSearchChange}
                    categoryChange={this.onCategoryChange}
                  />
                  <ProfileCardList
                    serarchfield={serarchfield}
                    category={category}
                  />
                  <Footer />
                </div>
              );
            }}
          />
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={Signup} />
          <Route exact path="/users/:userId" component={Profile} />
          <Route exact path="/profile" component={CreateProfile} />
          <Route exact path="/add" component={AddProject} />
          <Route exact path="/del" component={DeleteProject} />
        </Switch>
      </div>
    );
  }

  onSearchChange = e => {
    this.setState({ serarchfield: e.target.value });
  };

  onCategoryChange = event => {
    this.setState({ category: event.target.value });
  };
}

export default withStyles(styles)(App);
