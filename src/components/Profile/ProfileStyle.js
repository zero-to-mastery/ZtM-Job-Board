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
  avatar: {
    marginTop: 16,
    marginBottom: 16,
    width: 130,
    height: 130,
    boxShadow: "0 10px 25px 0 rgba(0,0,0,.3)",
    margin: "auto"
  },
  text: {
    lineHeight: "1em",
    fontWeight: 400,
    fontSize: "1.3em",
    fontFamily: "Titillium Web, sans-serif",
    color: "#fff",
    textAlign: "center"
  },
  location: {
    fontFamily: "Titillium Web, sans-serif",
    color: "#fff",
    textAlign: "center"
  },
  fotter_row: {
    display: "flex",
    justifyContent: "center"
  },
  fotter_icon: {
    margin: 6,
    backgroundColor: "#fff"
  },
  fotter_icon_link: {
    color: "#009688"
  },
  link: {
    margin: "auto",
    fontSize: "1.1em",
    lineHeight: "1.1em",
    color: "#fff",
    textTransform: "capitalize",
    fontFamily: "Titillium Web, sans-serif"
  },
  center: {
    textAlign: "center"
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
  }
};

module.exports = styles;
