function compute_circle_x(theta, other_angle, center, pt) {
    return 2 * (Math.cos(theta + other_angle) * (center.x - pt.x) + Math.sin(theta + other_angle) * (center.y - pt.y));
}

function compute_circle_y(theta, other_angle, center, pt, l) {
    let x = compute_circle_x(theta, other_angle, center, pt);
    let y = Math.sqrt(Math.pow(x, 2) + Math.pow(l, 2) - 2 * x * l * Math.cos(theta));

    return y
}

function compute_circle_x_prime(theta, other_angle, center, pt) {
    return 2 * (-Math.sin(theta + other_angle) * (center.x - pt.x) + Math.cos(theta + other_angle) * (center.y - pt.y));
}

function compute_circle_y_prime(theta, other_angle, center, pt, l) {
    let x  = compute_circle_x(theta, other_angle, center, pt);
    let xp = compute_circle_x_prime(theta, other_angle, center, pt);
    let y  = compute_circle_y(theta, other_angle, center, pt, l);
    return 1 / (2 * y) * (2 * x * xp - 2 * l * (-x * Math.sin(theta) + xp * Math.cos(theta)));
}

function compute_cross_ratio_error(theta, other_angle, center, pt, u, v, l, cr) {
    let x = compute_circle_x(theta, other_angle, center, pt);
    let y = compute_circle_y(theta, other_angle, center, pt, l);
    return Math.pow(x * v - u * cr * y,2);
}

function compute_cross_ratio_error_prime(theta, other_angle, center, pt, u, v, l, cr) {
    let x  = compute_circle_x(theta, other_angle, center, pt);
    let xp = compute_circle_x_prime(theta, other_angle, center, pt);
    let y  = compute_circle_y(theta, other_angle, center, pt, l);
    let yp = compute_circle_y_prime(theta, other_angle, center, pt, l);
    return 2 * (x * v - u * cr * y) * (v * xp - u * cr * yp);
}

function compute_theta(other_angle, center, pt, u, v, l, cr) {
    let theta = 1;
    let i = 0;
    let err = compute_cross_ratio_error(theta, other_angle, center, pt, u, v, l, cr);
    while (Math.abs(err) > 1e-10 && i < 100) {
        theta -= 0.01 * compute_cross_ratio_error_prime(theta, other_angle, center, pt, u, v, l, cr);
        err = compute_cross_ratio_error(theta, other_angle, center, pt, u, v, l, cr);
        i++;
    }
    return theta;
}

function alt_y(theta, phi, gamma, center, ptb) {
    let angle = Math.PI + theta - gamma + phi;
    return 2 * (Math.cos(angle) * (center.x - ptb.x) + Math.sin(angle) * (center.y - ptb.y));
}

// Given triangulations a and b where a.v1 = b.v1 and a.v2 = b.v2,
// returns the projective map which takes a to a triangle cocircular with b
function projective_map_to_circle(a, b) {
    let cr = cross_ratio(a.v1, a.v3, b.v2, b.v3);

    // Side lengths of triangle b
    let u = b.v2.dst_to(b.v3);
    let v = b.v1.dst_to(b.v3);
    let l = b.v1.dst_to(b.v2);

    let theta = compute_theta(a.v2.angle_to(a.v1), b.circumcircle_data.center, b.v2, u, v, l, cr);
    let x = compute_circle_x(theta, a.v2.angle_to(a.v1), b.circumcircle_data.center, b.v2);
    let y = compute_circle_y(theta, a.v2.angle_to(a.v1), b.circumcircle_data.center, b.v2, l);

    let phi = a.v2.angle_to(a.v1);
    let gamma = Math.abs(b.v3.angle_to(b.v2) - b.v3.angle_to(b.v1))
    let center = b.circumcircle_data.center
    let a_pt = b.v2
    let b_pt = b.v1
    let psi_a = center.angle_to(a_pt)
    let psi_b = center.angle_to(b_pt)

    //console.log('theta = ' + theta
            //+ '\nphi = ' + phi
            //+ '\ngamma = ' + gamma
            //+ '\na = ' + '{' + a_pt.x + ', ' + a_pt.y + '}'
            //+ '\nb = ' + '{' + b_pt.x + ', ' + b_pt.y + '}'
            //+ '\ncenter = ' + '{' + (Math.round(100 * center.x) / 100) + ', ' + (Math.round(100 * center.y)/100) + '}'
            //+ '\nu = ' + u
            //+ '\nv = ' + v
            //+ '\ncr = ' + cr
            //+ '\npsiA = ' + psi_a
            //+ '\npsiB = ' + (Math.round(100 * psi_b)/100)
            //+ '\ntrueX = ' + x
            //+ '\ntrueY = ' + y
    //)

    let other_angle = Math.abs(b.v3.angle_to(b.v2) - b.v3.angle_to(b.v1));
    let other_y = alt_y(theta, a.v2.angle_to(a.v1), other_angle, b.circumcircle_data.center, b.v1);
    //console.log('other_y: ' + other_y)

    let total_angle = theta + a.v2.angle_to(a.v1);

    let new_a_v3 = new Point(b.v2.x + x * Math.cos(total_angle), b.v2.y + x * Math.sin(total_angle));

    return a.circumcircle_preserving_map_to(a.v1, a.v2, new_a_v3);
}

