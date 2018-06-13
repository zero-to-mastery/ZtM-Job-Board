import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import styles from "./ProfileCardStyle";

const ProfileCard = ({ classes, user }) => {
  return (
    <a href={`/users/${user.user}`}>
      <div className={classes.block}>
        <Card className={classes.card}>
          <Avatar
            alt={user.firstName}
            src={user.img}
            className={classes.avatar}
          />
          <CardContent>
            <Typography
              className={classes.name}
              gutterBottom
              variant="headline"
            >
              {user.firstName} {user.lastName}
            </Typography>
            <Typography className={classes.title}>{user.jobTitle}</Typography>
            {user.location && (
              <Typography className={classes.city} gutterBottom>
                {user.location.city}, {user.location.state},{" "}
                {user.location.country}
              </Typography>
            )}
          </CardContent>
        </Card>
      </div>
    </a>
  );
};

export default withStyles(styles)(ProfileCard);
