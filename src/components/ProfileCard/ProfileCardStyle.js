const styles = {
  // Profile Style

  top: {
    marginTop: 24
  },
  block: {
    display: "inline-block",
    transition: "all 1s",
    "&:hover": {
      transform: "scale(1.1)"
    }
  },
  card: {
    width: 255,
    height: 362,
    textAlign: "center",
    boxShadow: "0 3px 10px 0 rgba(0,0,0,.2)",
    margin: 12,
    borderRadius: ".25rem"
  },
  avatar: {
    marginTop: 16,
    marginBottom: 16,
    width: 130,
    height: 130,
    boxShadow: "0 10px 25px 0 rgba(0,0,0,.3)",
    margin: "auto"
  },
  name: {
    fontSize: "1.5em",
    lineHeight: "1.25em",
    fontWeight: 400,
    color: "#525252",
    fontFamily: "Titillium Web, sans-serif"
  },
  title: {
    fontSize: "1.2em",
    lineHeight: "1.25em",
    fontWeight: 400,
    color: "#009688",
    fontFamily: "Titillium Web, sans-serif"
  },
  city: {
    fontSize: "1.1em",
    lineHeight: "1.25em",
    fontWeight: 400,
    color: "#525252",
    fontFamily: "Titillium Web, sans-serif",
    marginTop: 12
  }
};

module.exports = styles;