// Cross ratio of triangles s, t which share their first two vertices
function cross_ratio(p1, p2, p3, p4) {
    let a = p1.dst_to(p4);
    let b = p4.dst_to(p3);
    let c = p2.dst_to(p3);
    let d = p2.dst_to(p1);

    return a * c / (b * d);
}

function rounded_cross_ratio(p1, p2, p3, p4) {
    let cr = cross_ratio(p1, p2, p3, p4);
    return cr.toFixed(2);
}

function draw_cr_demo(cr_cc_canvas, cr_tri1, cr_tri2, theta) {
    cr_cc_canvas.ctx.clearRect(0, 0, cr_cc_canvas.width, cr_cc_canvas.height);

    new_cr_p3 = new Point(cr_tri2.circumcircle_data.center.x + cr_tri2.circumcircle_data.radius * Math.cos(theta),
                            cr_tri2.circumcircle_data.center.y + cr_tri2.circumcircle_data.radius * Math.sin(theta));

    let cr_map = cr_tri1.circumcircle_preserving_map_to(cr_tri1.v1, cr_tri1.v2, new_cr_p3);


    cr_tri2.draw_transformed_circumcircle(cr_cc_canvas, id_map);
    cr_tri2.draw_transformed(cr_cc_canvas, id_map);
    cr_tri1.draw_transformed(cr_cc_canvas, cr_map);

    document.getElementById("cr").innerHTML = rounded_cross_ratio(cr_tri1.v1, cr_tri1.v3, cr_tri1.v2, new_cr_p3);
}

