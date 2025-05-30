import * as BABYLON from '@babylonjs/core';
import { DynamicTexture } from '@babylonjs/core';
import { PianoModel } from './PianoModel';
import { createKeyMaterial } from '../../core/utils/RenderUtils';
import {AssetManager} from "../../core/assets/AssetManager.ts";


export class PianoRenderer {
    private scene: BABYLON.Scene;
    private model: PianoModel;
    private keysContainer: BABYLON.TransformNode;

    constructor(scene: BABYLON.Scene, model: PianoModel) {
        this.scene = scene;
        this.model = model;
    }


    public async initialize(): Promise<void> {
        await this.createPianoBody();
        await this.createPianoKeys();

    }


    private async createPianoBody(): Promise<void> {
        const assetManager = AssetManager.getInstance(this.scene);

        try {
            await assetManager.loadModel('pianoCasing',  'piano_body.glb');
            const pianoBody = assetManager.addModelToScene('pianoCasing');

            if (pianoBody) {
                this.model.pianoMesh = pianoBody;

                this.model.pianoMesh.position.x = 12;
                this.model.pianoMesh.position.y = -13;
                this.model.pianoMesh.position.z = 5;

                this.model.pianoMesh.scaling.x = 2;
                this.model.pianoMesh.scaling.y = 2;
                this.model.pianoMesh.scaling.z = 2;

                console.log("Piano body 3D model loaded successfully");
            }
        } catch (error) {
            console.error("Failed to load piano body model:", error);
            this.model.pianoMesh = BABYLON.MeshBuilder.CreateBox(
                "pianoBody",
                { width: 15, height: 2, depth: 5 },
                this.scene
            );
            this.model.pianoMesh.position = new BABYLON.Vector3(12, -13, 5);
        }

        this.keysContainer = new BABYLON.TransformNode("keysContainer", this.scene);
        this.keysContainer.parent = this.model.pianoMesh;


        this.keysContainer.position.x = -11.5;
        this.keysContainer.position.y = 12.9;
        this.keysContainer.position.z = -3.6;

        this.keysContainer.rotation.y = 270 * Math.PI / 180;
        this.keysContainer.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);

        const pianoLight = new BABYLON.PointLight(
            "pianoLight",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        pianoLight.diffuse = new BABYLON.Color3(0.7, 0.7, 1.0);
        pianoLight.intensity = 0.2;
        pianoLight.range = 10;
        pianoLight.parent = this.model.pianoMesh;
    }


    private async createPianoKeys(): Promise<void> {
        if (!this.keysContainer) {
            console.error("Keys container not initialized");
            return;
        }
        this.model.notes.reverse();
        let whiteKeyIndex = 0;
        const startX = 0;

        for (let i = 0; i < this.model.notes.length; i++) {
            const note = this.model.notes[i];
            const isBlackKey = this.model.isBlackKey(note);

            if (isBlackKey) {

                const blackKey = BABYLON.MeshBuilder.CreateBox(
                    `key_${note}`,
                    {
                        width: this.model.blackKeyWidth,
                        height: this.model.blackKeyHeight,
                        depth: this.model.blackKeyDepth
                    },
                    this.scene
                );


                const position = (whiteKeyIndex - 0.5) * (this.model.whiteKeyWidth + this.model.keySpacing);
                blackKey.position = new BABYLON.Vector3(
                    startX + position,
                    0.1,
                    -0.2
                );


                blackKey.parent = this.keysContainer;

                const blackKeyMaterial = createKeyMaterial(`material_${note}`, true, this.scene);
                blackKey.material = blackKeyMaterial;

                this.model.keyMeshes.set(note, blackKey);


                this.createKeyLabel(note, blackKey, true);
            } else {

                const whiteKey = BABYLON.MeshBuilder.CreateBox(
                    `key_${note}`,
                    {
                        width: this.model.whiteKeyWidth,
                        height: 0.1,
                        depth: this.model.whiteKeyDepth,
                    },
                    this.scene
                );


                whiteKey.position = new BABYLON.Vector3(
                    startX + (whiteKeyIndex * (this.model.whiteKeyWidth + this.model.keySpacing)),
                    0,
                    0
                );


                whiteKey.parent = this.keysContainer;

                const whiteKeyMaterial = createKeyMaterial(`material_${note}`, false, this.scene);
                whiteKey.material = whiteKeyMaterial;

                this.model.keyMeshes.set(note, whiteKey);


                this.createKeyLabel(note, whiteKey, false);

                whiteKeyIndex++;
            }
        }
    }


    private createKeyLabel(note: string, keyMesh: BABYLON.Mesh, isBlackKey: boolean): void {

        const labelPlane = BABYLON.MeshBuilder.CreatePlane(
            `label_${note}`,
            { width: 0.4, height: 0.2,sideOrientation: BABYLON.Mesh.BACKSIDE },
            this.scene
        );


        labelPlane.parent = keyMesh;

        labelPlane.position = new BABYLON.Vector3(
            0,
            isBlackKey ? 0.2 : 0.1,
            0.8
        );
        labelPlane.rotation.x = Math.PI / 4;
        labelPlane.rotation.y = Math.PI;

        const labelMaterial = new BABYLON.StandardMaterial(`labelMaterial_${note}`, this.scene);
        const textureSize = { width: 256, height: 128 };
        const texture = new DynamicTexture(`labelTexture_${note}`, textureSize, this.scene, false);


        const font = "bold 64px Arial";
        const color = isBlackKey ? "yellow" : "white";
        texture.drawText(note, null, null, font, color, "transparent", true, true);


        labelMaterial.diffuseTexture = texture;
        labelMaterial.emissiveColor = isBlackKey
            ? new BABYLON.Color3(0.8, 0.8, 0.2)
            : new BABYLON.Color3(0.8, 0.8, 0.8);
        labelMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        labelMaterial.backFaceCulling = false;
        labelMaterial.disableLighting = true;

        labelPlane.material = labelMaterial;


        this.model.keyLabels.set(note, labelPlane);
    }

}