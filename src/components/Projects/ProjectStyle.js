const styles = {
  // Profile Style
  root: {
    backgroundColor: "#009688",
    top: 50,
    left: 0,
    right: 0,
    position: "absolute",
    paddingTop: 20,
    paddingBottom: 20
  },
  form: {
    background: "#FFFFFF",
    width: 600,
    margin: "50px auto 80px",
    boxShadow: "0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)",
    padding: 50
  },
  label: {
    fontSize: 18,
    fontFamily: "Titillium Web, sans-serif"
  },
  input: {
    fontFamily: "Titillium Web, sans-serif",
    outline: 0,
    background: "#f2f2f2",
    border: 0,
    fontSize: 14,
    padding: "14px 20px",
    margin: "8px 0",
    width: "100%",
    boxSizing: "border-box"
  },
  button: {
    fontFamily: "Titillium Web, sans-serif",
    textTransform: "uppercase",
    outline: 0,
    background: "#009688",
    border: 0,
    color: "#FFFFFF",
    fontSize: 18,
    padding: "14px 20px",
    margin: "8px 0",
    width: "100%",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#009688"
    }
  },
  err: {
    margin: "15px 0 0",
    color: "#c0392b",
    fontSize: 14,
    fontFamily: "Titillium Web, sans-serif",
    textAlign: "center"
  },
  top: {
    marginTop: 480
  },
  block: {
    display: "inline-block",
    transition: "all 1s",
    "&:hover": {
      transform: "scale(1.1)"
    }
  },
  media: {
    height: 0,
    paddingTop: "70%"
  },
  card: {
    width: 255,
    height: 255,
    textAlign: "center",
    boxShadow: "0 3px 10px 0 rgba(0,0,0,.2)",
    margin: 12,
    borderRadius: ".25rem"
  },
  title: {
    textAlign: "left",
    fontSize: "1.1em",
    lineHeight: "1.25em",
    fontWeight: 400,
    color: "#009688",
    fontFamily: "Titillium Web, sans-serif"
  },
  remove_button: {
    backgroundColor: "#e74c3c",
    color: "#fff"
  },
  paper: {
    width: "100%",
    overflowX: "auto"
  },
  table: {
    minWidth: "100%",
    fontFamily: "Titillium Web, sans-serif"
  },
  del: {
    fontFamily: "Titillium Web, sans-serif",
    textTransform: "lowercase",
    outline: 0,
    border: 0
  }
};

module.exports = styles;
