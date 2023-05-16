class Octagon {
  constructor(points, depth) {
    this.points = [];
    this.arcs = [];
    for (let i = 0; i < 8; i++) {
      let center = center_point(points[i], points[(i+1)%8]);
      this.points.push(points[i]);
      if (depth > 0) {
        this.points.push(center);
      }
      this.arcs.push(new Arc (points[i], center, points[(i+1)%8]));
    }
    this.color = random_color();
    this.hovered = false;
  }

  draw(automorphism) {
    draw_poly(this.points, this.color.color_string(), automorphism);
    draw_arcs(this.arcs, automorphism);
  }

  translate(automorphism) {
    for (let i = 0; i < this.points.length; i++) {
      this.points[i] = automorphism.apply(this.points[i]); 
    }
    for (let i = 0; i < this.arcs.length; i++) {
      this.arcs[i].transform(automorphism);
    }
  }
}

function centered_octagon(radius, depth) {
  let points = [];
  for (let i = 0; i < 8; i++) {
    points.push(from_polar(radius, Math.PI / 8 + i * Math.PI / 4));
  }
  return new Octagon(points, depth);
}
