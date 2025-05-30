import * as BABYLON from '@babylonjs/core';


export function rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function getNoteColor(note: string, notes: string[]): BABYLON.Color3 {
    const noteIndex = notes.indexOf(note);
    const hue = (noteIndex / notes.length) * 360;
    return BABYLON.Color3.FromHSV(hue / 360, 0.9, 0.9);
}


export function createKeyMaterial(name: string, isBlackKey: boolean, scene: BABYLON.Scene): BABYLON.StandardMaterial {
    const material = new BABYLON.StandardMaterial(name, scene);

    if (isBlackKey) {
        material.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.05);
        material.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.05);
        material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    } else {
        material.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
        material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        material.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    }

    return material;
}