import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardMedia from "@material-ui/core/CardMedia";
import styles from "./ProjectStyle";

const ProjectCard = ({ classes, project }) => {
  return (
    <a href={project.url}>
      <div className={classes.block}>
        <Card className={classes.card}>
          <CardMedia
            className={classes.media}
            image={project.img}
            title={project.title}
          />
          <CardContent>
            <Typography
              className={classes.title}
              gutterBottom
              variant="headline"
            >
              {project.title}
            </Typography>
          </CardContent>
        </Card>
      </div>
    </a>
  );
};

export default withStyles(styles)(ProjectCard);
