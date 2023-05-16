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
    }

    plus(pt) {
        this.x += pt.x 
        this.y += pt.y 
    }

    minus(pt) {
        this.x -= pt.x 
        this.y -= pt.y 
    }

    dst_to(p) {
        return Math.sqrt(Math.pow(this.x - p.x, 2) + Math.pow(this.y - p.y, 2)); 
    }

    norm() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2)); 
    }

    // returns the angle between the line connecting these points and the x axis
    angle_to(p) {
        return Math.atan2(p.y - this.y, p.x - this.x);
    }

    copy() {
        return new Point(this.x, this.y); 
    }

    static from_polar(r, theta) {
        return new Point(r * Math.cos(theta), r * Math.sin(theta));
    }
}

function average_points(p1, p2) {
    return new Point(0.5 * (p1.x + p2.x), 0.5 * (p1.y + p2.y));
}

// intersection of the line from a1 to a2 with the line from b1 to b2
function intersection(a1, a2, b1, b2) {
    let m1 = a2.x - a1.x;
    let m2 = b2.x - b1.x;
    let m3 = a2.y - a1.y;
    let m4 = b2.y - b1.y;
    let vx = b1.x - a1.x;
    let vy = b1.y - a1.y;
    let t = (m2 * vy - m4 * vx) / (m2 * m3 - m1 * m4);
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
}

let e1 = new ProjectivePoint(1, 0, 0);
let e2 = new ProjectivePoint(0, 1, 0);
let e3 = new ProjectivePoint(0, 0, 1);

id_map = ProjectiveMap.from_projective_points(e1, e2, e3, e1, e2, e3, 1,1,1);

