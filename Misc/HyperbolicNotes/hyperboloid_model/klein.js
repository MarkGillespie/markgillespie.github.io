if ( WEBGL.isWebGLAvailable() === false ) {
        document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}

var camera, scene, renderer, front_mesh, back_mesh, controls, light, ctx, klein_img, out_material, in_material;
var drawStartPos = new THREE.Vector2();

function to_coords(config) {
    let x = klein_img.width  / 2 * (1 + config.q / Math.PI);
    let y = klein_img.height / 2 * (1 + config.p/3.6);

    if (klein_img.width) {
        x %= klein_img.width;
    }
    return {x: x, y: y};
}

function start() {
    init();
    animate();
}

function construct_hyperboloid_geometry() {
    let hype = new THREE.PlaneGeometry(5, 5, 80, 80);
    hype.vertices.forEach(function(v, i) {
        v.z = Math.sqrt(1 + v.x * v.x + v.y * v.y);
    });
    hype.computeVertexNormals();
    hype.computeFaceNormals();

    let faces = hype.faces;
    hype.faceVertexUvs[0] = [];
    for (let i = 0; i < faces.length; i++) {
        let v1 = hype.vertices[faces[i].a];
        let v2 = hype.vertices[faces[i].b];
        let v3 = hype.vertices[faces[i].c];

        // Klein
        // hype.faceVertexUvs[0].push([
        //     new THREE.Vector2((v1.x/v1.z+1)/2, (v1.y/v1.z+1)/2),
        //     new THREE.Vector2((v2.x/v2.z+1)/2, (v2.y/v2.z+1)/2),
        //     new THREE.Vector2((v3.x/v3.z+1)/2, (v3.y/v3.z+1)/2)
        // ]);

        // Poincare
        hype.faceVertexUvs[0].push([
            new THREE.Vector2((v1.x/(1 + v1.z)+1)/2, (v1.y/(1 + v1.z)+1)/2),
            new THREE.Vector2((v2.x/(1 + v2.z)+1)/2, (v2.y/(1 + v2.z)+1)/2),
            new THREE.Vector2((v3.x/(1 + v3.z)+1)/2, (v3.y/(1 + v3.z)+1)/2)
        ]);
    }

    hype.vertices.forEach(function(v, i) {
        v.z -= 1;
    });
    hype.rotateX(-Math.PI / 2);

    return hype;
    //return new THREE.PlaneGeometry(100, 100, 32);
}

function init() {
    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 2000 );
    camera.position.z = 10;
    //light = new THREE.PointLight( 0xffffff );
    light = new THREE.PointLight( 0xdedede );
    light.position.set(200,-500,500);
    light.intensity = 0.75;
    light.decay = 2;
    camera.add(light);

    let top_light = new THREE.PointLight( 0xdedede );
    top_light.position.set(0,500, 0);
    top_light.intensity = 0.55;
    top_light.decay = 2;
    camera.add(top_light);

    scene = new THREE.Scene();
    scene.add(camera);

    let ambient_light = new THREE.AmbientLight(0x606060);
    ambient_light.intensity = 1.25;
    scene.add(ambient_light);

    let out_texture = new THREE.TextureLoader().load("images/devilsangels.jpg");
    //let out_texture = new THREE.TextureLoader().load("images/grid.png");
    let in_texture  = new THREE.TextureLoader().load("images/tess.png");
    //material = new THREE.MeshLambertMaterial({side: THREE.DoubleSide});
    out_material = new THREE.MeshLambertMaterial({side: THREE.BackSide,
                                                  map: out_texture,
                                                  transparent: true,
                                                  opacity: 0.85,
                                                  depthWrite: false});
    in_material  = new THREE.MeshLambertMaterial({side: THREE.FrontSide,
                                                  map: in_texture,
                                                  transparent: true,
                                                  opacity: 0.65,
                                                  depthWrite: false});



    setupCanvasDrawing();


    //let geo = new THREE.CylinderGeometry( 50, 50, 300, 64 );
    let geo = construct_hyperboloid_geometry();

    let out_mesh = new THREE.Mesh( geo, out_material );
    let in_mesh  = new THREE.Mesh( geo, in_material );
    out_mesh.rotation.y += Math.PI;
    in_mesh.rotation.y += Math.PI;

    scene.add(in_mesh);
    scene.add(out_mesh);

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    //renderer.setClearColor( 0xBEEAFB );

    let container = document.getElementById('render-canvas');
    let w = container.offsetWidth;
    let h = container.offsetHeight;
    renderer.setSize( w, h );
    renderer.sortObjects = false;
    container.appendChild(renderer.domElement);
    renderer.setPixelRatio( window.devicePixelRatio );

    controls = new THREE.OrbitControls(camera, renderer.domElement );
    //controls = new THREE.TrackballControls(camera);


    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
    let container = document.getElementById('render-canvas');
    let w = container.offsetWidth;
    let h = container.offsetHeight;
    renderer.setSize( w, h );
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}

// Sets up the drawing canvas and adds it as the material map
function setupCanvasDrawing() {
    // get canvas and context
    let drawingCanvas = document.getElementById('texture-canvas');
    ctx = drawingCanvas.getContext( '2d' );

    let canvas_texture_map = new THREE.CanvasTexture( drawingCanvas );

    // set canvas as material.map (this could be done to any map, bump, displacement etc.)
    out_material.map = canvas_texture_map;
    in_material.map  = canvas_texture_map;
}

function animate() {
    requestAnimationFrame( animate );
    controls.update();

    //mesh.rotation.x += 0.01;
    //mesh.rotation.y -= 0.01;
    renderer.render(scene, camera);
    out_material.map.needsUpdate = true;
}

function render() {
    renderer.render(scene, camera);
}

start();
