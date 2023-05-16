class Color {
  constructor(h, s, l) {
    this.h = h;
    this.s = s;
    this.l = l;
  }

  color_string() {
    return "hsl(" + this.h + ", " + this.s + "%, " + this.l + "%)";
  }

  faded_color_string(a) {
    let s = background.s * (1-a) + a * this.s;
    let l = background.l * (1-a) + a * this.l;
    return "hsl(" + this.h + ", " + s + "%, " + l + "%)";
  }
}

let canvas_width  = 400;
let canvas_height = 400;

let background = new Color(0, 0, 95);
let lines = "hsl(120, 0%, 70%)";
let accent = new Color(240, 60, 80);

let max_trail_length = 60;

function randomColor() {
  let h = Math.random() * 160 + 80;
  let s = Math.random() * 20 + 30;
  let l = Math.random() * 30 + 40;
  return "hsl(" + h + ", " + s + "%, " + l + "%)";
}

function draw_path_with_end(ctx, path, end_x, end_y, color) {
  for (let i = 2; i < path.length; i++) {
    // Check so we don't draw a line across the screen when the point jumps
    // Draw 2 segments at once for smoothness
    if (Math.abs(path[i][0] - path[i-1][0]) < 50
          && Math.abs(path[i][1] - path[i-1][1]) < 50
          && Math.abs(path[i-1][0] - path[i-2][0]) < 50
          && Math.abs(path[i-1][1] - path[i-2][1]) < 50) {
      ctx.beginPath();
      ctx.moveTo(path[i][0], path[i][1]);
      ctx.lineTo(path[i-1][0], path[i-1][1]);
      ctx.lineTo(path[i-2][0], path[i-2][1]);
      ctx.strokeStyle = color.faded_color_string(1 - (path.length - i) / max_trail_length);
      ctx.lineCap = "round";
      ctx.lineWidth = 8;
      ctx.stroke();
    }
  }

  // Draw one last line to the current point (as long as there is some point in the trail,
  //  and this line doesn't cross the screen)
  if (path.length > 0
        && Math.abs(path[path.length-1][0] - end_x) < 50
        && Math.abs(path[path.length-1][1] - end_y) < 50) {
      ctx.beginPath();
      ctx.moveTo(path[path.length-1][0], path[path.length-1][1]);
      ctx.lineTo(end_x,end_y);
      ctx.strokeStyle = color.color_string();
      ctx.lineCap = "round";
      ctx.lineWidth = 8;
      ctx.stroke();
  }
}

class Pendulum {
  constructor(q, p) {
    this.q = q;
    this.p = p;
    this.color = accent;
    this.phase_trail = [];
    this.count = 0;
  }

  draw(state_ctx, phase_ctx) {
    this.count++;

    // State Space
    let x = canvas_width/2  + canvas_width/3  * Math.sin(this.q);
    let y = canvas_height/2 + canvas_height/3 * Math.cos(this.q);

    state_ctx.beginPath();
    state_ctx.moveTo(canvas_width/2, canvas_height/2);
    state_ctx.strokeStyle = lines;
    state_ctx.lineWidth = 5;
    state_ctx.lineTo(x,y);
    state_ctx.stroke();

    state_ctx.beginPath();
    state_ctx.arc(canvas_width/2, canvas_height/2, 5, 0, 2 * Math.PI, false);
    state_ctx.fillStyle = lines;
    state_ctx.fill();

    state_ctx.beginPath();
    state_ctx.arc(x, y, 30, 0, 2 * Math.PI, false);
    state_ctx.fillStyle = this.color.color_string();
    state_ctx.fill();

    // Phase Space
    phase_ctx.beginPath();
    phase_ctx.strokeStyle = lines;
    phase_ctx.lineWidth = 2;
    phase_ctx.moveTo(0.05 * canvas_width, canvas_height/2);
    phase_ctx.lineTo(0.95 * canvas_width, canvas_height/2);
    phase_ctx.moveTo(canvas_width/2, 0.05 * canvas_height);
    phase_ctx.lineTo(canvas_width/2, 0.95 * canvas_height);
    phase_ctx.stroke();

    x = canvas_width/2  + ((this.q + Math.PI) % (2 * Math.PI) - Math.PI)/ Math.PI * canvas_width/2;
    y = canvas_height/2 + this.p / 10 * canvas_height;

    draw_path_with_end(phase_ctx, this.phase_trail, x, y, this.color);

    phase_ctx.beginPath();
    phase_ctx.arc(x, y, 10, 0, 2 * Math.PI, false);
    phase_ctx.fillStyle = this.color.color_string();
    phase_ctx.fill();


    if (this.count == 5) {
      this.phase_trail.push([x,y]);
      if (this.phase_trail.length > max_trail_length) {
        this.phase_trail.shift(); 
      }
      this.count = 0; 
    }
  } 
}

