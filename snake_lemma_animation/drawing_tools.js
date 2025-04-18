class Color {
  constructor(r,g,b,a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  color_string() {
    return("rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")") 
  }

  transparent_color_string(alpha) {
    return("rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + alpha + ")") 
  }
}

class Node {
  // Derivation is an optional parameter giving an explanation of why
  // our sequence is exact at this node 
  constructor(x, y, name, font_size, derivation) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.font_size = font_size;
    this.derivation = derivation;
  }

  render(canvas, context, color) {
    context.fillStyle = color;
    context.font = "italic " + Math.floor(this.font_size * canvas.width) + "px Serif";
    context.fillText(this.name, canvas.width * this.x, canvas.height * this.y);
  }

  width(canvas, context) {
    context.font = "italic " + Math.floor(this.font_size * canvas.width) + "px Serif";
    return(context.measureText(this.name).width / canvas.width);
  }

  height(canvas, context) {
    context.font = "italic " + Math.floor(this.font_size * canvas.width) + "px Serif";
    return(context.measureText('M').width / canvas.width);
  }

  contains_point(canvas, context, x, y) {
    let my_width = this.width(canvas, context);
    let my_height = this.height(canvas, context);
    return (Math.abs(x - this.x) <= 0.6 * my_width && Math.abs(y - this.y) <= 0.6 * my_height) 
  }

}

class Arrow {
  // Derivation is an optional parameter giving an explanation of where this arrow comes from
  constructor(from, to, name, derivation) {
    this.from = from;
    this.to = to;
    this.name = name; 
    this.derivation = derivation;
  }

  render(canvas, context, color, line_weight, font) {
    render_arrow(canvas, context, this.from, this.to, this.name, color, line_weight, font);
  }

  render_animation(canvas, context, time, color) {
    let angle = Math.atan2(this.to.y - this.from.y, this.to.x - this.from.x);

    let offset_from_x = this.from.x + 0.6 * this.from.width(canvas, context)  * Math.cos(angle);
    let offset_from_y = this.from.y + 0.6 * this.from.height(canvas, context) * Math.sin(angle);

    let offset_to_x = this.to.x - 0.6 * this.to.width(canvas, context)  * Math.cos(angle);
    let offset_to_y = this.to.y - 0.6 * this.to.height(canvas, context) * Math.sin(angle);


    let timescale = 100;
    let time_scaling = (time % timescale) / timescale;
    let pos_x = offset_from_x + time_scaling * (offset_to_x - offset_from_x);
    let pos_y = offset_from_y + time_scaling * (offset_to_y - offset_from_y);

    let r = 0.03 * canvas.height;
    if (time_scaling < 0.1) {
      r = 1 + (r-1) * 10 * time_scaling; 
    } else if (time_scaling > 0.9) {
      r = 1 + (r-1) * 10 * (1 - time_scaling); 
    }
    var grd = context.createRadialGradient(canvas.width * pos_x, canvas.height * pos_y,
        r/10, canvas.width * pos_x, canvas.height * pos_y, r);
    grd.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    grd.addColorStop(0.2, color);
    grd.addColorStop(1, "rgba(255, 255, 255, 0.0)");
    context.beginPath();
    context.fillStyle=grd;
    context.arc(canvas.width * pos_x, canvas.height * pos_y, r, 0, 2 * Math.PI);
    context.fill();
  }

  contains_point(x, y) {
    let my_center_x = 0.5 * (this.from.x + this.to.x);
    let my_center_y = 0.5 * (this.from.y + this.to.y);

    // Change to work in center-of-mass coordinates
    x -= my_center_x;
    y -= my_center_y;

    // To check if the point is on our vector, we take the component of the point parallel to the vector
    // the component perpendicular to our vector. If the parallel component is less than
    // half the vector length, and the perpendicular component is pretty small,
    // we say the point is on the vector

    let my_sq_length = (this.to.x - this.from.x)**2 + (this.to.y - this.from.y)**2;

    let dot_product = (this.to.x - this.from.x) * x + (this.to.y - this.from.y) * y;

    // Projection of the point <x,y> onto the vector (to - from)
    let parallel_projection_x = dot_product / my_sq_length * (this.to.x - this.from.x);
    let parallel_projection_y = dot_product / my_sq_length * (this.to.y - this.from.y);

    let perpendicular_projection_x = x - parallel_projection_x;
    let perpendicular_projection_y = y - parallel_projection_y;

    let parallel_sq_distance = (parallel_projection_x)**2 + (parallel_projection_y)**2;
    let perpendicular_sq_distance = (perpendicular_projection_x)**2 + (perpendicular_projection_y)**2;

    // Note on magic numbers: 0.0625 is 1/16 = (1/4)^2. my_sq_length is the squared length from the node 'from' to
    // the node 'to'. That's longer than the actual arrow, since the arrow has padding on the sides. So I just
    // made the arrow target take up half this space. Since we measure distances from the center of the arrow,
    // that means the constant should be (1/4)^2.
    // The second number is just made up. It seems to behave nicely. 
    return (parallel_sq_distance <= 0.0625 * my_sq_length && perpendicular_sq_distance <= 0.0015);
  }
}

class Path {
  // Represents a path going through the nodes "nodes". This path displays an animation of a point
  // traveling along the path. The list "labels" says what to label the point at each point
  // on its journey
  constructor(nodes, labels, color) {
    this.nodes = nodes; 
    this.labels = labels;
    this.color = color;
  }

  render(canvas, context, line_weight) {
    context.strokeStyle = this.color.transparent_color_string(0.3);
    context.lineWidth = Math.max(Math.floor(thick_line * canvas.width),1);
    context.beginPath();
    for (let i = 0; i < this.nodes.length; i++) {
      context.lineTo(canvas.width * this.nodes[i].x, canvas.height * this.nodes[i].y);
    }
    context.stroke();
  }

