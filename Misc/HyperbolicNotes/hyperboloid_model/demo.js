let img = new Image();
let boost_img_loaded = false;
img.src = 'cat.jpg';
let boost_img_canvas = document.createElement('canvas');
boost_img_canvas.width = 585;
boost_img_canvas.height = 585;
let boost_img_ctx = boost_img_canvas.getContext('2d');
let boost_img_pixel_data;

function draw_hyperboloid(canvas) {
    // Asymptotes
    canvas.ctx.beginPath();
    canvas.ctx.strokeStyle = canvas.accent;
    canvas.ctx.lineWidth = 0.02;
    canvas.ctx.setLineDash([0.1, 0.05]);
    canvas.ctx.moveTo(-2, 2);
    canvas.ctx.lineTo(2, -2);
    canvas.ctx.moveTo(-2, -2);
    canvas.ctx.lineTo(2, 2);
    canvas.ctx.stroke();
    canvas.ctx.setLineDash([]);

    // Hyperboloid
    canvas.ctx.beginPath();
    canvas.ctx.lineWidth = 0.01;
    canvas.ctx.strokeStyle = "black";
    let res = 20.0;
    canvas.ctx.moveTo(Math.sinh(-2), Math.cosh(-2));
    for (let i = -2 * res; i < 2 * res; i++) {
        let t = i/res;
        let x = Math.sinh(t);
        let y = Math.cosh(t);
        canvas.ctx.lineTo(x, y);
    }
    canvas.ctx.moveTo(Math.sinh(-2), -Math.cosh(-2));
    for (let i = -2 * res; i < 2 * res; i++) {
        let t = i/res;
        let x = Math.sinh(t);
        let y = -Math.cosh(t);
        canvas.ctx.lineTo(x, y);
    }
    canvas.ctx.stroke();
}

function draw_decorated_ideal_vertex_demo(canvas, length) {
    document.getElementById("decorated_ideal_vertex_length").innerHTML = length.toFixed(2);
    canvas.clear();
    canvas.grid();

    draw_hyperboloid(canvas);

    let vx = -length;
    let vt = length;

    let wx = 1/(2 * length);
    let wt = 1/(2 * length);

    // Arrow
    canvas.ctx.beginPath();
    canvas.ctx.strokeStyle = canvas.accent_dark;
    canvas.ctx.lineWidth = 0.05;
    canvas.ctx.lineJoin = "round";
    canvas.ctx.moveTo(0, 0);
    canvas.ctx.lineTo(vx, vt);
    canvas.ctx.lineTo(vx, vt - 0.1);
    canvas.ctx.lineTo(vx, vt);
    canvas.ctx.lineTo(vx + 0.1, vt);
    canvas.ctx.stroke();

    // Complementary arrow
    canvas.ctx.beginPath();
    canvas.ctx.strokeStyle = canvas.accent_alt_dark;
    canvas.ctx.lineWidth = 0.05;
    canvas.ctx.lineJoin = "round";
    canvas.ctx.moveTo(0, 0);
    canvas.ctx.lineTo(wx, wt);
    canvas.ctx.lineTo(wx, wt - 0.1);
    canvas.ctx.lineTo(wx, wt);
    canvas.ctx.lineTo(wx - 0.1, wt);
    canvas.ctx.stroke();

    // Plane
    let start_s = (-2 - wx)/vx;
    let start_t = wt + start_s * vt;
    let start_x = wx + start_s * vx;
    let end_s = (2 - wx)/vx;
    let end_t = wt + end_s * vt;
    let end_x = wx + end_s * vx;
    canvas.ctx.beginPath();
    canvas.ctx.strokeStyle = canvas.alt_accent_dark;
    canvas.ctx.lineWidth = 0.05;
    canvas.ctx.moveTo(start_x, start_t);
    canvas.ctx.lineTo(end_x, end_t);
    canvas.ctx.stroke();
}

function draw_boost_plane_demo(canvas, s) {
    s = 4 * s - 2;
    document.getElementById("boost_plane_s").innerHTML = s.toFixed(2);
    canvas.clear();
    canvas.grid();

    let ch = Math.cosh(s);
    let sh = Math.sinh(s);

    let ax = 0.5;
    let at = Math.sqrt(ax * ax + 1);

    let bx = -0.5;
    let bt = Math.sqrt(bx * bx + 1);

    let atp =  ch * at + sh * ax;
    let axp = +sh * at + ch * ax;

    let btp =  ch * bt + sh * bx;
    let bxp = +sh * bt + ch * bx;

    let start_s = (-2 - bxp) / (axp - bxp);
    let start_t = start_s * atp + (1-start_s) * btp;
    let start_x = start_s * axp + (1-start_s) * bxp;
    let end_s = (2 - bxp) / (axp - bxp);
    let end_t = end_s * atp + (1-end_s) * btp;
    let end_x = end_s * axp + (1-end_s) * bxp;
    canvas.ctx.beginPath();
    canvas.ctx.strokeStyle = canvas.accent_dark;
    canvas.ctx.lineWidth = 0.05;
    canvas.ctx.moveTo(start_x, start_t);
    canvas.ctx.lineTo(end_x, end_t);
    canvas.ctx.stroke();

    canvas.ctx.beginPath();
    canvas.ctx.fillStyle = "black";
    canvas.ctx.arc(axp, atp, 0.05, 0, 2 * Math.PI);
    canvas.ctx.arc(bxp, btp, 0.05, 0, 2 * Math.PI);
    canvas.ctx.fill();

    draw_hyperboloid(canvas);
}

