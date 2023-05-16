let canvas_width = 0;
let canvas_height = 0;
let screen_scale = 0;
let prev = null;
let ctx, tri1, tri2;

function clamp(num, min, max) {
    if (num < min) {
        return min;
    } else if (num > max) {
        return max; 
    } else {
        return num;
    }
}

class ColorPair {
    constructor(h, s, l) {
        this.h = h;
        this.s = s;
        this.l = l;
    }

    light() {
        return "hsl(" + this.h + ", " + (this.s * 0.8) + "%, " + clamp(this.l * 1.2, 0, 100) + "%)";
    }
    dark() {
        return "hsl(" + this.h + ", " + clamp(this.s * 1.2, 0, 100) + "%, " + this.l * 0.8 + "%)";
    }
}

function randomColorPair() {
    let h = Math.random() * 160 + 80;
    let s = Math.random() * 20 + 30;
    let l = Math.random() * 30 + 40;
    return new ColorPair(h, s, l);
}

function screen_x(x) {
    return 0.5 * canvas_width + screen_scale * x;
}

function screen_y(y) {
     return 0.5 * canvas_height - screen_scale * y;
}

class CirclePoint {
    constructor(theta) {
        this.theta = theta;
    }

    x() {
        return Math.cos(this.theta); 
    }

    y() {
        return Math.sin(this.theta); 
    }

    dst_to(p) {
        let dx = this.x() - p.x();
        let dy = this.y() - p.y();
        return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    }
}

class CircleTriangle {
    constructor(v1, v2, v3) {
        this.v1 = v1; 
        this.v2 = v2; 
        this.v3 = v3;

        this.dir = "+";

        this.color_pair = randomColorPair();
    }

    draw(ctx) {
        ctx.fillStyle   = this.color_pair.light();
        ctx.strokeStyle = this.color_pair.dark();
        ctx.lineWidth = 5;
        ctx.lineJoin = "round";
        ctx.beginPath(); 
        ctx.moveTo(screen_x(this.v1.x()), screen_y(this.v1.y()));
        ctx.lineTo(screen_x(this.v2.x()), screen_y(this.v2.y()));
        ctx.lineTo(screen_x(this.v3.x()), screen_y(this.v3.y()));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    move_v3(step) {
        if (this.dir == "+") {
            this.v3.theta += step;
            if (this.v3.theta > this.v2.theta) {
                this.v3.theta -= 2 * step; 
                this.dir = "-";
            }
        } else if (this.dir == "-") {
            this.v3.theta -= step;
            if (this.v3.theta < this.v1.theta) {
                this.v3.theta += 2 * step; 
                this.dir = "+";
            }
        } 
    }
}

// Cross ratio of triangles s, t which share their first two vertices
function cross_ratio(s, t) {
    let a = t.v1.dst_to(t.v3);
    let b = t.v3.dst_to(t.v2);
    let c = s.v2.dst_to(s.v3);
    let d = s.v3.dst_to(s.v1);

    return a * c / (b * d);
}

function rounded_cross_ratio(s, t) {
    let cr = cross_ratio(s,t);
    return cr.toFixed(2);
}

function step(timestamp) {
    if (!prev) prev = timestamp;

    let dt = timestamp - prev;
    prev = timestamp;
    ctx.clearRect(0, 0, canvas_width, canvas_height);

    let cr = cross_ratio(tri1, tri2);
    tri2.move_v3(0.0005 * dt);


    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(screen_x(0), screen_y(0), screen_scale, 0, 2 * Math.PI, false);
    ctx.stroke();

    tri1.draw(ctx);
    tri2.draw(ctx);

    document.getElementById("cr").innerHTML = rounded_cross_ratio(tri1, tri2);

    window.requestAnimationFrame(step);
}

// Assumes both canvases are the same size
function setup() {
    let canvas = document.getElementById("cross_ratio");
    ctx = canvas.getContext("2d");
    canvas_width  = canvas.width;
    canvas_height = canvas.height;
    screen_scale  = canvas_width * 0.4;

    let p1  = new CirclePoint(0);
    let p2  = new CirclePoint(2.5);
    let p3  = new CirclePoint(4);
    let p4  = new CirclePoint(1);
    tri1 = new CircleTriangle(p1, p2, p3);
    tri2 = new CircleTriangle(p1, p2, p4);

    window.requestAnimationFrame(step);
}

//setup();
