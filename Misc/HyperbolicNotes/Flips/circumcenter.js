compute_circumcircle() {
    let a = this.v2.dst_to(this.v3);
    let b = this.v3.dst_to(this.v1);
    let c = this.v1.dst_to(this.v2);

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

    let circumcenter_x = bary_circumcenter_1 * this.v1.x()
                        + bary_circumcenter_2 * this.v2.x()
                        + bary_circumcenter_3 * this.v3.x();

    let circumcenter_y = bary_circumcenter_1 * this.v1.y()
                        + bary_circumcenter_2 * this.v2.y()
                        + bary_circumcenter_3 * this.v3.y();
    this.circumcenter = {x: circumcenter_x, y: circumcenter_y};

    let s = (a + b + c)/2; //semiperimeter
    let area = Math.sqrt(s * (s-a) * (s-b) * (s-c)); // Heron's formula

    this.circumradius = a * b * c / (4 * area);
}
