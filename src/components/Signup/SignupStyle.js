const styles = {
  // Signup Style

  form: {
    background: "#FFFFFF",
    width: 315,
    margin: "200px auto 80px",
    textAlign: "center",
    boxShadow: "0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)",
    padding: 45
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
  message: {
    margin: "15px 0 0",
    color: "#57606f",
    fontSize: 14,
    fontFamily: "Titillium Web, sans-serif"
  },
  message_a: {
    color: "#009688",
    textDecoration: "none"
  },
  err: {
    margin: "15px 0 0",
    color: "#c0392b",
    fontSize: 14,
    fontFamily: "Titillium Web, sans-serif"
  }
};

module.exports = styles;
