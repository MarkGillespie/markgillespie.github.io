class DecoratedHyperbolicTriangle {
    constructor(l1, l2, l3, standardize=true) {
        if (l1 > l2 + l3 || l2 > l1 + l3 || l3 > l1 + l2) {
            console.trace();
            throw "Side lengths violate the triangle inequality" 
        }

        this.color = "#efe";
        this.stroke = "#333";
        this.ray_color = "#0b3";
        this.horocycle_color = "#7a8";
        this.horocycle_width = 3;
        this.infinity_line = "#bbb";

        this.standardize = standardize;
        if (this.standardize) {
            this.circular_a = Point.from_polar(1, Math.PI/2);
            this.circular_b = Point.from_polar(1, Math.PI/2 + 2 * Math.PI / 3);
            this.circular_c = Point.from_polar(1, Math.PI/2 - 2 * Math.PI / 3);
        } else {
            // Normalize to fit in unit circle
            let s = (l1 + l2 + l3)/2; //semiperimeter
            let area = Math.sqrt(s * (s-l1) * (s-l2) * (s-l3)); // Heron's formula
            let circumradius = l1 * l2 * l3 / (4 * area);
            
            let inscribed_l1 = l1 / circumradius;
            let inscribed_l2 = l2 / circumradius;
            let inscribed_l3 = l3 / circumradius;

            let l1sq = inscribed_l1 * inscribed_l1;
            let l2sq = inscribed_l2 * inscribed_l2;
            let l3sq = inscribed_l3 * inscribed_l3;

            // Vertex positions inscribed in unit circle
            this.circular_a = new Point(0, 1);
            let b_cos = 1 - 0.5 * l2sq;
            let c_cos = 1 - 0.5 * l3sq;
            this.circular_b = new Point(Math.sqrt(1 - b_cos * b_cos), b_cos);
            let left_c  = new Point(-Math.sqrt(1 - c_cos * c_cos), c_cos);
            let right_c = new Point( Math.sqrt(1 - c_cos * c_cos), c_cos);

            let left_dst_err  = Math.abs(this.circular_b.dst_to(left_c)  - inscribed_l1);
            let right_dst_err = Math.abs(this.circular_b.dst_to(right_c) - inscribed_l1);
            if (left_dst_err < right_dst_err) {
                this.circular_c = left_c; 
            } else {
                this.circular_c = right_c; 
            }
        }

        this.lambda1 = 2 * Math.log(l1);
        this.lambda2 = 2 * Math.log(l2);
        this.lambda3 = 2 * Math.log(l3);

        this.scale_denom  = 2.1;
        this.offset_denom = 2;
    } 

    static from_points(p1, p2, p3, standardize=true) {
        let l1 = p2.dst_to(p3) / unit_length;
        let l2 = p1.dst_to(p3) / unit_length;
        let l3 = p1.dst_to(p2) / unit_length;

        return new DecoratedHyperbolicTriangle(l1, l2, l3, standardize);
    }

    draw_halfspace_triangle(canvas) {
        let halfspace_b, halfspace_c, scale, offset_x, offset_y; 
        if (this.standardize) {
            halfspace_b = new Point(-1, 0);
            halfspace_c = new Point(1, 0);

            scale    = canvas.width/5;
            offset_x = canvas.width/2;
            offset_y = canvas.height-3;
        } else {
            halfspace_b = klein_to_halfspace(this.circular_b.x, this.circular_b.y);
            halfspace_c = klein_to_halfspace(this.circular_c.x, this.circular_c.y);

            scale    = canvas.width/5;
            offset_x = canvas.width/2;
            offset_y = canvas.height-3;
        }

        canvas.ctx.strokeStyle = this.stroke;
        canvas.ctx.lineWidth = 2;
        canvas.ctx.fillStyle = this.color;

        // Halfspace Triangle
        canvas.ctx.beginPath();
        canvas.ctx.moveTo(offset_x + scale * halfspace_b.x, offset_y);
        canvas.ctx.lineTo(offset_x + scale * halfspace_b.x, -5);
        canvas.ctx.lineTo(offset_x + scale * halfspace_c.x, -5);
        canvas.ctx.lineTo(offset_x + scale * halfspace_c.x, offset_y);
        canvas.ctx.fill();
        canvas.ctx.stroke();

        let r = 0.5 * Math.abs(halfspace_b.x - halfspace_c.x);
        let cx = 0.5 * (halfspace_b.x + halfspace_c.x);
        canvas.ctx.fillStyle = "white";
        canvas.ctx.beginPath();
        canvas.ctx.arc(offset_x + scale * cx, offset_y, scale * r, 0, 2 * Math.PI);
        canvas.ctx.fill();
        canvas.ctx.stroke();


        canvas.ctx.strokeStyle = this.infinity_line;
        canvas.ctx.lineWidth = 3;

        canvas.ctx.beginPath();
        canvas.ctx.moveTo(0, offset_y);
        canvas.ctx.lineTo(canvas.width, offset_y);
        canvas.ctx.stroke();

    }

    draw_klein_triangle(canvas) {
        let scale  = canvas.width / this.scale_denom;
        let offset = canvas.width / this.offset_denom;
    
        canvas.ctx.strokeStyle = this.infinity_line;
        canvas.ctx.lineWidth = 3;

        canvas.ctx.beginPath();
        canvas.ctx.arc(offset + scale * 0, offset - scale * 0, scale * 1, 0, 2 * Math.PI);
        canvas.ctx.stroke();

        canvas.ctx.strokeStyle = this.stroke;
        canvas.ctx.lineWidth = 2;
        canvas.ctx.fillStyle = this.color;

       
        let a = this.circular_a;
        let b = this.circular_b;
        let c = this.circular_c;

        // Klein Triangle
        canvas.ctx.beginPath();
        canvas.ctx.moveTo(offset + scale * a.x, offset - scale * a.y);
        canvas.ctx.lineTo(offset + scale * b.x, offset - scale * b.y);
        canvas.ctx.lineTo(offset + scale * c.x, offset - scale * c.y);
        canvas.ctx.lineTo(offset + scale * a.x, offset - scale * a.y);
        canvas.ctx.fill();
        canvas.ctx.stroke();
    }

    draw_poincare_triangle(canvas) {
        let scale  = canvas.width / this.scale_denom;
        let offset = canvas.width / this.offset_denom;
    
        canvas.ctx.strokeStyle = this.infinity_line;
        canvas.ctx.lineWidth = 3;

        canvas.ctx.beginPath();
        canvas.ctx.arc(offset + scale * 0, offset - scale * 0, scale * 1, 0, 2 * Math.PI);
        canvas.ctx.stroke();

        canvas.ctx.strokeStyle = this.stroke;
        canvas.ctx.lineWidth = 2;
        canvas.ctx.fillStyle = this.color;

        // Poincare Triangle
        let len = 30;
        canvas.ctx.beginPath();
        poincare_ideal_line_lineTos(canvas, this.circular_a, this.circular_b, len, true);
        poincare_ideal_line_lineTos(canvas, this.circular_b, this.circular_c, len, false);
        poincare_ideal_line_lineTos(canvas, this.circular_c, this.circular_a, len, false);
        canvas.ctx.fill();
        canvas.ctx.stroke();
    }

    draw_halfspace_horocycles(canvas) {
        let scale, offset_x, offset_y; 
        if (this.standardize) {
            scale    = canvas.width/5;
            offset_x = canvas.width/2;
            offset_y = canvas.height-3;
        } else {
            scale    = canvas.width/5;
            offset_x = canvas.width/2;
            offset_y = canvas.height-3;
        }

        let hp = this.compute_halfspace_horocycle_positions();
        canvas.ctx.beginPath();
        canvas.ctx.strokeStyle = this.horocycle_color;
        canvas.ctx.lineWidth = this.horocycle_width;
        canvas.ctx.moveTo(0, offset_y - scale * hp.h);
        canvas.ctx.lineTo(canvas.width, offset_y - scale * hp.h);
        canvas.ctx.stroke();
        canvas.ctx.beginPath();
        canvas.ctx.arc(offset_x + scale * hp.b.x, offset_y - scale * hp.rb, scale * hp.rb, 0, 2 * Math.PI);
        canvas.ctx.stroke();
        canvas.ctx.beginPath();
        canvas.ctx.arc(offset_x + scale * hp.c.x, offset_y - scale * hp.rc, scale * hp.rc, 0, 2 * Math.PI);
        canvas.ctx.stroke();
    }

    draw_halfspace_vertex_ray(canvas, s) {
        let scale, offset_x, offset_y; 
        if (this.standardize) {
            scale    = canvas.width/5;
            offset_x = canvas.width/2;
            offset_y = canvas.height-3;
        } else {
            scale    = canvas.width/5;
            offset_x = canvas.width/2;
            offset_y = canvas.height-3;
        }

        let ray = this.compute_halfspace_ray_positions(s);

        canvas.ctx.strokeStyle = this.ray_color;
        canvas.ctx.lineWidth = this.horocycle_width;
        canvas.ctx.beginPath();
        canvas.ctx.moveTo(offset_x + scale * ray.x, 0);
        canvas.ctx.lineTo(offset_x + scale * ray.x, offset_y - scale * ray.y);
        canvas.ctx.stroke();
    }

    draw_klein_vertex_ray(canvas, s) {
        let scale  = canvas.width / this.scale_denom;
        let offset = canvas.width / this.offset_denom;
        let halfspace_ray = this.compute_halfspace_ray_positions(s);

        let klein_ray = halfspace_to_klein(halfspace_ray.x, halfspace_ray.y);

        canvas.ctx.strokeStyle = this.ray_color;
        canvas.ctx.lineWidth = this.horocycle_width;
        canvas.ctx.beginPath();
        canvas.ctx.moveTo(offset + scale * this.circular_a.x, offset - scale * this.circular_a.y);
        canvas.ctx.lineTo(offset + scale * klein_ray.x, offset - scale * klein_ray.y);
        canvas.ctx.stroke();
    }

    klein_ray_endpoint_barycentric_coordinate(s) {
        let halfspace_ray = this.compute_halfspace_ray_positions(s);

        let klein_ray = halfspace_to_klein(halfspace_ray.x, halfspace_ray.y);
        return barycentric_coordinate(klein_ray, this.circular_b, this.circular_c);  
    }

    klein_ray_angle(s) {
        let halfspace_ray = this.compute_halfspace_ray_positions(s);

        let klein_ray = halfspace_to_klein(halfspace_ray.x, halfspace_ray.y);

        return Math.abs((this.circular_a.angle_to(klein_ray) - this.circular_a.angle_to(this.circular_c)));
    }

    compute_halfspace_ray_positions(s) {
        let hp = this.compute_halfspace_horocycle_positions();
        let ray_x = hp.b.x + s * (hp.c.x - hp.b.x);
        let ray_y = 0.5 * Math.abs(hp.c.x - hp.b.x) * Math.sqrt(1 - Math.pow(2*s-1, 2));
        return {x: ray_x, y: ray_y}; 
    }

    compute_halfspace_horocycle_positions() {
        let halfspace_b, halfspace_c;
        if (this.standardize) {
            halfspace_b = new Point(-1, 0);
            halfspace_c = new Point( 1, 0);
        } else {
            halfspace_b = klein_to_halfspace(this.circular_b.x, this.circular_b.y);
            halfspace_c = klein_to_halfspace(this.circular_c.x, this.circular_c.y);
        }
        let width = Math.abs(halfspace_b.x - halfspace_c.x);

        let h = width * Math.exp(-0.5 * (this.lambda1 - this.lambda2 - this.lambda3)); 
        let rb = 0.5 * h * Math.exp(-this.lambda3);
        let rc = 0.5 * h * Math.exp(-this.lambda2);

        return {h: h, b: halfspace_b, c: halfspace_c, rb: rb, rc: rc};
    }

    compute_poincare_horocycle_sizes() {
        let radius = 1 / (1 + 2 / Math.sqrt(3));
        let ua = 0.5 * (-this.lambda1 + this.lambda2 + this.lambda3);
        let ub = 0.5 * ( this.lambda1 - this.lambda2 + this.lambda3);
        let uc = 0.5 * ( this.lambda1 + this.lambda2 - this.lambda3);

        let delta_ra = 0.5 * Math.pow(1-Math.pow(1-radius, 2), 2) * (-ua);
        let delta_rb = 0.5 * Math.pow(1-Math.pow(1-radius, 2), 2) * (-ub);
        let delta_rc = 0.5 * Math.pow(1-Math.pow(1-radius, 2), 2) * (-uc);
        return {a: radius + delta_ra, b: radius + delta_rb, c: radius + delta_rc};
    }

    draw_poincare_horocycles(canvas) {
        let radii = this.compute_poincare_horocycle_sizes();
        this.poincare_horocycle(canvas, this.circular_a.angle(), radii.a);
        this.poincare_horocycle(canvas, this.circular_b.angle(), radii.b);
        this.poincare_horocycle(canvas, this.circular_c.angle(), radii.c);
         
    }

    draw_klein_horocycles(canvas) {
        let radii = this.compute_poincare_horocycle_sizes();
        this.klein_horocycle(canvas, this.circular_a.angle(), radii.a, 50);
        this.klein_horocycle(canvas, this.circular_b.angle(), radii.b, 50);
        this.klein_horocycle(canvas, this.circular_c.angle(), radii.c, 50);
    }

    poincare_horocycle(canvas, theta, euclidean_radius) {
        let scale  = canvas.width / 2.1;
        let offset = canvas.width / 2;

        let cx = Math.cos(theta) * (1 - euclidean_radius);
        let cy = Math.sin(theta) * (1 - euclidean_radius);

        canvas.ctx.beginPath();
        canvas.ctx.strokeStyle = this.horocycle_color;
        canvas.ctx.lineWidth = this.horocycle_width;
        canvas.ctx.arc(offset + scale * cx, offset - scale * cy, scale * euclidean_radius, 0, 2 * Math.PI);
        canvas.ctx.stroke();
    }

    klein_horocycle(canvas, theta, euclidean_radius, len) {
        let scale  = canvas.width / 2.1;
        let offset = canvas.width / 2;

        let cx = Math.cos(theta) * (1 - euclidean_radius);
        let cy = Math.sin(theta) * (1 - euclidean_radius);
        let first_point = poincare_to_klein(cx + euclidean_radius, cy);
        canvas.ctx.moveTo(offset + scale * first_point.x, offset - scale * first_point.y);

        canvas.ctx.beginPath();
        canvas.ctx.strokeStyle = this.horocycle_color;
        canvas.ctx.lineWidth = this.horocycle_width;
        for (let i = 1; i <= len + 1; i++) {
            let s = (i / len) * 2 * Math.PI; 
            let x = cx + euclidean_radius * Math.cos(s);
            let y = cy + euclidean_radius * Math.sin(s);
            let klein_point = poincare_to_klein(x, y);
            canvas.ctx.lineTo(offset + scale * klein_point.x, offset - scale * klein_point.y);
        }
        canvas.ctx.stroke();
    }
}