function resize(canvas) {
  canvas.width  = canvas_width;
  canvas.height = canvas_height;
}

function clear(ctx) {
  ctx.clearRect(0, 0, canvas_width, canvas_height);
  ctx.fillStyle = background.color_string();
  ctx.rect(0, 0, canvas_width, canvas_height);
  ctx.fill();
}

function energy(q, p) {
  return 1/2 * p * p - Math.cos(q);
}

function explicit_step(pendulum, dt) {
  old_q = pendulum.q;
  old_p = pendulum.p;

  pendulum.q = old_q + dt * old_p;
  pendulum.p = old_p - dt * Math.sin(old_q);

  //console.log("explicit dE", energy(pendulum.q, pendulum.p) - energy(old_q, old_p));
}

function implicit_objective(new_q, old_q, old_p, dt) {
  return new_q + dt * dt * Math.sin(new_q) - old_q - dt * old_p;
}

function implicit_objective_derivative(new_q, dt) {
  return 1 + dt * dt * Math.cos(new_q);
}

function implicit_step(pendulum, dt) {
  old_q = pendulum.q;
  old_p = pendulum.p;

  // Newton solver to solve the implicit equations
  // new_q = old_q + dt * new_p
  // new_p = old_p - dt * sin(new_q)
  
  new_q = old_q;
  while (Math.abs(implicit_objective(new_q, old_q, old_p, dt)) > 0.00001) {
    new_q -= implicit_objective(new_q, old_q, old_p, dt) / implicit_objective_derivative(new_q, dt);  
  }

  new_p = old_p - dt * Math.sin(new_q);

  pendulum.q = new_q;
  pendulum.p = new_p;
}

function symplectic_step(pendulum, dt) {
  pendulum.p -= dt * Math.sin(pendulum.q);
  pendulum.q += dt * pendulum.p;
}


function setup() {
  let explicit_state_canvas = document.getElementById("explicit_euler_state");
  let explicit_phase_canvas = document.getElementById("explicit_euler_phase");
  let implicit_state_canvas = document.getElementById("implicit_euler_state");
  let implicit_phase_canvas = document.getElementById("implicit_euler_phase");
  let symplectic_state_canvas = document.getElementById("symplectic_euler_state");
  let symplectic_phase_canvas = document.getElementById("symplectic_euler_phase");

  resize(explicit_state_canvas);
  resize(explicit_phase_canvas);
  resize(implicit_state_canvas);
  resize(implicit_phase_canvas);
  resize(symplectic_state_canvas);
  resize(symplectic_phase_canvas);

  let explicit_state_ctx = explicit_state_canvas.getContext("2d");
  let explicit_phase_ctx = explicit_phase_canvas.getContext("2d");
  let implicit_state_ctx = implicit_state_canvas.getContext("2d");
  let implicit_phase_ctx = implicit_phase_canvas.getContext("2d");
  let symplectic_state_ctx = symplectic_state_canvas.getContext("2d");
  let symplectic_phase_ctx = symplectic_phase_canvas.getContext("2d");

  let explicit_pendulum = new Pendulum(0.8, 0);
  let implicit_pendulum = new Pendulum(0.8, 0);
  let symplectic_pendulum = new Pendulum(0.8, 0);
  window.setInterval(function() {
    clear(explicit_state_ctx);
    clear(explicit_phase_ctx);
    clear(implicit_state_ctx);
    clear(implicit_phase_ctx);
    clear(symplectic_state_ctx);
    clear(symplectic_phase_ctx);

    explicit_step(explicit_pendulum, 0.03);  
    implicit_step(implicit_pendulum, 0.03);  
    symplectic_step(symplectic_pendulum, 0.03);  

    explicit_pendulum.draw(explicit_state_ctx, explicit_phase_ctx);
    implicit_pendulum.draw(implicit_state_ctx, implicit_phase_ctx);
    symplectic_pendulum.draw(symplectic_state_ctx, symplectic_phase_ctx);
  }, 10);
}

setup();
