'use strict';
{

    let wdth = 0.45 * window.innerWidth;;
    let hght = 0.25 * window.innerWidth;;
    let t_scale = 0.9;
    let trajectoryRes = 50;

    function depth(x, y) {
        return 0.75 * (1+x) * (1-x) * (1+y) * (1-y) * (1 + 0.25 * Math.sin(10 * x) * Math.cos(10 * y + 0.234));
    }

    function v(a, b) {
        a += 0.1;
        b += 0.1;
        let s = 8;
        let r = 0.5;
        return {x: +(1 + r * (Math.cos(s * a) - Math.sin(s * b))),
                y: -(1 + r * (Math.sin(s * a) + Math.cos(s * b)))};
    }

    function p(t) {
        t *= t_scale;
        let px = 0;
        let py = 0;
        for (let i = 1; i < trajectoryRes; i++) {
            let dt = Math.abs(t) / (trajectoryRes - 1);
            let dx = v(px, py);
            px += Math.sign(t) * dt * dx.x;
            py += Math.sign(t) * dt * dx.y;
        }
        return {x: px, y: py};
    }

    function getPath() {
        let dPath = []
        let x = 0;
        let y = 0;
        for (let i = 0; i < trajectoryRes; i++) {
            dPath.push(depth(x, y));
            let t = t_scale / (trajectoryRes - 1);
            let dx = v(x, y);
            x -= t * dx.x;
            y -= t * dx.y;

        }
        dPath.reverse();
        x = 0;
        y = 0;
        for (let i = 0; i < trajectoryRes; i++) {
            if (i > 0) {
                dPath.push(depth(x, y));
            }
            let t = t_scale / (trajectoryRes - 1);
            let dx = v(x, y);
            x += t * dx.x;
            y += t * dx.y;
        }
        return dPath;
    }

    let dPath = getPath();

    function plotDepth(t, d) {
        let c = document.getElementById("lie-derivative-plot");
        let ctx = c.getContext("2d");
        ctx.canvas.width = wdth;
        ctx.canvas.height = hght;
        ctx.save();
        ctx.transform(wdth/2, 0, 0, wdth/2, wdth/2, hght/8);
        let res = 80;
        ctx.beginPath();
        ctx.lineWidth = 0.01;
        ctx.moveTo(-1, dPath[0]);
        for (let i = 1; i < dPath.length; i++) {
            let t = -1 + 2. * i / (dPath.length-1);
            ctx.lineTo(t, dPath[i]);
        }
        ctx.stroke();

        ctx.beginPath();
        let pos = p(t);
        ctx.arc(t, depth(pos.x, pos.y), 0.05, 0, 2 * Math.PI, false);
        ctx.fillStyle='green';
        ctx.fill();

        ctx.restore();
        ctx.font = "italic 30px Palatino";
        ctx.fillText("z(t)", c.width/4, c.height/2);
    }

    let scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    let camera = new THREE.PerspectiveCamera( 75, wdth / hght, 0.1, 1000 );

    let renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize( wdth, hght);

    let controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;

    let plainGeo = new THREE.Geometry();
    const resolution = 50;
    const min = -1.;
    const max = 1.;
    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            let x = min +  i * (max-min) / (resolution-1);
            let y = min +  j * (max-min) / (resolution-1);
            plainGeo.vertices.push(new THREE.Vector3(x, -depth(x, y), y));
        }
    }

    let indices = [];
    for (let i = 0; i < resolution - 1; i++) {
        for (let j = 0; j < resolution - 1; j++) {
            let a = (i+0) + (j+0) * resolution;
            let b = (i+1) + (j+0) * resolution;
            let c = (i+1) + (j+1) * resolution;
            let d = (i+0) + (j+1) * resolution;
            plainGeo.faces.push(new THREE.Face3(a, b, d), new THREE.Face3(b, c, d));
        }
    }
    plainGeo.computeVertexNormals();

    let geometry = plainGeo;
    let material = new THREE.MeshPhongMaterial( { color: 0x1b1f8a, side: THREE.DoubleSide, opacity: 0.4, transparent: true, depthWrite: false } );
    let cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    const skyColor = 0xB1E1FF;  // light blue
    const groundColor = 0xB97A20;  // brownish orange
    const intensity = 0.4;
    const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(hemiLight);

    const ptLight1 = new THREE.PointLight(0xffffff, 0.8);
    ptLight1.position.set(0, 10, 10);
    scene.add(ptLight1);
    const ptLight2 = new THREE.PointLight(0xffffff, 0.5);
    ptLight2.position.set(0, 10, -10);
    scene.add(ptLight2);

    let sphereGeo = new THREE.SphereBufferGeometry(0.04, 32, 32);
    let sphereMat = new THREE.MeshPhongMaterial({color: 0x7700ff });
    let sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    let lowSphereGeo = new THREE.SphereBufferGeometry(0.02, 32, 32);
    let lowSphereMat = new THREE.MeshPhongMaterial({color: 0x7700ff });
    let lowSphere = new THREE.Mesh(lowSphereGeo, lowSphereMat);
    scene.add(lowSphere);

    let trajectoryGeo = new THREE.Geometry();
    let surfaceTrajectoryGeo = new THREE.Geometry();
    let reverseTrajectoryVs = [];
    let reverseSurfaceTrajectoryVs = [];
    let x = 0;
    let y = 0;
    for (let i = 1; i < trajectoryRes; i++) {
        reverseTrajectoryVs.push(new THREE.Vector3(x, -depth(x, y), y));
        reverseSurfaceTrajectoryVs.push(new THREE.Vector3(x, 0, y));
        let t = t_scale / (trajectoryRes - 1);
        let dx = v(x, y);
        x -= t * dx.x;
        y -= t * dx.y;

    }
    surfaceTrajectoryGeo.vertices = reverseSurfaceTrajectoryVs.reverse();
    trajectoryGeo.vertices = reverseTrajectoryVs.reverse();
    x = 0;
    y = 0;
    for (let i = 1; i < trajectoryRes; i++) {
        surfaceTrajectoryGeo.vertices.push(new THREE.Vector3(x, 0, y));
        trajectoryGeo.vertices.push(new THREE.Vector3(x, -depth(x, y), y));
        let t = t_scale / (trajectoryRes - 1);
        let dx = v(x, y);
        x += t * dx.x;
        y += t * dx.y;
    }
    let trajectoryMat = new THREE.LineBasicMaterial({color: 0xff00f0});
    let trajectory = new THREE.Line(trajectoryGeo, trajectoryMat);
    scene.add(trajectory);

    let surfaceTrajectoryMat = new THREE.LineDashedMaterial({color: 0xff00f0, dashSize: 0.05, gapSize: 0.05});
    let surfaceTrajectory = new THREE.Line(surfaceTrajectoryGeo, surfaceTrajectoryMat);
    surfaceTrajectory.computeLineDistances();
    surfaceTrajectory.material.linewidth=2;
    scene.add(surfaceTrajectory);

        let arrowRes = 15;
        for (let i = 0; i < arrowRes; i++) {
            for (let j = 0; j < arrowRes; j++) {
                let x = -1 + i * 2. / (arrowRes - 1);
                let y = -1 + j * 2. / (arrowRes - 1);
                let arrowV = v(x, y);
                let from = new THREE.Vector3(x, -0.02, y);
                let dir = new THREE.Vector3(arrowV.x, 0, arrowV.y);
                let arrow = new THREE.ArrowHelper(dir.normalize(), from, 0.1 * dir.length(), 0x000077, 0.02, 0.02);
                scene.add(arrow);
            }
        }


    camera.position.set(0.45, 0.45, 0.45);
    controls.update();

    const gui = new dat.GUI({autoPlace: false});
    let GLOB = {t: 0};
    gui.add(GLOB, "t", -1, 1, 0.01);
    function animate() {
        requestAnimationFrame( animate );

        let pos = p(GLOB.t);
        sphere.position.set(pos.x, 0, pos.y);
        lowSphere.position.set(pos.x, -depth(pos.x, pos.y), pos.y);

        // required if controls.enableDamping or controls.autoRotate are set to true
        controls.update();

        renderer.render( scene, camera );

        plotDepth(GLOB.t, depth(x, y));
    }

    let lieDerivativeContainer = document.getElementById("lie-derivative-example");
    lieDerivativeContainer.appendChild( gui.domElement );
    lieDerivativeContainer.appendChild( renderer.domElement );
    animate();

}