function draw_hyperbola_demo(canvas, s) {
    s = 4 * s - 2;
    document.getElementById("hyperbola_s").innerHTML = s.toFixed(2);
    canvas.clear();
    canvas.grid();

    canvas.ctx.beginPath();
    canvas.ctx.fillStyle = "black";
    canvas.ctx.arc(Math.sinh(s), Math.cosh(s), 0.05, 0, 2 * Math.PI);
    canvas.ctx.fill();

    draw_hyperboloid(canvas);
}

function true_mod(x, n) {
    return (x%n+n)%n;
}

function draw_boost_demo(canvas, s, mix = 0.9) {
    if (!boost_img_loaded) {
        return;
    }
    s = 4 * s - 2;
    document.getElementById("boost_s").innerHTML = s.toFixed(2);
    let ch = Math.cosh(s);
    let sh = Math.sinh(s);
    let old_pixel_data = canvas.ctx.getImageData(0, 0, canvas.width, canvas.height);
    let new_pixel_data = canvas.ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (let j = 0; j < canvas.height; j++) {
        for (let i = 0; i < canvas.width; i++) {
            let linear_index = 4 * (i + j * canvas.width);
            let x = i - canvas.width/2;
            let t = canvas.height/2 - j;

            let tp =  ch * t - sh * x;
            let xp = -sh * t + ch * x;

            let normalized_xp = 0.5 * xp / canvas.width + 0.5;
            let normalized_tp = 0.5 - 0.5 * tp / canvas.height;

            let im_x = true_mod(Math.floor(normalized_xp * boost_img_canvas.width), boost_img_canvas.width);
            let im_y = true_mod(Math.floor(normalized_tp * boost_img_canvas.height), boost_img_canvas.height);

            let im_linear_index = 4 * (im_x + im_y * boost_img_canvas.width);
            for (let offset = 0; offset < 3; offset++) {
                new_pixel_data.data[linear_index + offset] = mix * old_pixel_data.data[linear_index + offset] + (1-mix) * boost_img_pixel_data.data[im_linear_index + offset];
            }
            new_pixel_data.data[linear_index+3] = 225;
        }
    }
    canvas.ctx.putImageData(new_pixel_data, 0, 0);

    canvas.ctx.beginPath();
    canvas.ctx.strokeStyle = "black";
    canvas.ctx.lineWidth = 2;
    canvas.ctx.setLineDash([1, 5]);
    canvas.ctx.moveTo(0, 0);
    canvas.ctx.lineTo(canvas.width, canvas.height);
    canvas.ctx.moveTo(0, canvas.height);
    canvas.ctx.lineTo(canvas.width, 0);
    canvas.ctx.stroke();
    canvas.ctx.setLineDash([]);
}

function setup() {
    /****************************************
    *                Hyperbola              *
    *****************************************/
    let hyperbola_canvas = new Canvas("hyperbola_canvas", 2/2.1);
    hyperbola_canvas.standardize(2, 2);
    let hyperbola_slider = document.getElementById("hyperbola_time_slider");
    let hyperbola = hyperbola_slider.value / 1000;
    hyperbola_slider.oninput = function() {
        hyperbola = hyperbola_slider.value / 1000;
        draw_hyperbola_demo(hyperbola_canvas, hyperbola);
    }
    draw_hyperbola_demo(hyperbola_canvas, hyperbola);

    /****************************************
    *                  Boost                *
    *****************************************/
    let boost_canvas = new Canvas("boost_canvas", 2/2.1);
    let boost_slider = document.getElementById("boost_angle_slider");
    let boost = boost_slider.value / 1000;
    boost_slider.oninput = function() {
        boost = boost_slider.value / 1000;
        draw_boost_demo(boost_canvas, boost);
    }
    img.onload = function() {
        boost_img_ctx.drawImage(img, 0, 0);
        img.style.display = 'none';
        boost_img_loaded = true;
        boost_img_pixel_data = boost_img_ctx.getImageData(0, 0, boost_img_canvas.width, boost_img_canvas.height);
        draw_boost_demo(boost_canvas, boost, 0);
    }

    /****************************************
    *             Boost Plane               *
    *****************************************/
    let boost_plane_canvas = new Canvas("boost_plane_canvas", 2/2.1);
    boost_plane_canvas.standardize(2, 2);
    let boost_plane_slider = document.getElementById("boost_plane_angle_slider");
    let boost_plane = boost_plane_slider.value / 1000;
    boost_plane_slider.oninput = function() {
        boost_plane = boost_plane_slider.value / 1000;
        draw_boost_plane_demo(boost_plane_canvas, boost_plane);
    }
    draw_boost_plane_demo(boost_plane_canvas, boost_plane);

    /****************************************
    *        Decorated Ideal Vertex         *
    *****************************************/
    let decorated_ideal_vertex_canvas = new Canvas("decorated_ideal_vertex_canvas", 2/2.1);
    decorated_ideal_vertex_canvas.standardize(2, 2);
    let decorated_ideal_vertex_slider = document.getElementById("decorated_ideal_vertex_slider");
    let decorated_ideal_vertex = decorated_ideal_vertex_slider.value / 500 + 0.2;
    decorated_ideal_vertex_slider.oninput = function() {
        decorated_ideal_vertex = decorated_ideal_vertex_slider.value / 500 + 0.2;
        draw_decorated_ideal_vertex_demo(decorated_ideal_vertex_canvas, decorated_ideal_vertex);
    }
    draw_decorated_ideal_vertex_demo(decorated_ideal_vertex_canvas, decorated_ideal_vertex);
}

setup();