function draw_flip_demo(flip_org_canvas, flip_org_circ_canvas, flip_new_circ_canvas, flip_new_canvas,
                        flip_top_color_pair, flip_bottom_color_pair, flip_left_color_pair, flip_right_color_pair, theta) {
    // clear canvases
    flip_org_canvas.ctx.clearRect(0, 0, flip_org_canvas.width, flip_org_canvas.height);
    flip_org_circ_canvas.ctx.clearRect(0, 0, flip_org_circ_canvas.width, flip_org_circ_canvas.height);
    flip_new_canvas.ctx.clearRect(0, 0, flip_new_canvas.width, flip_new_canvas.height);
    flip_new_circ_canvas.ctx.clearRect(0, 0, flip_new_circ_canvas.width, flip_new_circ_canvas.height);

    // pick points
    let flip_p1  = Point.from_polar(0.8, 0);
    let flip_p2  = Point.from_polar(1.2, theta);
    let flip_p3  = Point.from_polar(0.8, 3.1);
    let flip_p4  = Point.from_polar(0.8, 4);

    // The original two triangles
    let flip_tri1 = new GeometricTriangle(flip_p1, flip_p3, flip_p2);
    let flip_tri2 = new GeometricTriangle(flip_p1, flip_p3, flip_p4);

    // The final triangles after performing the flip. These versions have the Euclidean edge lengths
    // (rather than the correct hyperbolic lengths)
    let euclidean_flip_tri3 = new GeometricTriangle(flip_p1, flip_p2, flip_p4);
    let euclidean_flip_tri4 = new GeometricTriangle(flip_p2, flip_p3, flip_p4);
    //let euclidean_flip_tri3 = new Triangulation(flip_p2, flip_p4, flip_p1, 2);
    //let euclidean_flip_tri4 = new Triangulation(flip_p4, flip_p2, flip_p1, 2);

    // The hyperbolically-correct new edge length
    let ptolemy_length = (flip_p1.dst_to(flip_p2) * flip_p3.dst_to(flip_p4)
                            + flip_p2.dst_to(flip_p3) * flip_p4.dst_to(flip_p1))
                         / flip_p1.dst_to(flip_p3);
    console.log('ptolemy length: ', ptolemy_length);

    // The hyperbolically-correct final triangles
    // Note that the vertex positions of these triangles is not meaningful
    let hyperbolic_flip_tri3 = GeometricTriangle.from_lengths(ptolemy_length, flip_p4.dst_to(flip_p1), flip_p1.dst_to(flip_p2));
    let hyperbolic_flip_tri4 = GeometricTriangle.from_lengths(ptolemy_length, flip_p2.dst_to(flip_p3), flip_p3.dst_to(flip_p4), -1);

    // Map sending tri1 to become cocircular with tri2 (and its inverse)
    let cocircular_tri1_map = projective_map_to_circle(flip_tri1, flip_tri2);
    let inv_cocircular_tri1_map = cocircular_tri1_map.inverse();
    let cocircular_flip_p2  = cocircular_tri1_map.apply(flip_tri1.v3);

    // Affine map from the euclidean final triangles to the hyperbolic versions
    // We just use this to visualize the final triangles
    let affine_tri3_map = euclidean_flip_tri3.affine_map_to(hyperbolic_flip_tri3.v1, hyperbolic_flip_tri3.v2, hyperbolic_flip_tri3.v3);
    let affine_tri4_map = euclidean_flip_tri4.affine_map_to(hyperbolic_flip_tri4.v1, hyperbolic_flip_tri4.v2, hyperbolic_flip_tri4.v3);

    // Circumcircle-preserving projective maps from the cocircular triangles to the final (hyperbolic) triangles
    let projective_tri3_map = hyperbolic_flip_tri3.circumcircle_preserving_map_to(cocircular_flip_p2, flip_p4, flip_p1);
    let projective_tri4_map = hyperbolic_flip_tri4.circumcircle_preserving_map_to(flip_p4, cocircular_flip_p2, flip_p3);

    // Maps from the flipped cocircular triangles to the final euclidean triangles (and their inverses)
    //let cocircular_tri3_map = projective_tri3_map.compose(affine_tri3_map);
    //let cocircular_tri4_map = projective_tri4_map.compose(affine_tri4_map);
    let cocircular_tri3_map = euclidean_flip_tri3.circumcircle_preserving_map_to(flip_p1, cocircular_flip_p2, flip_p4);
    let cocircular_tri4_map = euclidean_flip_tri4.circumcircle_preserving_map_to(cocircular_flip_p2, flip_p3, flip_p4);
    let inv_cocircular_tri3_map = cocircular_tri3_map.inverse();
    let inv_cocircular_tri4_map = cocircular_tri4_map.inverse();
    //euclidean_flip_tri3.draw_transformed(flip_new_circ_canvas, cocircular_tri3_map, flip_right_color_pair);
    //euclidean_flip_tri4.draw_transformed(flip_new_circ_canvas, cocircular_tri4_map, flip_right_color_pair);
    //euclidean_flip_tri3.draw_transformed_circumcircle(flip_new_circ_canvas, cocircular_tri3_map, flip_right_color_pair);
    //euclidean_flip_tri4.draw_transformed_circumcircle(flip_new_circ_canvas, cocircular_tri4_map, flip_right_color_pair);
    //euclidean_flip_tri3.draw_transformed(flip_new_canvas, id_map, flip_right_color_pair);
    //euclidean_flip_tri4.draw_transformed(flip_new_canvas, id_map, flip_right_color_pair);
    //hyperbolic_flip_tri3.draw_transformed(flip_new_canvas, id_map, flip_right_color_pair);
    //hyperbolic_flip_tri4.draw_transformed(flip_new_canvas, id_map, flip_right_color_pair);
    //euclidean_flip_tri3.draw_transformed_circumcircle(flip_new_canvas, id_map, flip_right_color_pair);
    //euclidean_flip_tri4.draw_transformed_circumcircle(flip_new_canvas, id_map, flip_right_color_pair);

    // Divides the cocircular triangles into 4 pieces
    let p_middle = intersection(flip_p1, flip_p3, flip_p4, cocircular_flip_p2);
    let flip_tri11_cocircular = new Triangulation(flip_p1, p_middle, cocircular_flip_p2, 3, 2);
    let flip_tri12_cocircular = new Triangulation(p_middle, cocircular_flip_p2, flip_p3, 3, 2);
    let flip_tri21_cocircular = new Triangulation(flip_p1, p_middle, flip_p4,            3, 2);
    let flip_tri22_cocircular = new Triangulation(p_middle, flip_p4, flip_p3,            3, 2);

    let bendy_length = flip_p4.dst_to(p_middle) + p_middle.dst_to(flip_p2);
    console.log('bendy_length: ' + bendy_length)

    // Draw the 4 triangles in the original configuration
    flip_tri11_cocircular.draw_transformed(flip_org_canvas, inv_cocircular_tri1_map, flip_top_color_pair);
    flip_tri12_cocircular.draw_transformed(flip_org_canvas, inv_cocircular_tri1_map, flip_top_color_pair);
    flip_tri21_cocircular.draw_transformed(flip_org_canvas, id_map, flip_bottom_color_pair);
    flip_tri22_cocircular.draw_transformed(flip_org_canvas, id_map, flip_bottom_color_pair);

    // Draw the 4 triangles in the cocircular configuration
    flip_tri2.draw_transformed_circumcircle(flip_org_circ_canvas, id_map);
    flip_tri11_cocircular.draw_transformed(flip_org_circ_canvas, id_map, flip_top_color_pair);
    flip_tri12_cocircular.draw_transformed(flip_org_circ_canvas, id_map, flip_top_color_pair);
    flip_tri21_cocircular.draw_transformed(flip_org_circ_canvas, id_map, flip_bottom_color_pair);
    flip_tri22_cocircular.draw_transformed(flip_org_circ_canvas, id_map, flip_bottom_color_pair);

    // Draw the 4 triangles in the cocircular configuration, but colored to indicate that the flip happened
    flip_tri2.draw_transformed_circumcircle(flip_new_circ_canvas, id_map);
    flip_tri11_cocircular.draw_transformed(flip_new_circ_canvas, id_map, flip_right_color_pair);
    flip_tri12_cocircular.draw_transformed(flip_new_circ_canvas, id_map, flip_left_color_pair);
    flip_tri21_cocircular.draw_transformed(flip_new_circ_canvas, id_map, flip_right_color_pair);
    flip_tri22_cocircular.draw_transformed(flip_new_circ_canvas, id_map, flip_left_color_pair);

    // Draw the 4 triangles in the final configuration
    flip_tri11_cocircular.draw_transformed(flip_new_canvas, inv_cocircular_tri3_map, flip_right_color_pair);
    flip_tri12_cocircular.draw_transformed(flip_new_canvas, inv_cocircular_tri4_map, flip_left_color_pair);
    flip_tri21_cocircular.draw_transformed(flip_new_canvas, inv_cocircular_tri3_map, flip_right_color_pair);
    flip_tri22_cocircular.draw_transformed(flip_new_canvas, inv_cocircular_tri4_map, flip_left_color_pair);
}

