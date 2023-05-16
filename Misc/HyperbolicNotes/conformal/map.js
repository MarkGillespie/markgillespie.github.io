let canvasWidth = 0;
let canvasHeight = 0;

class Color {
  constructor(h, s, l) {
    this.h = h;
    this.s = s;
    this.l = l;
  }

  colorString() {
    return "hsl(" + this.h + ", " + this.s + "%, " + this.l + "%)";
  }
}

function randomColor() {
  let h = Math.random() * 160 + 80;
  let s = Math.random() * 20 + 30;
  let l = Math.random() * 30 + 40;
  return "hsl(" + h + ", " + s + "%, " + l + "%)";
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  transformedX(a, b, c) {
     return 0.2 * canvasWidth + 0.6 * canvasWidth * c * this.x / (c * this.x + b * this.y + a * (1 - this.x - this.y));
  }

  transformedY(a, b, c) {
     return 0.8 * canvasWidth - 0.6 * canvasWidth * b * this.y / (c * this.x + b * this.y + a * (1 - this.x - this.y));
  }
}

class Triangle {
  constructor(x1, y1, x2, y2, x3, y3) {
    this.v1 = new Point(x1, y1); 
    this.v2 = new Point(x2, y2); 
    this.v3 = new Point(x3, y3);
    this.color = randomColor();
  }

  drawTransformed(ctx, a, b, c) {
    ctx.fillStyle = this.color;
    ctx.beginPath(); 
    ctx.moveTo(this.v1.transformedX(a,b,c), this.v1.transformedY(a,b,c));
    ctx.lineTo(this.v2.transformedX(a,b,c), this.v2.transformedY(a,b,c));
    ctx.lineTo(this.v3.transformedX(a,b,c), this.v3.transformedY(a,b,c));
    ctx.fill();
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

  drawTransformed(ctx, a, b, c) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 5;
    ctx.beginPath(); 
    ctx.moveTo(this.points[0].transformedX(a,b,c), this.points[0].transformedY(a,b,c));
    for (let i = 1; i < this.points.length; i++) {
      // Only draw the part of the circumcircle that shows up on screen.
      // If you don't do this, you get weird hyperbola artifacts when you stretch the triangle a lot
      if (this.points[i].transformedX(a,b,c) > 0
          && this.points[i].transformedX(a,b,c) < canvasWidth
          && this.points[i].transformedY(a,b,c) > 0
          && this.points[i].transformedY(a,b,c) < canvasHeight) {
        ctx.lineTo(this.points[i].transformedX(a,b,c), this.points[i].transformedY(a,b,c));
      } else {
        ctx.moveTo(this.points[i].transformedX(a,b,c), this.points[i].transformedY(a,b,c));
      }
    }
    ctx.lineTo(this.points[0].transformedX(a,b,c), this.points[0].transformedY(a,b,c));
    ctx.stroke();
  }
}

class Triangulation {
  constructor(n) {
    this.circle = new Circle(0.5, 0.5, 1 / Math.sqrt(2), 100.0);
    this.triangles = [];
    let step = Math.pow(2, -n);
    for (let i = 0; i < Math.pow(2, n); i++) {
      let t = new Triangle(i * step, 0, (i+1)*step, 0, i*step, step);
      this.triangles.push(t);
    }

    for (let j = 0; j < Math.pow(2, n)-1; j++) {
      for (let i = 0; i < Math.pow(2, n) - j-1; i++) {
        let t = new Triangle((i+1) * step, (j+1) * step, (i+1)*step, j * step, i*step, (j+1)*step);
        this.triangles.push(t);
      } 
      for (let i = 0; i < Math.pow(2, n) - j; i++) {
        let t = new Triangle(i * step, j * step, (i+1)*step, j * step, i*step, (j+1)*step);
        this.triangles.push(t);
      } 
    }
    let t = new Triangle(0, 1 - step, step, 1 - step, 0, 1);
    this.triangles.push(t);
  }

  drawTransformed(ctx, a, b, c) {
    this.circle.drawTransformed(ctx, a, b, c);
    this.triangles.forEach(function(tri) {
      tri.drawTransformed(ctx, a, b, c);
    });
  }
}

function draw(ctx)  {	
}

function setup() {
  let canvas = document.getElementById("projective_linear");
  canvasWidth = canvas.width;
  canvasHeight = canvas.height;
  let ctx = canvas.getContext("2d");
  let tri = new Triangulation(4);

  let aSlider = document.getElementById("aSlider");
  let bSlider = document.getElementById("bSlider");
  let cSlider = document.getElementById("cSlider");
  aSlider.value = 0;
  bSlider.value = 0;
  cSlider.value = 0;

  let a = Math.pow(2, aSlider.value/20);
  let b = Math.pow(2, bSlider.value/20);
  let c = Math.pow(2, cSlider.value/20);

  aSlider.oninput = function() {
    a = Math.pow(2, this.value/20); 
    document.getElementById("aVal").innerHTML = (this.value/20).toFixed(1);
    ctx.fillStyle="hsl(120, 0%, 90%)";
    ctx.rect(0, 0, 800, 800);
    ctx.fill();
    tri.drawTransformed(ctx, a, b, c);
  }
  bSlider.oninput = function() {
    b = Math.pow(2, this.value/20); 
    document.getElementById("bVal").innerHTML = (this.value/20).toFixed(1);
    ctx.fillStyle="hsl(120, 0%, 90%)";
    ctx.rect(0, 0, 800, 800);
    ctx.fill();
    tri.drawTransformed(ctx, a, b, c);
  }
  cSlider.oninput = function() {
    c = Math.pow(2, this.value/10); 
    document.getElementById("cVal").innerHTML = (this.value/10).toFixed(1);
    ctx.fillStyle="hsl(120, 0%, 90%)";
    ctx.rect(0, 0, 800, 800);
    ctx.fill();
    tri.drawTransformed(ctx, a, b, c);
  }

  ctx.fillStyle="hsl(120, 0%, 90%)";
  ctx.rect(0, 0, 800, 800);
  ctx.fill();

  tri.drawTransformed(ctx, a, b, c);
}

setup();
