if ( WEBGL.isWebGLAvailable() === false ) {
        document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}

var camera, scene, renderer, mesh, material, controls, light, ctx, img;
var drawStartPos = new THREE.Vector2();

let points = []

function reset_particle_positions() {
    points = [];
    for (let i = 0; i < 500; i++) {
        let m = 0.25;

        let u1 = Math.random();
        let u2 = Math.random();

        // Gaussian variables using the box-mueller transform
        let rx = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        let ry = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
        points.push({q: m * rx, p: m * ry + 2});
    }
}

function to_coords(config) {
    let x = img.width  / 2 * (1 + config.q / Math.PI);
    let y = img.height / 2 * (1 + config.p/3.6);

    if (img.width) {
        x %= img.width; 
    }
    return {x: x, y: y};
}

function start() {
    reset_particle_positions();
    init();
    setupCanvasDrawing();
    animate();
}

function init() {
    document.getElementById("time_step").oninput = function() {
        document.getElementById("h").innerHTML = (this.value / 400).toFixed(2);
    }
    document.getElementById("time_step").addEventListener("mousedown", function(event) {
        //event.preventDefault();
        event.stopPropagation();
    }, true);


    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 2000 );
    camera.position.z = 500;
    //light = new THREE.PointLight( 0xffffff );
    light = new THREE.PointLight( 0xdedede );
    light.position.set(200,500,500);
    light.intensity = 0.75;
    light.decay = 2;
    camera.add(light);
    
    scene = new THREE.Scene();
    scene.add(camera);

    let ambient_light = new THREE.AmbientLight(0x606060);
    ambient_light.intensity = 1.25;
    scene.add(ambient_light);

    material = new THREE.MeshLambertMaterial();

    let cap_material = new THREE.MeshLambertMaterial();
    cap_material.color = new THREE.Color( 0xdedede );

    let materials = [material, cap_material];

    let geo = new THREE.CylinderGeometry( 50, 50, 300, 64 );
    
    geo.faces.forEach(function(face, i) {
        if (face.normal.y == 0) {
            face.materialIndex = 0; 
        } else {
            face.materialIndex = 1; 
        }
    });

    mesh = new THREE.Mesh( geo, materials );
    //mesh = new THREE.Mesh( new THREE.CylinderGeometry( 50, 50, 300, 64 ), material );
    scene.add(mesh);
    mesh.rotation.y += Math.PI;

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    let container = document.getElementById('render-canvas');
    let w = container.offsetWidth;
    let h = container.offsetHeight;
    renderer.setSize( w, h );
    container.appendChild(renderer.domElement);
    renderer.setPixelRatio( window.devicePixelRatio );

    controls = new THREE.OrbitControls(camera, renderer.domElement );
    //controls = new THREE.TrackballControls(camera);


    window.addEventListener( 'resize', onWindowResize, false );
}

// Sets up the drawing canvas and adds it as the material map
function setupCanvasDrawing() {
    // get canvas and context
    var drawingCanvas = document.getElementById('texture-canvas');
    ctx = drawingCanvas.getContext( '2d' );
    // draw white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect( 0, 0, 1257, 1443 );

    img = new Image();
    img.src = "lines.png";
    img.onload = function() {
        drawingCanvas.width  = img.width;
        drawingCanvas.height = img.height;

        ctx.beginPath();
        ctx.rect(0, 0, img.width, img.height);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.drawImage(img, 0, 0);

        material.map.needsUpdate = true;
    }
    // set canvas as material.map (this could be done to any map, bump, displacement etc.)
    material.map = new THREE.CanvasTexture( drawingCanvas );

}

function onWindowResize() {
    let container = document.getElementById('render-canvas');
    let w = container.offsetWidth;
    let h = container.offsetHeight;
    renderer.setSize( w, h );
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}

function flow_symplectic(h) {
    for (let i = 0; i < points.length; i++) {
        points[i].p -= h * Math.sin(points[i].q);
        points[i].q += h * points[i].p;
    }
}

function flow_explicit(h) {
    for (let i = 0; i < points.length; i++) {
        let new_q = points[i].q + h * points[i].p;
        let new_p = points[i].p - h * Math.sin(points[i].q);
        points[i] = {q: new_q, p: new_p};
    }
}

function implicit_objective(new_q, old_q, old_p, h) {
  return new_q + h * h * Math.sin(new_q) - old_q - h * old_p;
}

function implicit_objective_derivative(new_q, h) {
  return 1 + h * h * Math.cos(new_q);
}

function flow_implicit(h) {
    for (let i = 0; i < points.length; i++) {
        let old_q = points[i].q;
        let old_p = points[i].p;

        // Newton solver to solve the implicit equations
        // new_q = old_q + h * new_p
        // new_p = old_p - h * sin(new_q)
        
        let new_q = old_q;
        while (Math.abs(implicit_objective(new_q, old_q, old_p, h)) > 0.00001) {
            new_q -= implicit_objective(new_q, old_q, old_p, h) / implicit_objective_derivative(new_q, h);
        }

        let new_p = old_p - h * Math.sin(new_q);

        points[i] = {q: new_q, p: new_p};

    }
}

function animate() {
    requestAnimationFrame( animate );
    controls.update();
  
    let opt = document.getElementById("integrator");
    let integrator = opt.options[opt.selectedIndex].value;

    let h = document.getElementById("time_step").value / 400;
    if (integrator == "symplectic") {
        flow_symplectic(h); 
    } else if (integrator == "explicit") {
        flow_explicit(h); 
    } else if (integrator == "implicit") {
        flow_implicit(h); 
    }

    ctx.beginPath();
    ctx.rect(0, 0, img.width, img.height);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.drawImage(img, 0, 0);



    ctx.beginPath();
    ctx.fillStyle = "#f49700cc";
    let pt = to_coords(points[0]);
    for (let i = 1; i < points.length; i++) {
        pt = to_coords(points[i]);
        //ctx.lineTo(pt.x, pt.y); 
        ctx.moveTo(pt.x, pt.y);
        //let g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 20);
        //g.addColorStop(0, "#f49700cc");
        //g.addColorStop(1, "#f4970000");
        //ctx.fillStyle = g;
        //ctx.arc(pt.x, pt.y, 25, 0, 2 * Math.PI);
        ctx.arc(pt.x, pt.y, 10, 0, 2 * Math.PI);
    }
    ctx.fill();

    material.map.needsUpdate = true;

    //mesh.rotation.x += 0.01;
    //mesh.rotation.y -= 0.01;
    renderer.render(scene, camera);
}

function render() {
    renderer.render(scene, camera);
}
