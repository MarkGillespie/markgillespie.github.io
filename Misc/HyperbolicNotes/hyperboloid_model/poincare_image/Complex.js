class Complex {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  re() {
    return this.a; 
  }

  im() {
    return this.b; 
  }
}

function neg(z) {
  return new Complex(-z.re(), -z.im());
}

function conj(z) {
  return new Complex(z.re(), -z.im());
}

function mod(z) {
  return Math.sqrt(z.re() * z.re() + z.im() * z.im());
}

function arg(z) {
  return Math.atan2(z.im(), z.re());
}

function from_polar(r, t) {
  return new Complex(r * Math.cos(t), r * Math.sin(t));
}

function recip(z) {
  let r = mod(z);
  let t = arg(z);
  return from_polar(1/r, -t);
}

function plus(z, w) {
  return new Complex(z.re() + w.re(), z.im() + w.im());
}

function sum_many(zs) {
  let total = new Complex(0, 0);
  zs.forEach(function(z){total = plus(total, z)});
  return total;
}

function minus(z, w) {
  return plus(z, neg(w));
}

function times(z, w) {
  return new Complex(z.re() * w.re() - z.im() * w.im(), z.re() * w.im() + z.im() * w.re());
}

function div(z, w) {
  return times (z, recip(w));
}

// Returns 1 if z is clockwise (or parallel to) from w, -1 otherwise
function det_sign(z, w) {
  if (z.re() * w.im() - z.im() * w.re() >= 0) {
    return 1;
  } else {
    return -1; 
  }
}

// Automorphism of the unit disk
class Automorphism {
  constructor(a, l) {
    this.a = a;
    this.l = l;
  }

  transformation() {
    let one = new Complex(1, 0);
    let l = this.l;
    let a = this.a;
    return function(z) {
      return times(l, div(minus(z, a),
                          minus(times(conj(a), z), one)))
    };
  }

  apply(z) {
    let one = new Complex(1, 0);
    return times(this.l, div(minus(z, this.a),
                             minus(times(conj(this.a), z), one)))

  }
}

function identity_automorphism() {
  return new Automorphism(new Complex(0, 0), new Complex(-1, 0));
}


// Invert an automorphism of the unit disk
function inverse(f) {
  return new Automorphism(times(f.a, f.l), recip(f.l))
}

// Compose two automorphisms of the unit disk
// returns f o g (might actually be g o f?)
function compose(f, g) {
  let a = f.a;
  let b = times(g.a, g.l);
  let one = new Complex(1, 0);
  let rotation = times(times(f.l, g.l),
                       div(minus(times(a, conj(b)), one),
                           minus(one, times(b, conj(a)))));
  let c = div(minus(b, a), times(minus(one, times(a, conj(b))), g.l));
  return new Automorphism(c, rotation);
}

// creates an automorphism which sends a to 0 and b to the real axis
function standard_automorphism(a, b) {
  let send_to_0 = new Automorphism(a, new Complex(1, 0));
  let image_of_b = send_to_0.apply(b);
  let angle = arg(image_of_b);

  return new Automorphism(a, from_polar(1, -angle));
}

// creates an automorphism which sends a to b
function translate_point(a, b) {
  let a_to_0 = new Automorphism(a, new Complex(1, 0));
  let b_to_0 = new Automorphism(b, new Complex(1, 0));

  return compose(inverse(b_to_0), a_to_0);
}
