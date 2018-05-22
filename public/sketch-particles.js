// ----------------------------------------
// Particle
// ----------------------------------------

function Particle(x, y, radius) {
  this.init(x, y, radius);
}

Particle.prototype = {

  init: function(x, y, radius) {

    this.alive = true;

    this.radius = radius || 10;
    this.wander = 0.15;
    this.theta = random(TWO_PI);
    this.drag = 0.92;
    this.color = '#EEEEEE';

    this.x = x || 0.0;
    this.y = y || 0.0;

    this.vx = 0.0;
    this.vy = 0.0;

  },

  move: function() {

    this.x += this.vx;
    this.y += this.vy;

    this.vx *= this.drag;
    this.vy *= this.drag;

    this.theta += random(-0.5, 0.5) * this.wander;
    this.vx += sin(this.theta) * 0.1;
    this.vy += cos(this.theta) * 0.1;

    this.radius *= 0.96;
    this.alive = this.radius > 0.5;

  },

  draw: function(ctx) {

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, TWO_PI);
    ctx.fillStyle = this.color;
    ctx.fill();

  }

};

// ----------------------------------------
// Example
// ----------------------------------------

var particles = [];
var pool = [];

var COLOURS = [
  '#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1', // Blue 50->900
  '#FFF8E1', '#FFECB3', '#FFE082', '#FFD54F', '#FFCA28', '#FFC107', '#FFB300', '#FFA000', '#FF8F00', '#FF6F00' // Amber 50->900
];

var CONTAINER = document.getElementById('sketch-particles');
var EVENT_TARGET = CONTAINER.getElementsByClassName('sketch');

if ((typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)) {

  console.info("Sketch particles: detected mobile device");

  var MAX_PARTICLES = 100;

  var liveBg = Sketch.create({
    fullscreen: true,
    autostart: true,
    autoclear: true,
    autopause: true,
    container: CONTAINER,
    interval: 1,
    globals: true,
    retina: 'auto',
    type: Sketch.CANVAS,
    eventTaget: EVENT_TARGET
  });

}
else {

  console.info("Sketch particles: detected device other than mobile");

  var MAX_PARTICLES = 300;

  var liveBg = Sketch.create({
    fullscreen: true,
    autostart: true,
    autoclear: true,
    autopause: false,
    container: CONTAINER,
    interval: 1,
    globals: true,
    retina: 'auto',
    type: Sketch.CANVAS,
    eventTaget: EVENT_TARGET
  });

}

liveBg.spawn = function(x, y) {

  var particle, theta, force;

  if (particles.length >= MAX_PARTICLES) {
    pool.push( particles.shift() );
  }

  particle = pool.length ? pool.pop() : new Particle();
  particle.init(x, y, random(5, 40));

  particle.wander = random(0.5, 2.0);
  particle.color = random(COLOURS);
  particle.drag = random(0.9, 0.99);

  theta = random(TWO_PI);
  force = random(2, 8);

  particle.vx = sin(theta) * force;
  particle.vy = cos(theta) * force;

  particles.push(particle);

};

liveBg.update = function() {

  var i, particle;

  for (i = particles.length - 1; i >= 0; i--) {

    particle = particles[i];

    if (particle.alive) {
      particle.move();
    }
    else {
      pool.push(particles.splice( i, 1 )[0]);
    }

  }

};

liveBg.draw = function() {

  liveBg.globalCompositeOperation  = 'source-over'; // best options: 'lighter' or 'source-over'

  for (var i = particles.length - 1; i >= 0; i--) {
    particles[i].draw(liveBg);
  }

};

liveBg.mousemove = function() {

  var particle, theta, force, touch, max, i, j, n;

  for (i = 0, n = liveBg.touches.length; i < n; i++) {

    touch = liveBg.touches[i], max = random(1, 4);

    for (j = 0; j < max; j++) {
      liveBg.spawn(touch.x, touch.y);
    }

  }

};