function compute_circle_x(theta, other_angle, center, pt) {
    return 2 * (Math.cos(theta + other_angle) * (center.x - pt.x) + Math.sin(theta + other_angle) * (center.y - pt.y));
}

function poincare_to_klein(x, y) {
    let norm = Math.sqrt(x * x + y * y);
    if (norm > 1.001) {
        console.trace();
        throw ("Point {" + x + ", " + y  + "} is not in the unit disk (has norm " + ")");
    } else if (x * x + y * y >= 1) {
        return new Point(x, y); 
    }

    let denom = 1 + x * x + y * y;
    return new Point(2 * x / denom, 2 * y / denom);
}

function klein_to_poincare(x, y) {
    let norm = Math.sqrt(x * x + y * y);
    if (norm > 1.001) {
        console.trace();
        throw ("Point {" + x + ", " + y  + "} is not in the unit disk (has norm " + ")");
    } else if (x * x + y * y >= 1) {
        return new Point(x, y); 
    }
    let denom = 1 + Math.sqrt(1 - Math.pow(x, 2) - Math.pow(y, 2));
    return new Point(x / denom, y / denom);
}

function halfspace_to_poincare(x, y) {
    if (y < 0) {
        console.trace();
        throw ("Point {" + x + ", " + y  + "} is not in the upper halfspace");
    } else if (y == 0) {
    
    }

    let denom = x * x + (1+y) * (1+y);
    return new Point(2 * x / denom, (x * x + y * y - 1) / denom);
}

