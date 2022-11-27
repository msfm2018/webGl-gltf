import * as THREE from "three";

let canvas1;
export function makeLabelCanvas(baseWidth, size, name) {
    const borderSize = 2;
    if (canvas1 == undefined)
        canvas1 = document.createElement('canvas')


    let ctx = canvas1.getContext('2d');

    const font = `${size}px bold 宋体`;
    ctx.font = font;
    // measure how long the name will be
    const textWidth = ctx.measureText(name).width;

    const doubleBorderSize = borderSize * 2;
    const width = baseWidth + doubleBorderSize;
    const height = size + doubleBorderSize;
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // need to set font again after resizing canvas
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, width, height);

    // scale to fit but don't stretch
    const scaleFactor = Math.min(1, baseWidth / textWidth);
    ctx.translate(width / 2, height / 2);
    ctx.scale(scaleFactor, 1);
    ctx.fillStyle = 'white';
    ctx.fillText(name, 0, 0);

    return ctx.canvas;
}

export function makePerson(position, name, labelWidth, size) {
    const canvas = makeLabelCanvas(labelWidth, size, name);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const labelMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
    });


    const labelBaseScale = 0.1;
    const label = new THREE.Sprite(labelMaterial);
    const { x, y, z } = position
    label.position.set(x, y, z)
    label.scale.x = canvas.width * labelBaseScale;
    label.scale.y = canvas.height * labelBaseScale;
    return label;
}


