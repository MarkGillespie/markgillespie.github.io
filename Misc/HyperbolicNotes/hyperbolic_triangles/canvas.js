class Canvas {
    constructor(canvas_name, scale=0.8) {
        this.canvas = document.getElementById(canvas_name);
        this.width  = this.canvas.width;
        this.height = this.canvas.height;
        this.ctx    = this.canvas.getContext("2d");
        this.scale  = scale;
    }

    to_x(x) {
        return 0.5 * this.width + x * 0.5 * this.scale * this.width;
    }

    to_y(y) {
        return 0.5 * this.height - y * 0.5 * this.scale * this.height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}

class PolyInput extends Canvas {
    constructor(canvas_name, update, n=3, lines=[]) {
        super(canvas_name);
        this.update = update;
        this.selected_point = null;
        this.lines = lines;
        let radius = unit_length / Math.sqrt(3);


        let angle = 2 * Math.PI / n;
        this.points = [];
        for (let i = 0; i < n; i++) {
            this.points.push(new ClickablePoint(150 - radius * Math.sin(i * angle), 150 - radius * Math.cos(i * angle)));
        }
        draw_grid(this);
        draw_poly(this, this.points, this.lines);
        this.points.forEach(p => p.draw(this));

        let poly = this;
        this.canvas.addEventListener('mousedown', function(e) {
            let mouse = get_mouse(e, poly.canvas);
            for (let i = 0; i < poly.points.length; i++) {
                if (poly.points[i].contains(mouse.x, mouse.y)) {
                    selected_point = poly.points[i];
                    return;
                }
            }
            selected_point = null;
        });
        this.canvas.addEventListener('mousemove', function(e) {
            if (selected_point !== null) {
                let mouse = get_mouse(e, poly.canvas);
                selected_point.move_to(mouse.x, mouse.y);
                poly.draw();
                poly.update(poly);
            }
        });
        this.canvas.addEventListener('mouseup', function(e) {
            selected_point = null;
        });
        // Set up touch events for mobile, etc
        this.canvas.addEventListener("touchstart", function (e) {
          var touch = e.touches[0];
          var mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
          });
          poly.canvas.dispatchEvent(mouseEvent);
        }, false);
        this.canvas.addEventListener("touchend", function (e) {
          var mouseEvent = new MouseEvent("mouseup", {});
          poly.canvas.dispatchEvent(mouseEvent);
        }, false);
        this.canvas.addEventListener("touchmove", function (e) {
          var touch = e.touches[0];
          var mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
          });
          poly.canvas.dispatchEvent(mouseEvent);
        }, false);
    }
    
    draw() {
        this.clear();
        draw_grid(this);
        draw_poly(this, this.points, this.lines);
        this.points.forEach(p => p.draw(this));
    
    }
}
// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY - rect.top
    };
}

function draw_grid(canvas) {
    canvas.ctx.fillStyle = "#f2f4ef";
    canvas.ctx.fillRect(0, 0, canvas.width, canvas.height);

    canvas.ctx.strokeStyle = "#de3d8366";
    canvas.ctx.lineWidth = 1;
    canvas.ctx.setLineDash([10, 4]);

    let n_cols = 6;
    for (let i = 1; i < n_cols; i++) {
         canvas.ctx.moveTo(0, i * canvas.height / n_cols);
         canvas.ctx.lineTo(canvas.width, i * canvas.height / n_cols);

         canvas.ctx.moveTo(i * canvas.width / n_cols, 0);
         canvas.ctx.lineTo(i * canvas.width / n_cols, canvas.height);
    }
    canvas.ctx.stroke();
    canvas.ctx.setLineDash([]);
}

function get_mouse(e, canvas) {
    var element = canvas, offsetX = 0, offsetY = 0, mx, my;

    // Compute the total offset
    if (element.offsetParent !== undefined) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }

    // Add padding and border style widths to offset
    // Also add the offsets in case there's a position:fixed bar
    //offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
    //offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

    mx = e.pageX - offsetX;
    my = e.pageY - offsetY;

    // We return a simple javascript object (a hash) with x and y defined
    return {x: mx, y: my};
}

// Draws a polygon given by points. Adds lines between any pairs of indices
// stored in lines
function draw_poly(canvas, points, lines=[]) {
    canvas.ctx.beginPath();
    canvas.ctx.fillStyle = "#ffa1ce";
    canvas.ctx.strokeStyle = "#ff2f92";
    canvas.ctx.lineWidth = 3;
    canvas.lineJoin = "round";

    canvas.ctx.moveTo(points[0].canvas_x, points[0].canvas_y);
    for (let i = points.length-1; i >= 0; i--) {
        canvas.ctx.lineTo(points[i].canvas_x, points[i].canvas_y);
    }
    canvas.ctx.fill();
    canvas.ctx.stroke();

    canvas.ctx.beginPath();
    for (let i = 0; i < lines.length; i++) {
        let a = lines[i][0];
        let b = lines[i][1];
        canvas.ctx.moveTo(points[a].canvas_x, points[a].canvas_y);
        canvas.ctx.lineTo(points[b].canvas_x, points[b].canvas_y);
    }
    canvas.ctx.stroke();
}

class ColorPair {
    constructor(h, s, l) {
        this.light = "hsl(" + h + ", " + (s * 0.8) + "%, " + clamp(l * 1.2, 0, 100) + "%)";
        this.dark  = "hsl(" + h + ", " + clamp(s * 1.2, 0, 100) + "%, " + l * 0.8 + "%)";
    }
}

function random_color_pair() {
    let h = Math.random() * 160 + 80;
    let s = Math.random() * 20 + 30;
    let l = Math.random() * 30 + 40;
    return new ColorPair(h, s, l);
}

function clamp(num, min, max) {
    if (num < min) {
        return min;
    } else if (num > max) {
        return max;
    } else {
        return num;
    }
}
