import * as BABYLON from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui';


export function animateButton(button: BABYLON.Mesh, scene: BABYLON.Scene): void {
    const scaleAnimation = new BABYLON.Animation(
        "buttonClick",
        "scaling",
        30,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const keyframes = [
        { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
        { frame: 5, value: new BABYLON.Vector3(0.9, 0.9, 0.9) },
        { frame: 10, value: new BABYLON.Vector3(1, 1, 1) }
    ];

    scaleAnimation.setKeys(keyframes);
    button.animations = [scaleAnimation];

    scene.beginAnimation(button, 0, 10, false);
}


export function animateKeyPress(keyMesh: BABYLON.Mesh, scene: BABYLON.Scene): void {
    const originalY = keyMesh.position.y;

    const animationDown = new BABYLON.Animation(
        "keyDown",
        "position.y",
        30,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const keyframes = [
        { frame: 0, value: originalY },
        { frame: 5, value: originalY - 0.05 },
        { frame: 15, value: originalY }
    ];

    animationDown.setKeys(keyframes);
    keyMesh.animations = [animationDown];

    scene.beginAnimation(keyMesh, 0, 15, false);
}


export function showNotification(message: string, color: string, scene: BABYLON.Scene): void {
    const notificationPlane = BABYLON.MeshBuilder.CreatePlane(
        `notification_${Date.now()}`,
        { width: 20, height: 10 },
        scene
    );
    notificationPlane.position = new BABYLON.Vector3(0, 3, 0); // Au-dessus du piano
    notificationPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    notificationPlane.isPickable = false;

    const notificationMaterial = new BABYLON.StandardMaterial("notificationMaterial", scene);
    notificationMaterial.alpha = 0;
    notificationMaterial.disableLighting = true;
    notificationPlane.material = notificationMaterial;

    const advancedTexture = AdvancedDynamicTexture.CreateForMesh(notificationPlane);

    const text = new TextBlock();
    text.text = message;
    text.color = color;
    text.fontSize = 48;
    text.fontWeight = "bold";
    text.outlineWidth = 2;
    text.outlineColor = "black";

    advancedTexture.addControl(text);

    const animation = new BABYLON.Animation(
        "notificationRise",
        "position.y",
        30,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const fadeAnimation = new BABYLON.Animation(
        "notificationFade",
        "visibility",
        30,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const keyframes = [
        { frame: 0, value: 3 },
        { frame: 30, value: 5 }
    ];

    const fadeKeyframes = [
        { frame: 0, value: 1 },
        { frame: 20, value: 1 },
        { frame: 30, value: 0 }
    ];

    animation.setKeys(keyframes);
    fadeAnimation.setKeys(fadeKeyframes);

    notificationPlane.animations = [animation, fadeAnimation];

    scene.beginAnimation(notificationPlane, 0, 30, false, 1, () => {
        advancedTexture.dispose();
        notificationPlane.dispose();
    });
}