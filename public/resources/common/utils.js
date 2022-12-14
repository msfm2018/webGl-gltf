import * as THREE from "three";

import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";
import {EffectComposer} from "three/addons/postprocessing/EffectComposer.js";
import {RenderPass} from "three/addons/postprocessing/RenderPass.js";
import {OutlinePass} from "three/addons/postprocessing/OutlinePass.js";
import {ShaderPass} from "three/addons/postprocessing/ShaderPass.js";
import {FXAAShader} from "three/addons/shaders/FXAAShader.js";
import global from "./global.js";

function loadGlb(path,
                 modelName,
                 setCenter,
                 scale,
                 position,
                 rotation
) {
    let scaleVec3, positionVec3;
    if (typeof scale == "number") {
        scaleVec3 = new THREE.Vector3(scale, scale, scale);
    } else {
        scaleVec3 = new THREE.Vector3(scale.x, scale.y, scale.z);
    }
    if (typeof position == "number") {
        positionVec3 = new THREE.Vector3(position, position, position);
    } else {
        positionVec3 = new THREE.Vector3(position.x, position.y, position.z);
    }

// Initial material
    const INITIAL_MTL = new THREE.MeshPhongMaterial({color: 0xf1f1f1, shininess: 10});

    const INITIAL_MAP = [
        // {childID: "Plane008", mtl: INITIAL_MTL},
        // {childID: "Plane008_1", mtl: INITIAL_MTL},
        {childID: "camera-hj_dg", mtl: INITIAL_MTL},
        {childID: "Plane006", mtl: INITIAL_MTL},
        {childID: "supports", mtl: INITIAL_MTL}];

    function initColor(parent, type, mtl) {
        parent.traverse(o => {
            if (o.isMesh) {
                if (o.name.includes(type)) {
                    o.material = mtl;
                    o.nameID = type; // Set a new property to identify this object
                }
            }
        });
    }

    let stacy_txt = new THREE.TextureLoader().load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy.jpg');

    stacy_txt.flipY = false; // we flip the texture so that its the right way up

    const stacy_mtl = new THREE.MeshPhongMaterial({
        map: stacy_txt,
        color: 0xffffff,
        skinning: true
    });


    let dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(`./${path}/draco/`); // ??????public???????????????????????????????????????/
    dracoLoader.setDecoderConfig({type: "js"}); //?????????????????????draco_decoder.js?????????
    dracoLoader.preload();

    const loader = new GLTFLoader().setPath(`${path}\\`);
    loader.setDRACOLoader(dracoLoader);
    return new Promise((res, rj) => {
        loader.load(`${modelName}`, function (gltf) {
                console.log(gltf);
                let theModel = gltf.scene;
                global.theModel=theModel;
                theModel.rotation.y = Math.PI * 2;

                // Set initial textures
                for (let object of INITIAL_MAP) {
                    initColor(theModel, object.childID, object.mtl);
                }

                if (setCenter) {
                    theModel.traverse(function (o) {
                        if (o.isBone) {
                            console.log(o.name);
                            console.log('??????')
                        }
                        if (setCenter && o.isMesh) {
                            //????????????
                            o.material = stacy_mtl;
                            o.geometry.center();
                        }
                    });
                }

                theModel.scale.copy(scaleVec3);
                theModel.position.copy(positionVec3);
                if (rotation) {
                    theModel.rotation.copy(rotation);
                }
                // scene.add(theModel);
                res(gltf);
                // gltf = null;
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {

                console.log('An error happened');

            });
    });
}

let fullScreenElement = false;

//w ??????
function WxpKeyPressed1(event, renderer, cube) {
    var key = event.keyCode;
    switch (key) {
        case 87: /*w*/
            if (!fullScreenElement) {
                renderer.domElement.requestFullscreen().then();
                fullScreenElement = true;
            } else {
                //   ?????????????????????document??????
                document.exitFullscreen().then();
                fullScreenElement = false;
            }
            break;


        case 83:/*s*/
            cube.position.y -= 0.5;
            cube.rotation.x += Math.PI / 4.0;
            break;
        case 68:/*d*/
            cube.position.x += 0.5;
            cube.rotation.y += Math.PI / 4.0;
            break;
    }
}

//????????????

function processing(scene, camera, renderer) {
    let composer = new EffectComposer(renderer);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    let outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    outlinePass.visibleEdgeColor.set('#130AF2'); // ????????????
    outlinePass.edgeStrength = 5;
    outlinePass.edgeGlow = 1.5;

    // const textureLoader = new THREE.TextureLoader();
    // textureLoader.load('../img/tri_pattern.jpg', function (texture) {
    //
    //     outlinePass.patternTexture = texture;
    //     texture.wrapS = THREE.RepeatWrapping;
    //     texture.wrapT = THREE.RepeatWrapping;
    //
    // });
    composer.addPass(outlinePass);

    let effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    composer.addPass(effectFXAA);
    return [composer, outlinePass];
}

function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = (new THREE.Vector3())
        .subVectors(camera.position, boxCenter)
        .multiply(new THREE.Vector3(7, -60, 100))
        .normalize();

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;

    camera.updateProjectionMatrix();

    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}



export {loadGlb, WxpKeyPressed1, processing, frameArea}
