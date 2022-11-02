import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";


import gsap from "gsap";
import * as dat from "dat.gui";
import {loadGlb, WxpKeyPressed1, processing,frameArea} from "./public/resources/common/utils.js";
import {Control, Light, Base} from "./public/resources/common/base.js";
import global from "./public/resources/common/global.js";

let controls;
let renderer;
let scene;
let camera;
let mixer;
let composer, effectFXAA, outlinePass;

let selectedObjectsArr = [];
// 创建投射光线对象
const raycaster = new THREE.Raycaster();

// 鼠标的位置对象
const mouse = new THREE.Vector2();
const clock = new THREE.Clock();

let defaultMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
});

let fixMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffff00,
    metalness: 0.6,
    roughness: 0.4,
    clearcoat: 0.05,
    clearcoatRoughness: 0.05
})

const init = () => {

    [renderer, scene] = Base(render)
    document.body.appendChild(renderer.domElement);

    [camera, controls] = Control(renderer, scene);
    Light(scene)

    window.addEventListener('keydown', (event) => WxpKeyPressed1(event, renderer), false);


    let glb = loadGlb('model', "CheJian.glb", false, 1, 0);
    glb.then(gltf => {
        // setModelPosition(gltf.scene);
        console.log(gltf);
        mixer = new THREE.AnimationMixer(gltf.scene);
        var AnimationAction = mixer.clipAction(gltf.animations[0]);
        AnimationAction.timeScale = 0.7; //默认1，可以调节播放速度
        // AnimationAction.loop = THREE.LoopOnce; //不循环播放
        AnimationAction.clampWhenFinished = true;//暂停在最后一帧播放的状态
        AnimationAction.play();//播放动画
        gltf.scene.traverse(obj => {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;

                if (obj.name.indexOf('Plane') < 0) {
                    obj.material = defaultMaterial
                }

            }
        })

        // gltf.scene.scale.set(0.12, 0.2, 0.2);

        console.log(gltf);
        let component = gltf.scene.getObjectByName('camera-hj_dg');
        component.material=new THREE.MeshLambertMaterial({
            color: 0xffff00,
            emissive: 0xff0000
        });

        var mroot = gltf.scene;
        const box = new THREE.Box3().setFromObject(mroot);

        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());

        // set the camera to frame the box
        frameArea(boxSize * 0.6, boxSize, boxCenter, camera);




        scene.add(mroot);

        document.body.addEventListener('click', selectHandler, false);

        function selectHandler(ev) {
            mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            let intersects = raycaster.intersectObjects(gltf.scene.children, true);

            if (intersects.length > 0) {
                console.log(intersects[0].object.name);
                if ((intersects[0].object.name != 'Plane008') &&
                 (intersects[0].object.name != 'Plane008_1') &&
                 (intersects[0].object.name != 'camera-hj_dg') &&
                 (intersects[0].object.name != 'Plane006'))
                {
                    console.log('------------------')
                    if (global.preSelectedObjects) {
                        global.preSelectedObjects.material = defaultMaterial;
                    }

                global.selectedObjects = intersects[0].object;

                selectedObjectsArr = [];
                selectedObjectsArr.push(global.selectedObjects);
                outlinePass.selectedObjects = selectedObjectsArr;
                global.selectedObjects.material = fixMaterial;

                global.preSelectedObjects = global.selectedObjects;
            } else {

                }
            }
        }

        let btn1 = document.querySelector('#btn1');
        btn1.addEventListener('click', evt => {

            global.selectedObjects.material = new THREE.MeshPhysicalMaterial({
                color: 0xffff00, metalness: 1, roughness:1, clearcoat: 0.05, clearcoatRoughness: 0.05
            })
        });

        let btn2 = document.querySelector('#btn2');
        btn2.addEventListener('click', evt => {
            if(global.obj[global.selectedObjects.name]) {
                console.log(global.obj[global.selectedObjects.name])
                gsap.to(global.selectedObjects.position, {y: global.obj[global.selectedObjects.name].y, duration: 2,});
                delete global.obj[global.selectedObjects.name];
                global.selectedObjects.material = new THREE.MeshPhysicalMaterial({
                    color: 0xffff00, metalness: 0.6, roughness: 0.4, clearcoat: 0.05, clearcoatRoughness: 0.05
                })
            }
        });

        let btn3 = document.querySelector('#btn3');
        btn3.addEventListener('click', evt => {

            if(! global.obj[global.selectedObjects.name]){
            let vv = global.selectedObjects.clone();
            global.obj[global.selectedObjects.name] = vv.position;
            gsap.to(global.selectedObjects.position, {y: 16, duration: 2,});
            // gsap.to(global.selectedObjects.position, { y: 16,  duration: 2, yoyo: true, repeat: -1 });
            global.selectedObjects.material = new THREE.MeshPhysicalMaterial({
                color: 0xffff00, metalness: 0.6, roughness: 0.4, clearcoat: 0.05, clearcoatRoughness: 0.05
            })
            }else
            {
                console.log('----')
            }

        });
    });

    [composer, outlinePass] = processing(scene, camera, renderer);


    let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1);
    let floorMaterial = new THREE.MeshPhongMaterial({
        color: 0x77F28F,
        shininess: 0,
    });
    let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    floor.position.y = -2.1;
    floor.receiveShadow = true;
    scene.add(floor);


    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });


}
const render = (time) => {

    controls.update();
    composer.render();
    if (mixer) {
        mixer.update(clock.getDelta());
    }
}

window.addEventListener("DOMContentLoaded", () => {
    init()
})