function setup() {
    /****************************************
    *       Projective Map Diagram          *
    *****************************************/
    let projective_canvas = new Canvas("projective_linear");

    let v1 = Point.from_polar(1, 0);
    let v2 = Point.from_polar(1, 2 * Math.PI/3);
    let v3 = Point.from_polar(1, 4 * Math.PI/3);

    let tri = new Triangulation(v1, v2, v3, 3);

    let aSlider = document.getElementById("aSlider");
    let bSlider = document.getElementById("bSlider");
    let cSlider = document.getElementById("cSlider");
    aSlider.value = 0;
    bSlider.value = 0;
    cSlider.value = 0;

    let a = Math.pow(2, aSlider.value/20);
    let b = Math.pow(2, bSlider.value/20);
    let c = Math.pow(2, cSlider.value/20);

    let map = ProjectiveMap.from_points(v1, v2, v3, v1, v2, v3, a, b, c);
    aSlider.oninput = function() {
        a = Math.pow(2, this.value/20);
        document.getElementById("aVal").innerHTML = (this.value/20).toFixed(1);
        projective_canvas.ctx.clearRect(0, 0, projective_canvas.width, projective_canvas.height);
        map.construct_from_points(v1, v2, v3, v1, v2, v3, a, b, c);
        tri.draw_transformed_circumcircle(projective_canvas, map);
        tri.draw_transformed(projective_canvas, map);
    }
    bSlider.oninput = function() {
        b = Math.pow(2, this.value/20);
        document.getElementById("bVal").innerHTML = (this.value/20).toFixed(1);
        projective_canvas.ctx.clearRect(0, 0, projective_canvas.width, projective_canvas.height);
        map.construct_from_points(v1, v2, v3, v1, v2, v3, a, b, c);
        tri.draw_transformed_circumcircle(projective_canvas, map);
        tri.draw_transformed(projective_canvas, map);
    }
    cSlider.oninput = function() {
        c = Math.pow(2, this.value/10);
        document.getElementById("cVal").innerHTML = (this.value/10).toFixed(1);
        projective_canvas.ctx.clearRect(0, 0, projective_canvas.width, projective_canvas.height);
        map.construct_from_points(v1, v2, v3, v1, v2, v3, a, b, c);
        tri.draw_transformed_circumcircle(projective_canvas, map);
        tri.draw_transformed(projective_canvas, map);
    }
    projective_canvas.ctx.fill();

    tri.draw_transformed_circumcircle(projective_canvas, map);
    tri.draw_transformed(projective_canvas, map);

    /****************************************
    *          Cross Ratio Diagram          *
    *****************************************/
    let cr_or_canvas = new Canvas("cross_ratio_original");
    let cr_cc_canvas = new Canvas("cross_ratio_cocircular");

    // Tri1 is points
    let cr_p1  = Point.from_polar(1, 0);
    let cr_p2  = Point.from_polar(1, 2.5);
    let cr_p3  = Point.from_polar(1, 1);
    let cr_p4  = Point.from_polar(1, 4);
    let original_p3 = new Point(0.8,0.9);
    let cr_color_pairs = random_color_pairs(2);
    let cr_tri1 = new Triangulation(cr_p1, cr_p2, original_p3, 3, cr_color_pairs[0]);
    let cr_tri2 = new Triangulation(cr_p1, cr_p2, cr_p4, 3, cr_color_pairs[1]);

    // Draw original triangles (which never change)
    cr_tri2.draw_transformed_circumcircle(cr_or_canvas, id_map);
    cr_tri1.draw_transformed_circumcircle(cr_or_canvas, id_map);
    cr_tri2.draw_transformed(cr_or_canvas, id_map);
    cr_tri1.draw_transformed(cr_or_canvas, id_map);
    document.getElementById("old_cr").innerHTML = rounded_cross_ratio(cr_tri1.v1, cr_tri1.v3, cr_tri1.v2, original_p3);

    let cr_theta1 = Math.atan2(cr_tri2.v1.y - cr_tri2.circumcircle_data.center.y, cr_tri2.v1.x - cr_tri2.circumcircle_data.center.x);
    let cr_theta2 = Math.atan2(cr_tri2.v2.y - cr_tri2.circumcircle_data.center.y, cr_tri2.v2.x - cr_tri2.circumcircle_data.center.x);
    let cr_demo_max_angle = Math.max(cr_theta1, cr_theta2) - 0.01;
    let cr_demo_min_angle = Math.min(cr_theta1, cr_theta2);

    let cr_theta_slider = document.getElementById("cr_theta_slider");
    cr_theta_slider.value = 250;
    let cr_theta = (cr_theta_slider.value / 500.) * (cr_demo_max_angle - cr_demo_min_angle) + cr_demo_min_angle;

    cr_theta_slider.oninput = function() {
        cr_theta = (1 - cr_theta_slider.value / 500.) * (cr_demo_max_angle - cr_demo_min_angle) + cr_demo_min_angle;
        draw_cr_demo(cr_cc_canvas, cr_tri1, cr_tri2, cr_theta);
    }
    draw_cr_demo(cr_cc_canvas, cr_tri1, cr_tri2, cr_theta);


    /****************************************
    *           Edge Flip Diagram           *
    *****************************************/
    let flip_org_canvas = new Canvas("flip_a");
    let flip_org_circ_canvas = new Canvas("flip_b");
    let flip_new_circ_canvas = new Canvas("flip_c");
    let flip_new_canvas = new Canvas("flip_d");

    let flip_colors = random_color_pairs(4);
    let flip_left_color_pair   = flip_colors[0];
    let flip_right_color_pair  = flip_colors[1];
    let flip_top_color_pair    = flip_colors[2];
    let flip_bottom_color_pair = flip_colors[3];


    let flip_theta_slider = document.getElementById("flip_theta_slider");
    flip_theta_slider.value = 250;

    let edge_flip_max_angle = 2.2;
    let edge_flip_min_angle = 0.415;
    let theta = (flip_theta_slider.value / 500.) * (edge_flip_max_angle - edge_flip_min_angle) + edge_flip_min_angle;

    flip_theta_slider.oninput = function() {
        theta = (1 - flip_theta_slider.value / 500.) * (edge_flip_max_angle - edge_flip_min_angle) + edge_flip_min_angle;
        draw_flip_demo(flip_org_canvas, flip_org_circ_canvas, flip_new_circ_canvas, flip_new_canvas,
                       flip_top_color_pair, flip_bottom_color_pair, flip_left_color_pair, flip_right_color_pair, theta);
    }
    draw_flip_demo(flip_org_canvas, flip_org_circ_canvas, flip_new_circ_canvas, flip_new_canvas,
                   flip_top_color_pair, flip_bottom_color_pair, flip_left_color_pair, flip_right_color_pair, theta);
}

setup();
