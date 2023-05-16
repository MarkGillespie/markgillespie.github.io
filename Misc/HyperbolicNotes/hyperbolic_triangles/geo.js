class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    to_projective() {
        return new ProjectivePoint(this.x, this.y, 1);
    }

    deep_copy() {
        return new Point(this.x, this.y);
    }

    times(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    over(s) {
        this.x /= s;
        this.y /= s;
        return this;
    }

    plus(pt) {
        this.x += pt.x;
        this.y += pt.y;
        return this;
    }

    minus(pt) {
        this.x -= pt.x;
        this.y -= pt.y;
        return this;
    }

    dst_to(p) {
        return Math.sqrt(Math.pow(this.x - p.x, 2) + Math.pow(this.y - p.y, 2));
    }

    norm_sq() {
        return Math.pow(this.x, 2) + Math.pow(this.y, 2);
    }

    norm() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    dot(p) {
        return this.x * p.x + this.y * p.y;
    }

    // returns the angle between the line connecting these points and the x axis
    angle_to(p) {
        return Math.atan2(p.y - this.y, p.x - this.x);
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    copy() {
        return new Point(this.x, this.y);
    }

    rotated_copy(theta) {
        let rx = this.x * Math.cos(theta) - this.y * Math.sin(theta);
        let ry = this.x * Math.sin(theta) + this.y * Math.cos(theta);
        return new Point(rx, ry);
    }

    static from_polar(r, theta) {
        return new Point(r * Math.cos(theta), r * Math.sin(theta));
    }

    toString() {
        return "{" + this.x + ", " + this.y + "}";
    }
}

function average_points(p1, p2) {
    return new Point(0.5 * (p1.x + p2.x), 0.5 * (p1.y + p2.y));
}
// Returns the barycentric coordinate for pt along line a-b
// i.e. minimizes \|b + (a-b)t - pt\|_2^2
// i.e pt = ta + (1-t)b
function barycentric_coordinate(pt, a, b) {
    let diff = b.deep_copy().minus(a);
    let other_diff = b.deep_copy().minus(pt);
    return dot(diff, other_diff)/diff.norm_sq();
}

// intersection of the line from a1 to a2 with the line from b1 to b2
// Given as the time paramter t in a1 + t(a2-a1)
function intersection_time(a1, a2, b1, b2) {
    let m1 = a2.x - a1.x;
    let m2 = b2.x - b1.x;
    let m3 = a2.y - a1.y;
    let m4 = b2.y - b1.y;
    let vx = b1.x - a1.x;
    let vy = b1.y - a1.y;
    let t = (m2 * vy - m4 * vx) / (m2 * m3 - m1 * m4);
    return t;
}

// intersection of the line from a1 to a2 with the line from b1 to b2
// Returns null if the segments do not intersect
function intersection(a1, a2, b1, b2) {
    let m1 = a2.x - a1.x;
    let m2 = b2.x - b1.x;
    let m3 = a2.y - a1.y;
    let m4 = b2.y - b1.y;
    let vx = b1.x - a1.x;
    let vy = b1.y - a1.y;
    let t = (m2 * vy - m4 * vx) / (m2 * m3 - m1 * m4);
    if (t > 1 || t < 0) {
        return null;
    }
    let new_a2 = a2.deep_copy();
    new_a2.minus(a1);
    new_a2.times(t);
    new_a2.plus(a1);
    return new_a2;
}

class ProjectivePoint {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    copy() {
        return new ProjectivePoint(this.x, this.y, this.z);
    }

    toString() {
        return "{" + this.x + ", " + this.y + ", " + this.z + "}";
    }
    toColumnString() {
        return "{{" + this.x + "}, {" + this.y + "}, {" + this.z + "}}";
    }

    // returns the dot product of this point with p
    dot(p) {
        return this.x * p.x + this.y * p.y + this.z * p.z;
    }

    // returns the sum of this vector and p
    add(p) {
        return new ProjectivePoint(this.x + p.x, this.y + p.y, this.z + p.z);
    }

    // returns the result of scaling this vector by s
    scale(s) {
        return new ProjectivePoint(s * this.x, s * this.y, s * this.z);
    }

    // returns the norm of this vector
    norm() {
        return Math.sqrt(this.dot(this));
    }

    // returns a normalized version of this vector
    normalized() {
        return this.scale(1 / this.norm());
    }

    // ip == in place (updates current point)
    // adds p to this vector
    ip_add(p) {
        this.x += p.x;
        this.y += p.y;
        this.z += p.z;
    }

    // subtracts p from this vector
    ip_subtract(p) {
        this.x -= p.x;
        this.y -= p.y;
        this.z -= p.z;
    }

    // scales this vector by s
    ip_scale(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
    }

    // normalizes this vector
    ip_normalize() {
        this.ip_scale(1 / this.norm());
    }

    to_point() {
        return new Point(this.x / this.z, this.y / this.z);
    }

    static from_point(point) {
        return new ProjectivePoint(point.x, point.y, 1);
    }

    static cross(a, b) {
        return new ProjectivePoint(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x)
    }

    static dot(a, b) {
        return a.dot(b);
    }

    static det(a, b, c) {
        return ProjectivePoint.dot(a, ProjectivePoint.cross(b, c));
    }
}

// dot product of v and w
function dot(v, w) {
    return v.dot(w);
}

// scalar multiplication (l scalar, v vector)
function scale(l, v) {
    return v.scale(l);
}

// v + w
function add(v,w) {
    return v.add(w);
}

// v - w
function subtract(v,w) {
    return v.add(w.scale(-1));
}

function normalize(v) {
    return v.normalized();
}

class ProjectiveMap {
    // Creates the projective map sending point v1, v2, v3 to points w1, w2, w3
    // with scale factors u1, u2, u3
    // This projective map is stored in 6 vectors: e1, e2, e3, out1, out2, out3
    // The map is the sum of outer products: sum_i out_i * e_i^T
    constructor(v1, v2, v3, w1, w2, w3, u1, u2, u3) {
        this.construct_from_projective_points(v1, v2, v3, w1, w2, w3, u1, u2, u3);
    }

    static from_projective_points(v1, v2, v3, w1, w2, w3, u1, u2, u3) {
        return new ProjectiveMap(v1, v2, v3, w1, w2, w3, u1, u2, u3);
    }

    static from_points(v1, v2, v3, w1, w2, w3, u1, u2, u3) {
        return ProjectiveMap.from_projective_points(v1.to_projective(), v2.to_projective(), v3.to_projective(),
                                                    w1.to_projective(), w2.to_projective(), w3.to_projective(),
                                                    u1,                 u2,                 u3);
    }

    construct_from_points(v1, v2, v3, w1, w2, w3, u1, u2, u3) {
        this.construct_from_projective_points(v1.to_projective(), v2.to_projective(), v3.to_projective(),
                                              w1.to_projective(), w2.to_projective(), w3.to_projective(),
                                              u1,                 u2,                 u3);
    }

    construct_from_projective_points(v1, v2, v3, w1, w2, w3, u1, u2, u3) {
        if (! (isFinite(u1) && isFinite(u2) && isFinite(u3))) {
            throw "Invalid scale factors: " + u1 + ", " + u2 + ", " + u3 + "\n" + new Error().stack;
        }

        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;
        this.w1 = w1;
        this.w2 = w2;
        this.w3 = w3;
        this.u1 = u1;
        this.u2 = u2;
        this.u3 = u3;

        // We construct the matrix using Gram-Schmidt

        // v1 = s1 e1
        this.e1 = v1.copy();
        let  s1 = this.e1.norm();
        this.e1.ip_normalize();

        // out1 should be the image of e1
        // v1 maps to u1 w1, so e1 maps to (u1 / s1) w1 since v1 = s1 e1
        this.out1 = w1.copy();
        this.out1.ip_scale(u1 / s1);

        // v2 = s21 e1 + s22 e2
        let s21 = dot(this.e1, v2);
        this.e2 = subtract(v2, scale(s21, this.e1));
        let s22  = this.e2.norm();
        this.e2.ip_normalize();

        // since v2 = s21 e1 + s22 e2, v2 maps to u2 w2, e1 maps to out1 and e2 maps to out2, we know that
        // u2 w2 = s21 out1 + s22 out2
        // So we can solve for out2
        this.out2 = w2.copy();
        this.out2.ip_scale(u2);
        this.out2.ip_subtract(scale(s21, this.out1));
        this.out2.ip_scale(1 / s22);

        // v3 = s31 e1 + s32 e2 + s33 e3
        let s31 = dot(this.e1, v3);
        let s32 = dot(this.e2, v3);
        this.e3 = subtract(v3, scale(s31, this.e1));
        this.e3.ip_subtract(scale(s32, this.e2));
        let s33 = this.e3.norm();
        this.e3.ip_normalize();

        this.out3 = w3.copy();
        this.out3.ip_scale(u3);
        this.out3.ip_subtract(scale(s31, this.out1));
        this.out3.ip_subtract(scale(s32, this.out2));
        this.out3.ip_scale(1 / s33);

        if (isNaN(ProjectivePoint.det(this.e1, this.e2, this.e3)) || isNaN(ProjectivePoint.det(this.out1, this.out2, this.out3))) {
            console.log(this.e1, this.e2, this.e3, this.out1, this.out2, this.out3)
            throw "Degenerate Map\n" + new Error().stack;
        }
    }

    // Apply this map to a Point
    apply(p) {
        let proj_point = ProjectivePoint.from_point(p);
        let out = this.apply_to_projective_point(proj_point);
        return out.to_point();
    }

    apply_to_projective_point(p) {
        let out =  scale(dot(this.e1, p), this.out1);
        out.ip_add(scale(dot(this.e2, p), this.out2));
        out.ip_add(scale(dot(this.e3, p), this.out3));
        return out;
    }

    inverse() {
        return ProjectiveMap.from_projective_points(this.out1, this.out2, this.out3, this.e1, this.e2, this.e3, 1, 1, 1);
    }

    // Returns the composition of this map with T. I.e. if this is S, returns
    // S o T
    compose(T) {
        //let e1 = T.v1;
        //let e2 = T.v2;
        //let e3 = T.v3;

        let e1 = new ProjectivePoint(1, 0, 0);
        let e2 = new ProjectivePoint(0, 1, 0);
        let e3 = new ProjectivePoint(0, 0, 1);

        let out1 = this.apply_to_projective_point(T.apply_to_projective_point(e1));
        let out2 = this.apply_to_projective_point(T.apply_to_projective_point(e2));
        let out3 = this.apply_to_projective_point(T.apply_to_projective_point(e3));

        return new ProjectiveMap(e1, e2, e3, out1, out2, out3, 1, 1, 1);
    }

    toString() {
        let column1 = this.apply_to_projective_point(new ProjectivePoint(1, 0, 0));
        let column2 = this.apply_to_projective_point(new ProjectivePoint(0, 1, 0));
        let column3 = this.apply_to_projective_point(new ProjectivePoint(0, 0, 1));
        return "Transpose[{" + column1 + ", " + column2 + ", " + column3 + "}]";
    }

    static identity() {
        let a  = new Point(0, 0);
        let b  = new Point(1, 0);
        let c  = new Point(0, 1);
        return ProjectiveMap.from_points(a, b, c, a, b, c, 1, 1, 1);
    }

    static scale(s) {
        let a  = new Point(0, 0);
        let b  = new Point(1, 0);
        let c  = new Point(0, 1);
        let sb = new Point(s, 0);
        let sc = new Point(0, s);
        return ProjectiveMap.from_points(a, b, c, a, sb, sc, 1, 1, 1);
    }

    static rotation(theta) {
        let a  = new Point(0, 0);
        let b  = new Point(1, 0);
        let c  = new Point(0, 1);
        let sb = new Point(Math.cos(theta), Math.sin(theta));
        let sc = new Point(-Math.sin(theta), Math.cos(theta));
        return ProjectiveMap.from_points(a, b, c, a, sb, sc, 1, 1, 1);
    }
}

let e1 = new ProjectivePoint(1, 0, 0);
let e2 = new ProjectivePoint(0, 1, 0);
let e3 = new ProjectivePoint(0, 0, 1);

id_map = ProjectiveMap.from_projective_points(e1, e2, e3, e1, e2, e3, 1,1,1);


class ClickablePoint extends Point {
    constructor(x, y, radius=5) {
        super(x, -y);
        this.radius = radius;
        this.canvas_x = x;
        this.canvas_y = y;
    }

    move_to(x, y) {
        this.x = x;
        this.y = -y;

        this.canvas_x = x;
        this.canvas_y = y;
    }

    contains(x, y) {
        return Math.pow(x - this.canvas_x, 2) + Math.pow(y - this.canvas_y, 2) < Math.pow(this.radius, 2);
    }

    draw(canvas) {
        canvas.ctx.fillStyle = "#333";

        // Halfspace Triangle
        canvas.ctx.beginPath();
        canvas.ctx.arc(this.canvas_x, this.canvas_y, this.radius, 0, 2 * Math.PI);
        canvas.ctx.fill();
    }

}

class AbstractTriangle {
    constructor(v1, v2, v3) {
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;
    }

    draw_transformed(canvas, map, color_pair, line_width = 5) {
        canvas.ctx.fillStyle = color_pair.light;
        canvas.ctx.strokeStyle = color_pair.dark;
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
        canvas.ctx.strokeStyle = color_pair.dark;
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

class GeometricTriangle extends AbstractTriangle {
    constructor(v1, v2, v3) {
        super(v1, v2, v3);

        this.circumcircle_data = compute_circumcircle(v1, v2, v3);
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

function circumradius(v1, v2, v3) {
    let a = v2.dst_to(v3);
    let b = v3.dst_to(v1);
    let c = v1.dst_to(v2);

    let s = (a + b + c)/2; //semiperimeter
    let area = Math.sqrt(s * (s-a) * (s-b) * (s-c)); // Heron's formula
    let circumradius = a * b * c / (4 * area);
    return circumradius;
}

function to_unit_circle(v1, v2, v3) {
    let cc = compute_circumcircle(v1, v2, v3);

    let small_v1 = v1.deep_copy().minus(cc.center).over(cc.radius);
    let small_v2 = v2.deep_copy().minus(cc.center).over(cc.radius);
    let small_v3 = v3.deep_copy().minus(cc.center).over(cc.radius);

    return ProjectiveMap.from_points(v1, v2, v3, small_v1, small_v2, small_v3, 1, 1, 1);
}
