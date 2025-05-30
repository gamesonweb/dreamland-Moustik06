import * as BABYLON from '@babylonjs/core';


export class LeverRenderer {
    private scene: BABYLON.Scene;
    // @ts-ignore
    public leverMesh: BABYLON.Mesh;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
    }


    public async initialize(): Promise<void> {
        await this.createLever();
    }


    private async createLever(): Promise<void> {
        this.leverMesh = BABYLON.MeshBuilder.CreateCylinder(
            "lever",
            { height: 1, diameter: 0.2 },
            this.scene
        );
        this.leverMesh.position = new BABYLON.Vector3(-11, 13, -2.6);

        const leverMaterial = new BABYLON.StandardMaterial("leverMaterial", this.scene);
        leverMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.1, 0.1);
        leverMaterial.emissiveColor = new BABYLON.Color3(0.6, 0, 0); // Éclat rouge plus intense
        leverMaterial.specularColor = new BABYLON.Color3(1, 0.3, 0.3);
        this.leverMesh.material = leverMaterial;

        const leverGlowAnimation = new BABYLON.Animation(
            "leverGlow",
            "material.emissiveColor",
            30,
            BABYLON.Animation.ANIMATIONTYPE_COLOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );

        const baseEmissive = leverMaterial.emissiveColor.clone();
        const brightEmissive = new BABYLON.Color3(0.9, 0.1, 0.1);

        const keyframes = [
            { frame: 0, value: baseEmissive },
            { frame: 15, value: brightEmissive },
            { frame: 30, value: baseEmissive }
        ];

        leverGlowAnimation.setKeys(keyframes);
        this.leverMesh.animations = [leverGlowAnimation];

        this.scene.beginAnimation(this.leverMesh, 0, 30, true);

        const leverBase = BABYLON.MeshBuilder.CreateCylinder(
            "leverBase",
            { height: 0.2, diameter: 0.5 },
            this.scene
        );
        leverBase.position = new BABYLON.Vector3(6, -0.6, 0);

        const leverBaseMaterial = new BABYLON.StandardMaterial("leverBaseMaterial", this.scene);
        leverBaseMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        leverBase.material = leverBaseMaterial;
    }


    public animateLever(): void {
        const animationLever = new BABYLON.Animation(
            "leverAnimation",
            "rotation.z",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keyframes = [
            { frame: 0, value: 0 },
            { frame: 15, value: Math.PI / 4 },
            { frame: 30, value: 0 }
        ];

        animationLever.setKeys(keyframes);

        const originalAnimation = this.leverMesh.animations[0];

        this.leverMesh.animations = [animationLever];
        this.scene.beginAnimation(this.leverMesh, 0, 30, false, 1, () => {
            this.leverMesh.animations = [originalAnimation];
            this.scene.beginAnimation(this.leverMesh, 0, 30, true);
        });
    }
}