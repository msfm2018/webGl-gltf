import * as THREE from "three";
import gsap from "gsap";
import * as dat from "dat.gui";
import { loadGlb, WxpKeyPressed1, processing, frameArea } from "./public/resources/common/utils.js";
import { Control, Light, Base, floor } from "./public/resources/common/base.js";
import global from "./public/resources/common/global.js";
import Vglobal from "./public/resources/common/vglobal.js";


let vg = new Vglobal();

//点击提示
let show1;

const init = () => {




    [vg.renderer, vg.scene] = Base(render)
    document.body.appendChild(vg.renderer.domElement);

    [vg.camera, vg.controls] = Control(vg.renderer, vg.scene);
    Light(vg.scene)

    window.addEventListener('keydown', (event) => WxpKeyPressed1(event, vg.renderer), false);


    let glb = loadGlb('model', "CheJian.glb", false, 1, 0);
    glb.then(gltf => {


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

        // //准备显示
        show1 = document.querySelector('#show1');


        document.body.addEventListener('click', selectHandler, false);

        function selectHandler(ev) {
            var x, y;
            if (ev.changedTouches) {
                x = ev.changedTouches[0].pageX;
                y = ev.changedTouches[0].pageY;
            } else {
                x = ev.clientX;
                y = ev.clientY;
            }
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
    //  //准备显示
    //  show1 = document.querySelector('#show1');
                    //找到删除 避免重复
                    var el = document.getElementById('login');
                    if (el)
                        el.parentNode.removeChild(el);

                    show1.style.display = "block";
                    show1.style.left = x + "px";
                    show1.style.top = y - 100 + "px";
                    var link = document.createElement('a');
                    link.setAttribute('href', '#');
                    link.setAttribute('id', 'login');
                    link.style.color = 'green';
                    link.innerHTML = '登录';
                    show1.appendChild(link);

                    // document.querySelector("#info").innerText="选中："+intersects[0].object.name;

                } else {
                    show1.style.display = "none"
                }
            } else {
                show1.style.display = "none"
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
                gsap.to(global.selectedObjects.position, { y: global.obj[global.selectedObjects.name].y, duration: 2, });
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
                gsap.to(global.selectedObjects.position, { y: 16, duration: 2, });
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

    document.body.addEventListener('dblclick', onDocumentMouseDown, true);

    function onDocumentMouseDown(event) {
        event.preventDefault();
        var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);

        vector = vector.unproject(vg.camera);

        var raycaster = new THREE.Raycaster(vg.camera.position, vector.sub(vg.camera.position).normalize());

        var intersects = raycaster.intersectObjects(vg.scene.children, true);
        var currObj = intersects[0].object;//currObj为点击到的第一个对象

        if (currObj.name == '016') {
            console.log('mem' + currObj.parent);//currObj.parent是menGroup
            var p1 = new THREE.Vector3(currObj.parent.position);
            {
                vg.controls.target = new THREE.Vector3(
                    currObj.position.x,
                    currObj.position.y,
                    currObj.position.z
                );

                gsap.to(vg.camera.position, {
                    x: currObj.position.x + 25,
                    y: currObj.position.y + 40,
                    z: currObj.position.z,
                    duration: 2,
                });
            }
            // } else   if (currObj.name == '08_1') {
        } else if (currObj.name == 'Plane008_1') {
            {
                vg.controls.target = new THREE.Vector3(
                    currObj.position.x,
                    currObj.position.y,
                    currObj.position.z
                );

                gsap.to(vg.camera.position, {
                    x: currObj.position.x + 25,
                    y: currObj.position.y + 40,
                    z: currObj.position.z,
                    duration: 2,
                });
            }
        }

    }

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
    // requestAnimationFrame(render);
}

window.addEventListener("DOMContentLoaded", () => {
    init()
})
