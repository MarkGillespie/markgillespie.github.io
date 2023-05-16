var c = 0;
var ctx = 0;
var width = 0;
var height = 0;
var scale = 0;

function screen_x(z) {
  return scale * z.re() + width/2;
}

function screen_y(z) {
  return -scale * z.im() + height/2;
}

function draw_disk() {
  ctx.beginPath();
  ctx.arc(width/2, height/2, scale + 1, 0, 2 * Math.PI, false);
  ctx.closePath();
  ctx.fillStyle = "rgb(220, 220, 220)";
  ctx.fill();
}

function draw_scene(automorphism) {
  draw_disk();
  octagons.forEach(function(octagon) {octagon.draw(automorphism)});
}

function init() {
  c = document.getElementById("hyperbolic_disk")
  ctx = c.getContext("2d");
  width = c.width;
  height = c.height;
  scale = width/2;

  init_octagons();
  draw_scene(identity_automorphism());
}

function get_mouse_pos(canvas, e) {
  let rect = canvas.getBoundingClientRect();
  return new Complex(
    (e.clientX - rect.left) / scale - 1,
    -(e.clientY - rect.top) / scale + 1
  );
}

class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  color_string() {
    return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
  }

  light_color_string() {
    let light_r = Math.min(this.r + 50, 255);
    let light_g = Math.min(this.g + 50, 255);
    let light_b = Math.min(this.b + 50, 255);

    return 'rgb(' + light_r + ',' + light_g + ',' + light_b + ')';
  }
}

function random_color() {
  let r = 255*Math.random()|0;
  let g = 255*Math.random()|0;
  let b = 255*Math.random()|0;

  return new Color(r, g, b);
}

// Arc passing through 3 points
// Mobius transformations don't have to preserve the center of a circle, I think, but there is
// always a unique circle through 3 points
// (points are represented by complex numbers)
class Arc {
  constructor(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }

  center(automorphism) {
    let a = automorphism.apply(this.a);
    let b = automorphism.apply(this.b);
    let c = automorphism.apply(this.c);
    // Formula for a circle through three points from here
    // http://www.ambrsoft.com/trigocalc/circle3d.htm/
    let A = a.re() * (b.im() - c.im()) - a.im() * (b.re() - c.re()) + b.re() * c.im() - c.re() * b.im();
    let B = mod(a)**2 * (c.im() - b.im()) + mod(b)**2 * (a.im() - c.im()) + mod(c)**2 * (b.im() - a.im());
    let C = mod(a)**2 * (b.re() - c.re()) + mod(b)**2 * (c.re() - a.re()) + mod(c)**2 * (a.re() - b.re());
    return new Complex(-B / (2 * A), -C / (2 * A));
  }

  draw(automorphism) {
    let my_center = this.center(automorphism);
    let current_a = automorphism.apply(this.a);
    let current_c = automorphism.apply(this.c);
    let my_radius = mod(minus(my_center, current_a));
    let a_angle = arg(minus(current_a, my_center));
    let c_angle = arg(minus(current_c, my_center));
    let initial_angle = -a_angle;
    let final_angle   = -c_angle;
    if (det_sign(current_a, current_c) < 0) {
      initial_angle = -c_angle;
      final_angle   = -a_angle;
    }

    ctx.beginPath();
    ctx.arc(screen_x(my_center), screen_y(my_center), scale * my_radius, initial_angle, final_angle, false);
    ctx.lineWidth=1;
    ctx.strokeStyle="#000";
    ctx.stroke();
  }
transform(automorphism) {
    this.a = automorphism.apply(this.a);
    this.b = automorphism.apply(this.b);
    this.c = automorphism.apply(this.c);
  }
}

// Return the center point of a hyperbolic geodesic between z and w
// Doesn't work on all edge cases - but it does work on the initial points of an octagon!
function center_point(z, w) {
  let z_ratio = (mod(z)**2 + 1) / (2 * mod(z));
  let w_ratio = (mod(w)**2 + 1) / (2 * mod(w));
  let angle_diff = Math.abs(arg(z) - arg(w));
  if (angle_diff > Math.PI) {
    angle_diff = 2 * Math.PI - angle_diff;
  }

  let angle_cos = Math.cos(angle_diff);

  let z_angle_cos = z_ratio * Math.sqrt((angle_cos**2 - 1) / (-(w_ratio**2) + 2 * angle_cos * w_ratio * z_ratio - z_ratio**2));
  let dist = z_ratio / z_angle_cos;
  let radius = Math.sqrt(dist**2-1);
  let center = div(z, new Complex(mod(z), 0));
  center = times(center, new Complex(dist - radius, 0));
  let rotation = from_polar(1, det_sign(z,w) * Math.acos(z_angle_cos));
  center = times(rotation, center);
  return center;
}

function draw_poly(curve, color, automorphism) {
  curve = curve.map(automorphism.transformation());
  ctx.beginPath();
  ctx.moveTo(screen_x(curve[0]), screen_y(curve[0]));
  for (let i = 1; i < curve.length; i++) {
    ctx.lineTo(screen_x(curve[i]), screen_y(curve[i]));
    ctx.lineWidth=5;
    ctx.strokeStyle="#0000" + 100 * (i-1);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function draw_arcs(arcs, automorphism, context) {
  arcs.forEach((arc)=>arc.draw(automorphism, context));
}

function draw_dot(z, automorphism) {
  let circle_center = automorphism.apply(z);
  ctx.beginPath();
  ctx.arc(screen_x(circle_center), screen_y(circle_center), 10, 0, 2 * Math.PI, false);
  ctx.closePath();
  ctx.fillStyle = "rgb(255, 0, 0)";
  ctx.fill();
}