function poincare_to_halfspace(x, y) {
    let norm = Math.sqrt(x * x + y * y);
    if (norm > 1.001) {
        console.trace();
        throw ("Point {" + x + ", " + y  + "} is not in the unit disk (has norm " + ")");
    } else if (norm >= 1) {
        x /= norm; 
        y /= norm; 
    }

    let denom = x * x + (1-y) * (1-y);
    return new Point(2 * x / denom, (1 - x * x - y * y) / denom);
}

function klein_to_halfspace(x, y) {
    let poincare = klein_to_poincare(x, y);
    return poincare_to_halfspace(poincare.x, poincare.y);
}

function halfspace_to_klein(x, y) {
    let poincare = halfspace_to_poincare(x, y);
    return poincare_to_klein(poincare.x, poincare.y);
}

function poincare_ideal_line_lineTos(canvas, a, b, len, start_here) {
    let scale  = canvas.width / 2.1;
    let offset = canvas.width / 2;

    if (start_here) {
        canvas.ctx.moveTo(offset + scale * a.x, offset - scale * a.y);
    }
    for (let i = 1; i <= len; i++) {
        let s = i / len;
        let poincare_point = klein_to_poincare((1-s) * a.x + s * b.x, (1-s) * a.y + s * b.y);
        canvas.ctx.lineTo(offset + scale * poincare_point.x, offset - scale * poincare_point.y);
    }
}
