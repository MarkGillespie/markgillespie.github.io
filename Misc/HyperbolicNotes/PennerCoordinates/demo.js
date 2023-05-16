let selected_point = null;
let horocycle_points = [];
let horocycle_distance_points = [];
let unit_length = 150;

let tri_color_pair = {light: '#efe', dark: "#000"};

function draw_horocycle_demo(halfspace_canvas, poincare_canvas, klein_canvas, p1, p2, p3) {
    halfspace_canvas.clear();
    poincare_canvas.clear();
    klein_canvas.clear();

    let l1 = p2.dst_to(p3) / unit_length;
    let l2 = p1.dst_to(p3) / unit_length;
    let l3 = p1.dst_to(p2) / unit_length;

    document.getElementById("l1").innerHTML = l1.toFixed(2);
    document.getElementById("l2").innerHTML = l2.toFixed(2);
    document.getElementById("l3").innerHTML = l3.toFixed(2);

    tri = new DecoratedHyperbolicTriangle(l1, l2, l3);

    tri.draw_halfspace_triangle(halfspace_canvas);
    tri.draw_klein_triangle(klein_canvas);
    tri.draw_poincare_triangle(poincare_canvas);

    tri.draw_halfspace_horocycles(halfspace_canvas);
    tri.draw_klein_horocycles(klein_canvas);
    tri.draw_poincare_horocycles(poincare_canvas);
}

// Triangle p1-p2-p4, p2-p3-p4
function draw_horocycle_distance_demo(control_canvas, cocircular_canvas, halfplane_canvas, distance, p1, p2, p3, p4) {
    cocircular_canvas.clear();
    halfplane_canvas.clear();
    control_canvas.draw();

    let lower_h = DecoratedHyperbolicTriangle.from_points(p3, p4, p2, false);
    let upper_t = new GeometricTriangle(p1, p2, p4);
    let lower_t = new GeometricTriangle(p2, p3, p4);

    let scaling_map = to_unit_circle(p2, p3, p4);
    // Given points v1, v2, v3, v4 which make up triangles A := v1-v2-v3 and B := v1-v2-v4,
    // returns a projective maps taking A to a triangle cocircular with B
    let map_to_cc = projective_map_to_circle(p4, p2, p1, p3);
    let upper_map = scaling_map.compose(map_to_cc);

    let scale  = cocircular_canvas.width / lower_h.scale_denom;
    let offset = cocircular_canvas.width / lower_h.offset_denom;
    cocircular_canvas.ctx.strokeStyle = lower_h.infinity_line;
    cocircular_canvas.ctx.lineWidth = 3;
    cocircular_canvas.ctx.beginPath();
    cocircular_canvas.ctx.arc(offset + scale * 0, offset - scale * 0, scale * 1, 0, 2 * Math.PI);
    cocircular_canvas.ctx.stroke();
    lower_t.draw_transformed(cocircular_canvas, scaling_map, tri_color_pair, 2);
    upper_t.draw_transformed(cocircular_canvas, upper_map,   tri_color_pair, 2);

    //lower_h.draw_klein_triangle(halfplane_canvas);
    //lower_h.draw_klein_vertex_ray(halfplane_canvas, distance);
    lower_h.draw_halfspace_triangle(halfplane_canvas);
    lower_h.draw_halfspace_horocycles(halfplane_canvas);
    lower_h.draw_halfspace_vertex_ray(halfplane_canvas, distance);

    let ray_bary = lower_h.klein_ray_endpoint_barycentric_coordinate(distance);
    let midpoint = p4.deep_copy().times(ray_bary).plus(p2.deep_copy().times(1-ray_bary));
    midpoint = scaling_map.apply(midpoint);

    let vertex = scaling_map.apply(lower_t.v2);

    let endpoint_p2_time = intersection_time(vertex, midpoint, upper_map.apply(p1), scaling_map.apply(p2));
    let endpoint_p4_time = intersection_time(vertex, midpoint, upper_map.apply(p1), scaling_map.apply(p4));

    let endpoint_choice = 2;
    if (endpoint_p2_time <= 0 || (endpoint_p4_time > 0 && endpoint_p4_time < endpoint_p2_time)) {
        endpoint_choice = 4; 
    }

    let endpoint;
    if (endpoint_choice == 2) {
        endpoint = vertex.deep_copy().plus(midpoint.deep_copy().minus(vertex).times(endpoint_p2_time));
    } else {
        endpoint = vertex.deep_copy().plus(midpoint.deep_copy().minus(vertex).times(endpoint_p4_time));
    }

    cocircular_canvas.ctx.strokeStyle = lower_h.ray_color;
    cocircular_canvas.ctx.lineWidth = 3;
    cocircular_canvas.ctx.beginPath();
    cocircular_canvas.ctx.moveTo(offset + scale * vertex.x, offset - scale * vertex.y);
    cocircular_canvas.ctx.lineTo(offset + scale * midpoint.x, offset - scale * midpoint.y);
    cocircular_canvas.ctx.lineTo(offset + scale * endpoint.x, offset - scale * endpoint.y);
    cocircular_canvas.ctx.stroke();

    let real_midpoint = scaling_map.inverse().apply(midpoint);
    let real_endpoint = upper_map.inverse().apply(endpoint);

    control_canvas.ctx.strokeStyle = lower_h.ray_color;
    control_canvas.ctx.lineWidth = 3;
    control_canvas.ctx.beginPath();
    control_canvas.ctx.moveTo(p3.x, -p3.y);
    control_canvas.ctx.lineTo(real_midpoint.x, -real_midpoint.y);
    control_canvas.ctx.lineTo(real_endpoint.x, -real_endpoint.y);
    control_canvas.ctx.stroke();
}

function setup() {
    /****************************************
    *          Horocycle Distance           *
    *****************************************/
    let horocycle_distance_canvas = new Canvas("horocycle_distance", 2/2.1);
    let horocycle_distance_halfplane_canvas = new Canvas("horocycle_distance_halfplane");
    let horocycle_distance_slider = document.getElementById("distance_slider");
    let horocycle_distance = horocycle_distance_slider.value / 1000;
    let hd_control_poly       = new PolyInput("hd_control_poly", function(poly) {
        draw_horocycle_distance_demo(hd_control_poly, horocycle_distance_canvas, horocycle_distance_halfplane_canvas, horocycle_distance, poly.points[0], poly.points[1], poly.points[2], poly.points[3]);
    }, 4, [[1,3]]);
    horocycle_distance_slider.oninput = function() {
        horocycle_distance = horocycle_distance_slider.value / 1000;
        hd_control_poly.update(hd_control_poly);
    }
    hd_control_poly.update(hd_control_poly);


    /****************************************
    *             Horocycle Demos           *
    *****************************************/
    let halfspace_horocycle_canvas = new Canvas("halfspace_horocycle");
    let poincare_horocycle_canvas  = new Canvas("poincare_horocycle");
    let klein_horocycle_canvas     = new Canvas("klein_horocycle");
    let control_triangle           = new PolyInput("control_triangle", function(tri) {
        draw_horocycle_demo(halfspace_horocycle_canvas, poincare_horocycle_canvas,
            klein_horocycle_canvas, tri.points[0], tri.points[1], tri.points[2]);
    });
    control_triangle.update(control_triangle);
}

setup();
