class Canvas {
    constructor(canvas_name) {
        this.canvas = document.getElementById(canvas_name);
        this.width  = this.canvas.width;
        this.height = this.canvas.height;
        this.ctx    = this.canvas.getContext("2d");
    }    

    to_x(x) {
        return 0.5 * this.width + x * 0.4 * this.width; 
    }

    to_y(y) {
        return 0.5 * this.height - y * 0.4 * this.height; 
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

class AbstractTriangle {
    constructor(v1, v2, v3) {
        this.v1 = v1; 
        this.v2 = v2;
        this.v3 = v3;
    }

    draw_transformed(canvas, map, color_pair, line_width = 5) {
        canvas.ctx.fillStyle = color_pair.light();
        canvas.ctx.strokeStyle = color_pair.dark();
        canvas.ctx.lineWidth = line_width;
        canvas.ctx.lineJoin = "round";
        let transformed_v1 = map.apply(this.v1);
        let transformed_v2 = map.apply(this.v2);
        let transformed_v3 = map.apply(this.v3);

        canvas.ctx.beginPath(); 
        canvas.ctx.moveTo(canvas.to_x(transformed_v1.x), canvas.to_y(transformed_v1.y));
        canvas.ctx.lineTo(canvas.to_x(transformed_v2.x), canvas.to_y(transformed_v2.y));
        canvas.ctx.lineTo(canvas.to_x(transformed_v3.x), canvas.to_y(transformed_v3.y));
        canvas.ctx.closePath();
        canvas.ctx.fill();
        canvas.ctx.stroke();
    }


    draw_transformed_outline(canvas, map, color_pair, line_width = 5) {
        canvas.ctx.strokeStyle = color_pair.dark();
        canvas.ctx.lineWidth = line_width;
        canvas.ctx.lineJoin = "round";
        let transformed_v1 = map.apply(this.v1);
        let transformed_v2 = map.apply(this.v2);
        let transformed_v3 = map.apply(this.v3);

        canvas.ctx.beginPath(); 
        canvas.ctx.moveTo(canvas.to_x(transformed_v1.x), canvas.to_y(transformed_v1.y));
        canvas.ctx.lineTo(canvas.to_x(transformed_v2.x), canvas.to_y(transformed_v2.y));
        canvas.ctx.lineTo(canvas.to_x(transformed_v3.x), canvas.to_y(transformed_v3.y));
        canvas.ctx.closePath();
        canvas.ctx.stroke();
    }
}

class SimpleTriangle extends AbstractTriangle{
    constructor(v1, v2, v3) {
        super(v1, v2, v3);
    }

    draw_transformed(canvas, map, color_pair, line_width = 5) {
        super.draw_transformed(canvas, map, color_pair, line_width);
    }

}

class GeometricTriangle extends AbstractTriangle {
    constructor(v1, v2, v3) {
        super(v1, v2, v3); 

        this.circumcircle_data = compute_circumcircle(v1, v2, v3);
        this.circle = new Circle(this.circumcircle_data.center.x, this.circumcircle_data.center.y, this.circumcircle_data.radius, 100.0);
    }

    draw_transformed_circumcircle(canvas, map) {
        this.circle.draw_transformed(canvas, map);
    }

    circumcircle_preserving_map_from(v1, v2, v3) {
        let c12 = Math.log(v1.dst_to(v2)) - Math.log(this.v1.dst_to(this.v2));
        let c23 = Math.log(v2.dst_to(v3)) - Math.log(this.v2.dst_to(this.v3));
        let c13 = Math.log(v1.dst_to(v3)) - Math.log(this.v1.dst_to(this.v3));
        let a1 = Math.exp(c12 - c23 + c13);
        let a2 = Math.exp(c23 - c13 + c12);
        let a3 = Math.exp(c13 - c23 + c23);
        return ProjectiveMap.from_points(v1,      v2,      v3,
                                         this.v1, this.v2, this.v3,
                                         a1,      a2,      a3);
    }

    circumcircle_preserving_map_to(v1, v2, v3) {
        let c12 = Math.log(this.v1.dst_to(this.v2)) - Math.log(v1.dst_to(v2));
        let c23 = Math.log(this.v2.dst_to(this.v3)) - Math.log(v2.dst_to(v3));
        let c13 = Math.log(this.v1.dst_to(this.v3)) - Math.log(v1.dst_to(v3));
        let a1 = Math.exp(c12 - c23 + c13);
        let a2 = Math.exp(c23 - c13 + c12);
        let a3 = Math.exp(c13 - c12 + c23);
        return ProjectiveMap.from_points(this.v1, this.v2, this.v3,
                                         v1,      v2,      v3,
                                         a1,      a2,      a3);
    }

    affine_map_to(v1, v2, v3) {
        return ProjectiveMap.from_points(this.v1, this.v2, this.v3,
                                         v1,      v2,      v3,
                                         1,       2,       3);
    }

    static from_lengths(s1, s2, s3, scale = 1) {
        if (s1 > s2 + s3 || s2 > s1 + s3 || s3 > s1 + s2) {
            throw "Side lengths violate the triangle inequality" 
        } 
        let v1 = new Point(-s1/2.,0);
        let v2 = new Point(s1/2., 0);
        let theta = Math.acos((s2 * s2 - s1 * s1 - s3 * s3) / (-2 * s1 * s3));
        let v3 = Point.from_polar(s3, scale * theta);
        v3.x -= s1/2.;
        return new GeometricTriangle(v1, v2, v3);
    }

    static transform(tri, map) {
        let v1 = map.apply(tri.v1); 
        let v2 = map.apply(tri.v2); 
        let v3 = map.apply(tri.v3); 

        return new GeometricTriangle(v1, v2, v3);
    }
}

class Triangulation extends GeometricTriangle{
    constructor(v1, v2, v3, n, line_width=5, color_pair = random_color_pair()) {
        super(v1, v2, v3);
        this.line_width = line_width;
        this.color_pair = color_pair;
        this.triangles = [new SimpleTriangle(v1, v2, v3, this.color_pair)];
        this.super_triangle = new SimpleTriangle(v1, v2, v3, this.color_pair);

        for (let i = 1; i < n; i++) {
            let new_triangles = [];
            for (let t = 0; t < this.triangles.length; t++) {
                let tri = this.triangles[t];
                let m1  = average_points(tri.v2, tri.v3);
                let m2  = average_points(tri.v1, tri.v3);
                let m3  = average_points(tri.v1, tri.v2);

                new_triangles.push(new SimpleTriangle(tri.v1, m3, m2, this.color_pair));
                new_triangles.push(new SimpleTriangle(m2, m1, tri.v3, this.color_pair));
                new_triangles.push(new SimpleTriangle(m1, m2, m3, this.color_pair));
                new_triangles.push(new SimpleTriangle(m3, tri.v2, m1, this.color_pair));
            }
            this.triangles = new_triangles;
        }
    }

    set_color_pair(color_pair) {
        this.color_pair = color_pair;
    }

    draw_transformed(canvas, map, color_pair = this.color_pair) {
        let line_width = this.line_width;
        this.triangles.forEach(function(tri) {
            tri.draw_transformed(canvas, map, color_pair, line_width);
        });
        this.super_triangle.draw_transformed_outline(canvas, map, color_pair, Math.max(line_width, 5));
    }
}

class Circle {
    constructor(x, y, r, n) {
        this.points = [];
        for (let i = 0; i < n; i++) {
            this.points.push(new Point(x + r * Math.cos(2 * Math.PI / n * i), y + r * Math.sin(2 * Math.PI / n * i)));
        }
        this.color = "#BBB";
    }

    draw_transformed(canvas, map) {
        canvas.ctx.strokeStyle = this.color;
        canvas.ctx.lineWidth = 5;
        canvas.ctx.beginPath(); 
        let transformed_pt = map.apply(this.points[0]);
        canvas.ctx.moveTo(canvas.to_x(transformed_pt.x), canvas.to_y(transformed_pt.y));
        for (let i = 1; i < this.points.length; i++) {
            transformed_pt = map.apply(this.points[i]);

            // Only draw the part of the circumcircle that shows up on screen.
            // If you don't do this, you get weird hyperbola artifacts when you stretch the triangle a lot
            if (transformed_pt.x > -2 && transformed_pt.x < 2
                    && transformed_pt.y > -2 && transformed_pt.y < 2) {
                canvas.ctx.lineTo(canvas.to_x(transformed_pt.x), canvas.to_y(transformed_pt.y));
            } else {
                canvas.ctx.moveTo(canvas.to_x(transformed_pt.x), canvas.to_y(transformed_pt.y));
            }
        }
        transformed_pt = map.apply(this.points[0]);
        canvas.ctx.lineTo(canvas.to_x(transformed_pt.x), canvas.to_y(transformed_pt.y));
        canvas.ctx.stroke();
    }
}

function compute_circumcircle(v1, v2, v3) {
    let a = v2.dst_to(v3);
    let b = v3.dst_to(v1);
    let c = v1.dst_to(v2);

    let a_sq = Math.pow(a, 2);
    let b_sq = Math.pow(b, 2);
    let c_sq = Math.pow(c, 2);

    let bary_circumcenter_1 = a_sq * (b_sq + c_sq - a_sq);
    let bary_circumcenter_2 = b_sq * (c_sq + a_sq - b_sq);
    let bary_circumcenter_3 = c_sq * (a_sq + b_sq - c_sq);

    let bary_scale = bary_circumcenter_1 + bary_circumcenter_2 + bary_circumcenter_3;
    bary_circumcenter_1 /= bary_scale;
    bary_circumcenter_2 /= bary_scale;
    bary_circumcenter_3 /= bary_scale;

    let circumcenter_x = bary_circumcenter_1 * v1.x
                       + bary_circumcenter_2 * v2.x
                       + bary_circumcenter_3 * v3.x;

    let circumcenter_y = bary_circumcenter_1 * v1.y
                       + bary_circumcenter_2 * v2.y
                       + bary_circumcenter_3 * v3.y;

    let s = (a + b + c)/2; //semiperimeter
    let area = Math.sqrt(s * (s-a) * (s-b) * (s-c)); // Heron's formula
    let circumradius = a * b * c / (4 * area);
    return {center: new Point(circumcenter_x, circumcenter_y), radius: circumradius};
}
