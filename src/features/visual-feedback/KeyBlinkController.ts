import * as BABYLON from '@babylonjs/core';
import { PianoModel } from '../piano/PianoModel';


export class KeyBlinkController {
    private scene: BABYLON.Scene;
    private pianoModel: PianoModel;
    private blinkingKeys: Map<string, { key: BABYLON.Mesh, animations: BABYLON.Animation[] }> = new Map();
    private debug: boolean = true;

    constructor(scene: BABYLON.Scene, pianoModel: PianoModel) {
        this.scene = scene;
        this.pianoModel = pianoModel;
    }


    private createStrongBlinkAnimation(key: BABYLON.Mesh, note: string): BABYLON.Animation[] {
        const material = key.material as BABYLON.StandardMaterial;
        const isBlackKey = this.pianoModel.isBlackKey(note);
        const animations: BABYLON.Animation[] = [];

        const scaleAnim = new BABYLON.Animation(
            `blink_scale_${note}`,
            "scaling",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );

        scaleAnim.setKeys([
            { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
            { frame: 15, value: new BABYLON.Vector3(1.15, 1.15, 1.15) },
            { frame: 30, value: new BABYLON.Vector3(1, 1, 1) }
        ]);


        const bounceAnim = new BABYLON.Animation(
            `blink_bounce_${note}`,
            "position.y",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );

        const originalY = key.position.y;
        bounceAnim.setKeys([
            { frame: 0, value: originalY },
            { frame: 15, value: originalY + 0.15 },
            { frame: 30, value: originalY }
        ]);


        const brightColor = isBlackKey
            ? new BABYLON.Color3(1, 1, 0)
            : new BABYLON.Color3(0, 1, 0);


        const glowAnim = new BABYLON.Animation(
            `blink_glow_${note}`,
            "emissiveColor",
            30,
            BABYLON.Animation.ANIMATIONTYPE_COLOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );

        const originalEmissive = material.emissiveColor.clone();
        glowAnim.setKeys([
            { frame: 0, value: originalEmissive },
            { frame: 15, value: brightColor },
            { frame: 30, value: originalEmissive }
        ]);


        const diffuseAnim = new BABYLON.Animation(
            `blink_diffuse_${note}`,
            "diffuseColor",
            30,
            BABYLON.Animation.ANIMATIONTYPE_COLOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );

        const originalDiffuse = material.diffuseColor.clone();
        diffuseAnim.setKeys([
            { frame: 0, value: originalDiffuse },
            { frame: 15, value: brightColor },
            { frame: 30, value: originalDiffuse }
        ]);


        animations.push(scaleAnim, bounceAnim);
        key.animations = [scaleAnim, bounceAnim];
        material.animations = [glowAnim, diffuseAnim];
        this.scene.beginAnimation(key, 0, 30, true);
        this.scene.beginAnimation(material, 0, 30, true);

        if (material) {
            animations.push(glowAnim, diffuseAnim);
            this.scene.beginAnimation(key, 0, 30, true);
            this.scene.beginAnimation(material, 0, 30, true);
        }


        this.addParticleEffect(key, note);

        return animations;
    }
    public stopAllBlinking(): void {

        // Parcourir TOUTES les touches et nettoyer
        this.pianoModel.notes.forEach(note => {
            const key = this.pianoModel.keyMeshes.get(note);
            if (key) {
                // Arrêter toutes les animations
                this.scene.stopAnimation(key);

                const material = key.material as BABYLON.StandardMaterial;
                if (material) {
                    this.scene.stopAnimation(material);
                }

                // Restaurer les valeurs originales
                key.scaling = new BABYLON.Vector3(1, 1, 1);
                key.position.y = this.getOriginalKeyY(note);

                // Nettoyer les tableaux d'animations
                key.animations = [];
                if (material) {
                    material.animations = [];

                    // Restaurer les couleurs originales
                    if (this.pianoModel.isBlackKey(note)) {
                        material.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.05);
                        material.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.05);
                    } else {
                        material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
                        material.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
                    }
                }
            }
        });

        // Vider la Map des touches clignotantes
        this.blinkingKeys.clear();
    }


    public blinkKeys(notes: string[]): void {
        if (this.debug) {
            console.log(`[KeyBlink] Starting to blink: ${notes.join(', ')}`);
        }


        setTimeout(() => {
            notes.forEach(note => {
                if (this.blinkingKeys.has(note)) {
                    console.warn(`[KeyBlink] Key ${note} already blinking, skipping`);
                    return;
                }

                const key = this.pianoModel.keyMeshes.get(note);
                if (!key) {
                    console.warn(`[KeyBlink] Key not found: ${note}`);
                    return;
                }

                if (!key.material || !(key.material instanceof BABYLON.StandardMaterial)) {
                    console.warn(`[KeyBlink] Invalid material for key: ${note}`);
                    return;
                }

                const animations = this.createStrongBlinkAnimation(key, note);
                this.blinkingKeys.set(note, { key, animations });
            });
        }, 50);
    }

    private addParticleEffect(key: BABYLON.Mesh, note: string): void {
        const particleSystem = new BABYLON.ParticleSystem(`particles_${note}`, 20, this.scene);


        const particleTexture = new BABYLON.DynamicTexture("particleTexture", 256, this.scene);
        const context = particleTexture.getContext();
        context.fillStyle = "white";
        context.beginPath();
        context.arc(128, 128, 100, 0, 2 * Math.PI);
        context.fill();
        particleTexture.update();

        particleSystem.particleTexture = particleTexture;

        particleSystem.emitter = key;
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.2, 0, -0.2);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0.2, 0.2, 0.2);

        particleSystem.color1 = new BABYLON.Color4(1, 1, 0, 1);
        particleSystem.color2 = new BABYLON.Color4(0, 1, 0, 1);
        particleSystem.minSize = 0.05;
        particleSystem.maxSize = 0.1;

        particleSystem.minLifeTime = 0.2;
        particleSystem.maxLifeTime = 0.5;

        particleSystem.emitRate = 30;

        particleSystem.gravity = new BABYLON.Vector3(0, -0.5, 0);

        particleSystem.start();


        setTimeout(() => {
            particleSystem.stop();
            particleSystem.dispose();
        }, 1000);
    }


    private getOriginalKeyY(note: string): number {
        return this.pianoModel.isBlackKey(note) ? 0.1 : 0;
    }

}