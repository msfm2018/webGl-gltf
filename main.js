import * as THREE from "three";
import gsap from "gsap";
import * as dat from "dat.gui";
import {loadGlb, WxpKeyPressed1, processing, frameArea} from "./public/resources/common/utils.js";
import {Control, Light, Base,floor} from "./public/resources/common/base.js";
import global from "./public/resources/common/global.js";
import Vglobal from "./public/resources/common/vglobal.js";


let vg = new Vglobal();
const init = () => {

    [vg.renderer, vg.scene] = Base(render)
    document.body.appendChild(vg.renderer.domElement);

    [vg.camera, vg.controls] = Control(vg.renderer, vg.scene);
    Light(vg.scene)

    window.addEventListener('keydown', (event) => WxpKeyPressed1(event, renderer), false);


    let glb = loadGlb('model', "CheJian.glb", false, 1, 0);
    glb.then(gltf => {
        // setModelPosition(gltf.scene);
        console.log(gltf);
        vg.mixer = new THREE.AnimationMixer(gltf.scene);
        var AnimationAction = vg.mixer.clipAction(gltf.animations[0]);
        AnimationAction.timeScale = 0.7; //默认1，可以调节播放速度
        // AnimationAction.loop = THREE.LoopOnce; //不循环播放
        AnimationAction.clampWhenFinished = true;//暂停在最后一帧播放的状态
        AnimationAction.play();//播放动画
        gltf.scene.traverse(obj => {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;

                if (obj.name.indexOf('Plane') < 0) {
                    obj.material = vg.defaultMaterial
                }

            }
        })

        //某一个部件改变外观
        let component = gltf.scene.getObjectByName('camera-hj_dg');
        component.material = new THREE.MeshLambertMaterial({
            color: 0xffff00,
            emissive: 0xff0000
        });

        var mroot = gltf.scene;
        const box = new THREE.Box3().setFromObject(mroot);

        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());

        // set the camera to frame the box
        frameArea(boxSize * 0.6, boxSize, boxCenter, vg.camera);


        vg.scene.add(mroot);

        document.body.addEventListener('click', selectHandler, false);

        function selectHandler(ev) {
            vg.mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
            vg.mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;

            vg.raycaster.setFromCamera(vg.mouse, vg.camera);

            let intersects = vg.raycaster.intersectObjects(gltf.scene.children, true);

            if (intersects.length > 0) {
                console.log(intersects[0].object.name);
                if ((intersects[0].object.name != 'Plane008') &&
                    (intersects[0].object.name != 'Plane008_1') &&
                    (intersects[0].object.name != 'camera-hj_dg') &&
                    (intersects[0].object.name != 'Plane006')) {
                    if (global.preSelectedObjects) {
                        global.preSelectedObjects.material = vg.defaultMaterial;
                    }

                    global.selectedObjects = intersects[0].object;

                    let tmp = [];
                    tmp.push(global.selectedObjects);
                    vg.outlinePass.selectedObjects = tmp;
                    global.selectedObjects.material = vg.fixMaterial;

                    global.preSelectedObjects = global.selectedObjects;
                } else {

                }
            }
        }

        let btn1 = document.querySelector('#btn1');
        btn1.addEventListener('click', evt => {

            global.selectedObjects.material = new THREE.MeshPhysicalMaterial({
                color: 0xffff00, metalness: 1, roughness: 1, clearcoat: 0.05, clearcoatRoughness: 0.05
            })
        });

        //换皮肤颜色
        let btn2 = document.querySelector('#btn2');
        btn2.addEventListener('click', evt => {
            if (global.obj[global.selectedObjects.name]) {
                gsap.to(global.selectedObjects.position, {y: global.obj[global.selectedObjects.name].y, duration: 2,});
                delete global.obj[global.selectedObjects.name];
                global.selectedObjects.material = new THREE.MeshPhysicalMaterial({
                    color: 0xffff00, metalness: 0.6, roughness: 0.4, clearcoat: 0.05, clearcoatRoughness: 0.05
                })
            }
        });

        let btn3 = document.querySelector('#btn3');
        btn3.addEventListener('click', evt => {

            if (!global.obj[global.selectedObjects.name]) {
                let vv = global.selectedObjects.clone();
                global.obj[global.selectedObjects.name] = vv.position;
                gsap.to(global.selectedObjects.position, {y: 16, duration: 2,});
                // gsap.to(global.selectedObjects.position, { y: 16,  duration: 2, yoyo: true, repeat: -1 });
                global.selectedObjects.material = new THREE.MeshPhysicalMaterial({
                    color: 0xffff00, metalness: 0.6, roughness: 0.4, clearcoat: 0.05, clearcoatRoughness: 0.05
                })
            } else {
                console.log('----')
            }

        });
    });

    [vg.composer, vg.outlinePass] = processing(vg.scene, vg.camera, vg.renderer);


    floor(vg.scene);

    window.addEventListener("resize", () => {
        vg.camera.aspect = window.innerWidth / window.innerHeight;
        vg.camera.updateProjectionMatrix();
        vg.renderer.setSize(window.innerWidth, window.innerHeight);
    });


}
// Function - Opening rotate
let initRotate = 0;
var loaded = false;
function initialRotation() {
    initRotate++;
    if (initRotate <= 120) {
        global.theModel.rotation.y += Math.PI / 60;
    } else {
        loaded = true;
    }
}
const render = (time) => {

    vg.controls.update();
    vg.composer.render();
    if (vg.mixer) {
        vg.mixer.update(vg.clock.getDelta());
    }
    if (global.theModel != null && loaded == false) {
        initialRotation();
        // DRAG_NOTICE.classList.add('start');
    }
}

window.addEventListener("DOMContentLoaded", () => {
    init()
})
