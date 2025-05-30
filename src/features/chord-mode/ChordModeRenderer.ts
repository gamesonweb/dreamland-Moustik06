import * as BABYLON from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui';
import { PianoModel } from '../piano/PianoModel';
import { getNoteColor } from '../../core/utils/RenderUtils';


export class ChordModeRenderer {
    private scene: BABYLON.Scene;
    private pianoModel: PianoModel;

    //@ts-ignore
    public chordModeButton: BABYLON.Mesh;
    //@ts-ignore
    public addToSequenceButton: BABYLON.Mesh;
    public selectedKeyOverlays: Map<string, BABYLON.Mesh> = new Map();
    //@ts-ignore
    private chordModeTextBlock: TextBlock;

    constructor(scene: BABYLON.Scene, pianoModel: PianoModel) {
        this.scene = scene;
        this.pianoModel = pianoModel;
    }


    public async initialize(): Promise<void> {
        await this.createChordModeButton();
        await this.createAddToSequenceButton();
    }


    private async createChordModeButton(): Promise<void> {
        this.chordModeButton = BABYLON.MeshBuilder.CreateCylinder(
            "chordModeButton",
            { height: 0.2, diameter: 0.8 },
            this.scene
        );

        this.chordModeButton.position = new BABYLON.Vector3(-12, 14, 4);
        this.chordModeButton.rotation.x = 115 * Math.PI / 180; // Incliné vers le haut
        this.chordModeButton.rotation.y = Math.PI / 2; // Orienté vers la caméra

        const buttonMaterial = new BABYLON.StandardMaterial("chordModeButtonMaterial", this.scene);
        buttonMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.7); // Bleu foncé
        buttonMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.6);
        buttonMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.3);
        this.chordModeButton.material = buttonMaterial;

        const textPlane = BABYLON.MeshBuilder.CreatePlane(
            "chordModeText",
            { width: 2, height: 0.5 },
            this.scene
        );
        textPlane.position = new BABYLON.Vector3(-7, 0.5, 0);
        textPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;

        const advancedTexture = AdvancedDynamicTexture.CreateForMesh(textPlane);

        this.chordModeTextBlock = new TextBlock();
        this.chordModeTextBlock.text = "Mode Accord: OFF";
        this.chordModeTextBlock.color = "white";
        this.chordModeTextBlock.fontSize = 24;
        this.chordModeTextBlock.fontWeight = "bold";

        advancedTexture.addControl(this.chordModeTextBlock);

        const textMaterial = new BABYLON.StandardMaterial("textPlaneMaterial", this.scene);
        textMaterial.alpha = 0;
        textMaterial.disableLighting = true;
        textPlane.material = textMaterial;
    }

    private async createAddToSequenceButton(): Promise<void> {
        this.addToSequenceButton = BABYLON.MeshBuilder.CreateCylinder(
            "addToSequenceButton",
            { height: 0.2, diameter: 0.8 },
            this.scene
        );

        this.addToSequenceButton.position = new BABYLON.Vector3(
            -12,
            14,
            3
        );
        this.addToSequenceButton.rotation.x = 115 * Math.PI / 180; // Incliné vers le haut
        this.addToSequenceButton.rotation.y = Math.PI / 2; // Orienté vers la caméra

        const buttonMaterial = new BABYLON.StandardMaterial("addToSequenceButtonMaterial", this.scene);
        buttonMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.5, 0.1); // Ambre
        buttonMaterial.specularColor = new BABYLON.Color3(0.8, 0.6, 0.2);
        buttonMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.2, 0.05);
        this.addToSequenceButton.material = buttonMaterial;


        const text = new TextBlock();
        text.text = "Ajouter à la séquence";
        text.color = "white";
        text.fontSize = 24;
        text.fontWeight = "bold";


        this.addToSequenceButton.visibility = 0;
    }


    public updateChordModeButton(isChordMode: boolean): void {

        this.chordModeTextBlock.text = isChordMode ? "Mode Accord: ON" : "Mode Accord: OFF";


        const buttonMaterial = this.chordModeButton.material as BABYLON.StandardMaterial;
        if (isChordMode) {

            buttonMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.7, 0.2);
            buttonMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.3, 0.1);


            this.addToSequenceButton.visibility = 1;

            const textPlane = this.scene.getMeshByName("addToSequenceText");
            if (textPlane) textPlane.visibility = 1;
        } else {

            buttonMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.7);
            buttonMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.3);


            this.addToSequenceButton.visibility = 0;

            const textPlane = this.scene.getMeshByName("addToSequenceText");
            if (textPlane) textPlane.visibility = 0;
        }
    }


    public addNoteSelectionVisual(note: string): void {
        const keyMesh = this.pianoModel.keyMeshes.get(note);
        if (!keyMesh) return;


        const keyPosition = keyMesh.position;
        const keySize = keyMesh.getBoundingInfo().boundingBox.extendSize;


        const selectionMesh = BABYLON.MeshBuilder.CreateBox(
            `selection_${note}`,
            {
                width: keySize.x * 1.1,
                height: 0.05,
                depth: keySize.z * 1.1
            },
            this.scene
        );


        selectionMesh.position = new BABYLON.Vector3(
            keyPosition.x,
            keyPosition.y + keySize.y + 0.03, // Légèrement au-dessus
            keyPosition.z
        );


        const selectionMaterial = new BABYLON.StandardMaterial(`selectionMat_${note}`, this.scene);

        const color = getNoteColor(note, this.pianoModel.notes);
        selectionMaterial.diffuseColor = color;
        selectionMaterial.alpha = 0.7; // Semi-transparent
        selectionMaterial.emissiveColor = color.scale(0.5);

        selectionMesh.material = selectionMaterial;


        this.selectedKeyOverlays.set(note, selectionMesh);


        const pulseAnimation = new BABYLON.Animation(
            `selectionPulse_${note}`,
            "material.alpha",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );

        const keyframes = [
            { frame: 0, value: 0.7 },
            { frame: 15, value: 0.4 },
            { frame: 30, value: 0.7 }
        ];

        pulseAnimation.setKeys(keyframes);
        selectionMesh.animations = [pulseAnimation];

        this.scene.beginAnimation(selectionMesh, 0, 30, true);
    }

    public removeNoteSelectionVisual(note: string): void {
        const selectionMesh = this.selectedKeyOverlays.get(note);
        if (selectionMesh) {
            selectionMesh.dispose();
            this.selectedKeyOverlays.delete(note);
        }
    }


    public clearAllSelectionVisuals(): void {
        this.selectedKeyOverlays.forEach((mesh) => {
            mesh.dispose();
        });
        this.selectedKeyOverlays.clear();
    }
}