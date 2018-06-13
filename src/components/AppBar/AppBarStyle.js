const styles = {
  // AppBar Style

  root: {
    flexGrow: 1
  },
  flex: {
    flex: 1,
    color: "#009688",
    fontSize: "1.25em",
    fontWeight: 400,
    lineHeight: "1.25em",
    fontFamily: "Titillium Web, sans-serif",
    textTransform: "uppercase",
    marginLeft: 80
  },
  shadow: {
    boxShadow: "0 0 10px 0 rgba(0,0,0,.15)"
  },
  button: {
    fontSize: "1.1em",
    lineHeight: "1.1em",
    color: "#009688",
    textTransform: "capitalize",
    fontFamily: "Titillium Web, sans-serif",
    "&:hover": {
      backgroundColor: "#fff"
    }
  },
  _a: {
    color: "#009688",
    textDecoration: "none",
    outline: 0
  }
};

module.exports = styles;