  render_animation(canvas, context, time, color, font_size) {
    let edge_time = 100;
    let timescale = edge_time * (this.nodes.length - 1);

    let index = Math.floor((time % timescale) / edge_time);
    let edge_time_scaling = (time % edge_time) / edge_time;
    let absolute_time_scaling = (time % timescale) / timescale;

    let pos_x = (1 - edge_time_scaling) * this.nodes[index].x + edge_time_scaling * this.nodes[index + 1].x;
    let pos_y = (1 - edge_time_scaling) * this.nodes[index].y + edge_time_scaling * this.nodes[index + 1].y;

    let angle = Math.atan2(this.nodes[index + 1].y - this.nodes[index].y, this.nodes[index + 1].x - this.nodes[index].x);
    context.font="italic " + Math.floor(this.font_size * canvas.width) + "px Serif";
    context.fillStyle = this.color.color_string();
    let label_width =  context.measureText(this.labels[index]).width / canvas.width;
    let label_height = context.measureText('M').width / canvas.width;
    let text_pos_x = pos_x + (0.5 * label_width + 0.75 * label_height)  * Math.cos(angle + Math.PI/2);
    let text_pos_y = pos_y + 1.25 * label_height * Math.sin(angle + Math.PI/2);
    context.fillText(this.labels[index], canvas.width * text_pos_x, canvas.height * text_pos_y);

    let r = 0.03 * canvas.height;
    if (absolute_time_scaling < 0.1) {
      r = 1 + (r-1) * 10 * absolute_time_scaling; 
    } else if (absolute_time_scaling > 0.9) {
      r = 1 + (r-1) * 10 * (1 - absolute_time_scaling); 
    }
    var grd = context.createRadialGradient(canvas.width * pos_x, canvas.height * pos_y,
        r/10, canvas.width * pos_x, canvas.height * pos_y, r);
    grd.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    grd.addColorStop(0.2, this.color.color_string());
    grd.addColorStop(1, "rgba(255, 255, 255, 0.0)");
    context.fillStyle=grd;
    context.beginPath();
    context.arc(canvas.width * pos_x, canvas.height * pos_y, r, 0, 2 * Math.PI);
    context.fill();
  }
}

// Represents the derivation of an arrow in the diagram. A Derivation consists of some paths in the
// diagram, and explanatory text
class Derivation {
  constructor(paths, text) {
    this.paths = paths;
    this.text = text; 
  }
}

function render_arrow(canvas, context, from, to, label, color, line_weight, font_size) {
  let angle = Math.atan2(to.y - from.y, to.x - from.x);

  let offset_from_x = from.x + 0.6 * from.width(canvas, context)  * Math.cos(angle);
  let offset_from_y = from.y + 0.6 * from.height(canvas, context) * Math.sin(angle);

  let offset_to_x = to.x - 0.6 * to.width(canvas, context)  * Math.cos(angle);
  let offset_to_y = to.y - 0.6 * to.height(canvas, context) * Math.sin(angle);

  context.beginPath();
  context.font =  "italic " + Math.floor(small_font * canvas.width) + "px Serif";
  context.lineWidth = Math.max(Math.floor(line_weight * canvas.width), 1);
  context.strokeStyle = color;
  context.fillStyle = color;
  context.moveTo(canvas.width * offset_from_x, canvas.height * offset_from_y);
  context.lineTo(canvas.width * offset_to_x,   canvas.height * offset_to_y);

  let radius = 0.015;

  // Put one endpoint of the arrowhead a bit offset from the arrow's endpoint
  let end_x = offset_to_x + Math.cos(angle + 2.5) * radius;
  let end_y = offset_to_y + Math.sin(angle + 2.5) * radius;
  context.moveTo(canvas.width * end_x, canvas.height * end_y);
  context.lineTo(canvas.width * offset_to_x, canvas.height * offset_to_y);
  end_x = offset_to_x + Math.cos(angle - 2.5) * radius;
  end_y = offset_to_y + Math.sin(angle - 2.5) * radius;
  context.lineTo(canvas.width * end_x, canvas.height * end_y);
  context.stroke();

  label_x = 0.5 * (from.x + to.x) + offset * Math.cos(angle - Math.PI/2);
  label_y = 0.5 * (from.y + to.y) + offset * Math.sin(angle - Math.PI/2);
  context.fillText(label, canvas.width * label_x, canvas.height * label_y);

}
function initialize() {
  // Register an event listener to
  // call the resizeCanvas() function each time
  // the window is resized.
  window.addEventListener('resize', resize_canvas, false);

  // Draw canvas border for the first time.
  resize_canvas();
}

function redraw() {
}

// Runs each time the DOM window resize event fires.
// Resets the canvas dimensions to match window,
// then draws the new borders accordingly.
function resize_canvas() {
  canvas.style.width='100%';

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.width;
  redraw();
}

// Returns the coordinates of a mouse event in canvas space
// https://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
function rel_mouse_coords(event, canvas){
    var total_offset_x = 0;
    var total_offset_y = 0;
    var canvas_x = 0;
    var canvas_y = 0;
    var current_element = canvas;

    do {
        total_offset_x += current_element.offsetLeft - current_element.scrollLeft;
        total_offset_y += current_element.offsetTop  - current_element.scrollTop;
    } while(current_element = current_element.offsetParent)

    canvas_x = event.pageX - total_offset_x;
    canvas_y = event.pageY - total_offset_y;

    return {x:canvas_x, y:canvas_y}
}
