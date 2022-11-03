import * as THREE from "three";
import global from "./global.js";

class Vglobal {
    let
    controls;
    let
    renderer;
    let
    scene;
    let
    camera;
    let
    mixer;
    let
    composer;
    let
    effectFXAA
    ;
    let
    outlinePass;


    let
    raycaster = new THREE.Raycaster();

// 鼠标的位置对象
    const
    mouse = new THREE.Vector2();
    const
    clock = new THREE.Clock();

    let
    defaultMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
    });

    let
    fixMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffff00,
        metalness: 0.6,
        roughness: 0.4,
        clearcoat: 0.05,
        clearcoatRoughness: 0.05
    })
}

export default Vglobal;