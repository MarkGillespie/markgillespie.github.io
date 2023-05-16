// Cross ratio of triangles s, t which share their first two vertices
function cross_ratio(p1, p2, p3, p4) {
    let a = p1.dst_to(p4);
    let b = p4.dst_to(p3);
    let c = p2.dst_to(p3);
    let d = p2.dst_to(p1);

    return a * c / (b * d);
}

function cr_lengths(u, v, d, gamma, cr) {
    let delta = Math.PI - gamma;
    let denom = Math.sqrt(cr * cr * u * u + v * v - 2 * cr * u * v * Math.cos(delta));
    return {x: cr * d * u / denom, y: d * v / denom};
}

function distance_from_circle(pt, circle) {
    let center_dist = (pt.deep_copy().minus(circle.center)).norm_sq();
    return Math.abs(center_dist - Math.pow(circle.radius, 2));
}

// Given points v1, v2, v3, v4 which make up triangles A := v1-v2-v3 and B := v1-v2-v4,
// returns a projective maps taking A to a triangle cocircular with B
function projective_map_to_circle(v1, v2, v3, v4) {
    let cr = cross_ratio(v1, v3, v2, v4);

    let a = new GeometricTriangle(v1, v2, v3);
    let b = new GeometricTriangle(v1, v2, v4);

    // Side lengths of triangle b
    let u = v2.dst_to(v4);
    let v = v1.dst_to(v4);
    let d = v1.dst_to(v2);

    let signed_angle_diff = v4.angle_to(v2) - v4.angle_to(v1);
    let gamma = Math.min((6 * Math.PI + signed_angle_diff) % (2 * Math.PI), (6 * Math.PI - signed_angle_diff) % (2 * Math.PI));
    let lens = cr_lengths(u, v, d, gamma, cr);

    let phi = Math.acos((lens.x * lens.x + d * d - lens.y * lens.y)/(2 * lens.x * d));
    let alpha = b.v2.angle_to(b.v1);
    console.log(alpha/Math.PI)
    let total_angle = phi + alpha;
    let new_v3 = new Point(v2.x + lens.x * Math.cos(total_angle), v2.y + lens.x * Math.sin(total_angle));
    total_angle = -phi + alpha;

    console.log('x', lens.x, 'y+d', lens.y + d);
    console.log('y', lens.y, 'x+d', lens.x + d);
    console.log('d', d, 'x+y', lens.x + lens.y);

    let my_y = new_v3.dst_to(v1);

    console.log('x', lens.x, 'my x:', new_v3.dst_to(v2), 'y', lens.y, 'my y: ', my_y);
    console.log('phi', phi, 'my phi', v2.angle_to(new_v3) - v2.angle_to(v1))
    console.log('delta', Math.PI - gamma, 'my delta', -new_v3.angle_to(v2) + new_v3.angle_to(v1));
    console.log(lens.x * lens.x + d * d - 2 * lens.x * d * Math.cos(phi), lens.y * lens.y, my_y * my_y);
    let other_new_v3 = new Point(v2.x + lens.x * Math.cos(total_angle), v2.y + lens.x * Math.sin(total_angle));

    if (distance_from_circle(new_v3, b.circumcircle_data) > distance_from_circle(other_new_v3, b.circumcircle_data)) {
        new_v3 = other_new_v3; 
    }
    
    return a.circumcircle_preserving_map_to(v1, v2, new_v3);
}
