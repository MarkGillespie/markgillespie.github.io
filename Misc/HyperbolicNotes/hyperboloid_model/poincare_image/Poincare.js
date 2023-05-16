let radius = 0.4055;
let octagon = centered_octagon(radius, 0);
var mouse_pressed = false;
var old_mouse_pos = 0;
var global_automorphism = identity_automorphism();
var current_automorphism = identity_automorphism();

translations = [];
for (let i = 0; i < 8; i++) {
  let first  = standard_automorphism(octagon.points[i], octagon.points[(8+i-1) % 8]);
  let second = standard_automorphism(octagon.points[(i+3) % 8], octagon.points[(i+4) % 8]);
  let composition = compose(inverse(first), second);
  translations.push(composition);
}

octagons = [centered_octagon(radius, 1)];
for (let i = 0; i < 8; i++) {
  let new_octagon = centered_octagon(radius, 1);
  new_octagon.translate(translations[i]);
  octagons.push(new_octagon);

  for (let j = -2; j < 2; j++) {
    let new_octagon = centered_octagon(radius, 1);
    let j_translation = compose(translations[i], translations[(i+j+8)%8]);
    new_octagon.translate(j_translation);
    octagons.push(new_octagon);

    for (let k = -2; k < 2; k++) {
      let new_octagon = centered_octagon(radius, 1);
      let k_translation = compose(j_translation, translations[(i+j+k+8)%8]);
      new_octagon.translate(k_translation);
      octagons.push(new_octagon);
    }
  }
}

function down_listener(e) {
  old_mouse_pos = get_mouse_pos(c, e);

  // Restrict dragging to happen when you're in the Poincare disk
  if (mod(old_mouse_pos) < 1) {
    mouse_pressed = true;
  }
  e.preventDefault();
}

function up_listener(e) {
  mouse_pressed = false;
  global_automorphism = compose(current_automorphism, global_automorphism);
  current_automorphism = identity_automorphism();
  draw_scene(compose(current_automorphism, global_automorphism));
  e.preventDefault();
}

function over_listener(e) {
  let mouse_pos = get_mouse_pos(c, e);
  if (mod(mouse_pos) > 1) {
    mouse_pos = div(mouse_pos, new Complex(mod(mouse_pos), 0));
  }

  if (mouse_pressed) {
     current_automorphism = translate_point(old_mouse_pos, mouse_pos);
  }

  let auto = compose(current_automorphism, global_automorphism);
  draw_scene(auto);
  e.preventDefault();
}

function init_octagons() {
  c.addEventListener('mousedown', down_listener);
  c.addEventListener('touchstart', down_listener);

  c.addEventListener('mouseup', up_listener);
  c.addEventListener('touchup', up_listener);

  c.addEventListener('mousemove', over_listener);
  c.addEventListener('touchend', over_listener);
}
