import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

function Base(render) {
    let renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // 开启场景中的阴影贴图
    renderer.shadowMap.enabled = true;
    renderer.physicallyCorrectLights = true;
    renderer.setAnimationLoop(render);


    let scene = new THREE.Scene();
    scene.background = new THREE.Color(0xB3CEFB);
    scene.fog = new THREE.Fog(scene.background, 1, 1000);

    return [renderer, scene];
}

function Control(renderer, scene) {
    let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    camera.position.set(10, 6, -1);
    // camera.position.set(0, 6, 0);
    scene.add(camera);
    let controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    // controls.maxPolarAngle = Math.PI /1;
    // controls.minPolarAngle = Math.PI / 1;
    controls.enableZoom = true;
    return [camera, controls];
}


function Light(scene) {
    // const light = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
    // scene.add(light);
    //
    let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(4, 10, 8);
    directionalLight.castShadow = true;
    // directionalLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    // directionalLight.shadow.bias = -0.001;  // value 自行调节
    let dhelper = new THREE.DirectionalLightHelper(directionalLight, 5, 0xff0000);

    let hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.4);
    hemisphereLight.position.set(5, 6, 4);
    let hHelper = new THREE.HemisphereLightHelper(hemisphereLight, 5);
    // scene.add(dhelper);
    // scene.add(hHelper);
    scene.add(directionalLight);
    scene.add(hemisphereLight);


    var ambientLight = new THREE.AmbientLight(0xffffff);

    var spotLight = new THREE.SpotLight(0xffffff, 0.8);
    spotLight.position.set(5, 14, 4)

    spotLight.exponent = 3;
    spotLight.angle = Math.PI / 3;
    spotLight.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(spotLight, ambientLight);
}

export {Control, Light, Base}