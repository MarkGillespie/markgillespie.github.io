class Canvas {
    constructor(canvas_name) {
        this.canvas = document.getElementById(canvas_name);
        this.width  = this.canvas.width;
        this.height = this.canvas.height;
        this.coord_width = this.width;
        this.coord_height = this.height;
        this.ctx    = this.canvas.getContext("2d");
        this.accent = "#de3d8366";
        this.accent_dark = "#de3d83bb";

        this.accent_alt = "#e4bd0b66";
        this.accent_alt_dark = "#e4bd0b";
    }

    // set canvas dimensions to be -1 to 1
    standardize(w, h) {
        this.coord_width = w;
        this.coord_height = h;
        this.ctx.setTransform(this.width/2, 0, 0, -this.height/2, this.width/2, this.height/2)
        this.ctx.transform(1/w, 0, 0, 1/h, 0, 0)
    }

    grid() {
        this.ctx.beginPath();
        this.ctx.fillStyle = "#f2f4ef";
        this.ctx.rect(-this.coord_width, -this.coord_height, 2*this.coord_width, 2*this.coord_height);
        this.ctx.fill();

        this.ctx.strokeStyle = this.accent;
        this.ctx.lineWidth = 0.01;

        let n_cols = 6;
        for (let i = -n_cols/2; i < n_cols/2; i++) {
             this.ctx.moveTo(-this.coord_width, 2 * i * this.coord_height / n_cols);
             this.ctx.lineTo( this.coord_width, 2 * i * this.coord_height / n_cols);

             this.ctx.moveTo(2 * i * this.coord_width / n_cols, -this.coord_height);
             this.ctx.lineTo(2 * i * this.coord_width / n_cols,  this.coord_height);
        }
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.lineWidth = 0.03;
        this.ctx.moveTo(-this.coord_width, 0);
        this.ctx.lineTo( this.coord_width, 0);

        this.ctx.moveTo(0, -this.coord_height);
        this.ctx.lineTo(0,  this.coord_height);
        this.ctx.stroke();
    }

    to_x(x) {
        return 0.5 * this.width + x * 0.4 * this.width;
    }

    to_y(y) {
        return 0.5 * this.height - y * 0.4 * this.height;
    }

    clear() {
        this.ctx.clearRect(-this.width, -this.width, 2 * this.width, 2 * this.height);
    }
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

function random_color_pair() {
    let h = Math.random() * 160 + 80;
    let s = Math.random() * 20 + 30;
    let l = Math.random() * 30 + 40;
    return new ColorPair(h, s, l);
}

function random_color_pairs(n) {
    let h = Math.random() * 160 + 80;
    let s = Math.random() * 20 + 30;
    let l = Math.random() * 15 + 40;
    color_pairs = [];
    step = 50;
    for (let i = 0; i < n; i++) {
        color_pairs.push(new ColorPair((h + i * step) % 360, s, l));
    }
    return color_pairs;
}

function random_color() {
    let h = Math.random() * 160 + 80;
    let s = Math.random() * 20 + 30;
    let l = Math.random() * 30 + 40;
    return "hsl(" + h + ", " + s + "%, " + l + "%)";
}
