const particlesOptions = {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 650
      }
    },
    color: {
      value: "#3F51B5"
    },
    shape: {
      type: "edge",
      stroke: {
        width: 0,
        color: "#3F51B5"
      }
    },
    size: {
      value: 3,
      random: true,
      anim: {
        enable: false,
        speed: 40,
        size_min: 0.1,
        sync: false
      }
    },
    line_linked: {
      enable: true,
      distance: 100,
      color: "#3F51B5",
      opacity: 0.09,
      width: 1
    }
  }
};

module.exports = particlesOptions;
