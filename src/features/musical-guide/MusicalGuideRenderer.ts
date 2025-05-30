import * as BABYLON from '@babylonjs/core';
import { MusicalGuideModel, GuideEmotion } from './MusicalGuideModel';

export class MusicalGuideRenderer {
    private scene: BABYLON.Scene;
    private model: MusicalGuideModel;


    private guideMesh: BABYLON.Mesh | null = null;
    private glowEffect: BABYLON.PointLight | null = null;
    private particleSystem: BABYLON.ParticleSystem | null = null;
    private wings: BABYLON.Mesh[] = [];

    // Pour les animations
    private currentAnimation: BABYLON.Animatable | null = null;
    private currentMaterialAnimation: BABYLON.Animatable | null = null;

    constructor(scene: BABYLON.Scene, model: MusicalGuideModel) {
        this.scene = scene;
        this.model = model;
    }


    public async initialize(): Promise<void> {
        await this.createGuideBody();
        await this.createGlowEffect();
        await this.createParticleEffect();
    }


    private async createGuideBody(): Promise<void> {

        this.guideMesh = BABYLON.MeshBuilder.CreateSphere(
            "musicalGuide",
            { diameter: 0.3, segments: 16 },
            this.scene
        );


        const guideMaterial = new BABYLON.StandardMaterial("guideMaterial", this.scene);
        guideMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0.8); // Jaune doré
        guideMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.6);
        guideMaterial.alpha = 0.9;
        this.guideMesh.material = guideMaterial;


        this.createWings();


        this.guideMesh.visibility = 0;
        this.guideMesh.setEnabled(false);
    }


    private createWings(): void {
        for (let i = 0; i < 4; i++) {
            const wing = BABYLON.MeshBuilder.CreatePlane(
                `wing_${i}`,
                { width: 0.25, height: 0.4 },
                this.scene
            );


            const angle = (i * Math.PI / 2) + Math.PI / 4;
            wing.position = new BABYLON.Vector3(
                Math.cos(angle) * 0.15,
                0,
                Math.sin(angle) * 0.15
            );
            wing.rotation.y = angle;
            wing.parent = this.guideMesh;


            const wingMaterial = new BABYLON.StandardMaterial(`wingMat_${i}`, this.scene);
            wingMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.9, 1);
            wingMaterial.alpha = 0.3;
            wingMaterial.emissiveColor = new BABYLON.Color3(0.4, 0.5, 0.8);
            wing.material = wingMaterial;

            this.wings.push(wing);
        }


        this.startWingAnimation();
    }


    private startWingAnimation(): void {
        this.wings.forEach((wing, i) => {
            const wingAnimation = new BABYLON.Animation(
                `wingFlap_${i}`,
                "rotation.z",
                30,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
            );

            const keyframes = [
                { frame: 0, value: 0 },
                { frame: 10, value: Math.PI / 6 },
                { frame: 20, value: -Math.PI / 6 },
                { frame: 30, value: 0 }
            ];

            wingAnimation.setKeys(keyframes);
            wing.animations = [wingAnimation];
            this.scene.beginAnimation(wing, 0, 30, true, 2);
        });
    }


    private async createGlowEffect(): Promise<void> {
        this.glowEffect = new BABYLON.PointLight(
            "guideGlow",
            new BABYLON.Vector3(0, 0, 0),
            this.scene
        );
        this.glowEffect.diffuse = new BABYLON.Color3(1, 1, 0.8);
        this.glowEffect.intensity = 0.5;
        this.glowEffect.range = 3;
        this.glowEffect.setEnabled(false);
    }


    private async createParticleEffect(): Promise<void> {
        this.particleSystem = new BABYLON.ParticleSystem("guideParticles", 50, this.scene);

        // Texture simple pour les particules
        const particleTexture = new BABYLON.DynamicTexture("particleTexture", 64, this.scene);
        const context = particleTexture.getContext();
        context.fillStyle = "white";
        context.beginPath();
        context.arc(32, 32, 20, 0, 2 * Math.PI);
        context.fill();
        particleTexture.update();

        this.particleSystem.particleTexture = particleTexture;

        this.particleSystem.minSize = 0.02;
        this.particleSystem.maxSize = 0.05;
        this.particleSystem.minLifeTime = 0.5;
        this.particleSystem.maxLifeTime = 1.0;
        this.particleSystem.emitRate = 20;

        this.particleSystem.color1 = new BABYLON.Color4(1, 1, 0.8, 1);
        this.particleSystem.color2 = new BABYLON.Color4(1, 1, 0.6, 0.5);

        this.particleSystem.direction1 = new BABYLON.Vector3(-0.2, 0.5, -0.2);
        this.particleSystem.direction2 = new BABYLON.Vector3(0.2, 1, 0.2);
        this.particleSystem.gravity = new BABYLON.Vector3(0, -0.5, 0);

        this.particleSystem.stop(); // Commence arrêté
    }


    public update(): void {
        const state = this.model.getState();


        if (state.isVisible && state.currentEmotion !== GuideEmotion.HIDDEN) {
            if (!this.guideMesh?.isEnabled()) {
                this.guideMesh?.setEnabled(true);
                this.glowEffect?.setEnabled(true);
                this.particleSystem?.start();
                this.animateAppearance();
            }
        } else {
            if (this.guideMesh?.isEnabled()) {
                this.guideMesh?.setEnabled(false);
                this.glowEffect?.setEnabled(false);
                this.particleSystem?.stop();
            }
            return;
        }

        this.updatePositionByPattern(state.currentPattern);


        this.updateAnimationsByEmotion(state.currentEmotion);


        if (this.guideMesh) {
            this.guideMesh.position.x = state.currentPosition.x;
            this.guideMesh.position.y = state.currentPosition.y;
            this.guideMesh.position.z = state.currentPosition.z;

            this.glowEffect!.position = this.guideMesh.position;
            this.particleSystem!.emitter = this.guideMesh;
        }
    }


    private animateAppearance(): void {
        if (!this.guideMesh) return;

        this.guideMesh.visibility = 0;

        const fadeIn = new BABYLON.Animation(
            "guideAppear",
            "visibility",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        fadeIn.setKeys([
            { frame: 0, value: 0 },
            { frame: 30, value: 1 }
        ]);

        this.guideMesh.animations = [fadeIn];
        this.scene.beginAnimation(this.guideMesh, 0, 30, false);
    }


    private updatePositionByPattern(pattern: string): void {
        const state = this.model.getState();
        const time = performance.now() * 0.001;

        switch (pattern) {
            case 'circle':

                state.currentPosition.x = Math.cos(time * 0.5) * 1.5;
                state.currentPosition.y = 3 + Math.sin(time * 2) * 0.2;
                state.currentPosition.z = -3 + Math.sin(time * 0.5) * 1.5;
                break;

            case 'dance':

                state.currentPosition.x = Math.sin(time * 2) * 1;
                state.currentPosition.y = 3 + Math.sin(time * 4) * 0.3;
                state.currentPosition.z = -3;
                break;

            case 'bounce':

                state.currentPosition.x = 0;
                state.currentPosition.y = 3 + Math.abs(Math.sin(time * 4)) * 0.5;
                state.currentPosition.z = -3;
                break;

            case 'celebration':

                state.currentPosition.x = Math.cos(time * 3) * 0.5;
                state.currentPosition.y = 3 + time * 0.5;
                state.currentPosition.z = -3 + Math.sin(time * 3) * 0.5;
                break;

            case 'rest':

                state.currentPosition.x = 0;
                state.currentPosition.y = 2.5 + Math.sin(time * 0.5) * 0.1;
                state.currentPosition.z = -3;
                break;

            default:

                state.currentPosition.x = 0;
                state.currentPosition.y = 3 + Math.sin(time) * 0.1;
                state.currentPosition.z = -3;
                break;
        }
    }


    private updateAnimationsByEmotion(emotion: GuideEmotion): void {
        const material = this.guideMesh?.material as BABYLON.StandardMaterial;
        if (!material) return;

        if (this.currentAnimation) {
            this.currentAnimation.stop();
        }
        if (this.currentMaterialAnimation) {
            this.currentMaterialAnimation.stop();
        }

        switch (emotion) {
            case GuideEmotion.DANCING:
                this.updateWingSpeed(2);
                break;

            case GuideEmotion.EXCITED:
                this.updateWingSpeed(3);
                this.createPulseAnimation();
                break;

            case GuideEmotion.CELEBRATING:
                this.updateWingSpeed(4);
                this.increaseParticles(100);
                this.createSpinAnimation();
                setTimeout(() => {
                    this.resetParticles();
                }, 3000);
                break;

            case GuideEmotion.CURIOUS:
                this.updateWingSpeed(1.5);
                break;

            case GuideEmotion.RESTING:
                this.updateWingSpeed(0.5);
                this.fadeToRestingColor();
                break;
        }
    }


    private updateWingSpeed(speed: number): void {
        this.wings.forEach((wing, _) => {
            this.scene.stopAnimation(wing);
            if (wing.animations.length > 0) {
                this.scene.beginAnimation(wing, 0, 30, true, speed);
            }
        });
    }


    private createPulseAnimation(): void {
        if (!this.guideMesh) return;

        const pulse = new BABYLON.Animation(
            "guidePulse",
            "scaling",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );

        pulse.setKeys([
            { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
            { frame: 10, value: new BABYLON.Vector3(1.2, 1.2, 1.2) },
            { frame: 20, value: new BABYLON.Vector3(1, 1, 1) }
        ]);

        this.guideMesh.animations = [pulse];
        this.currentAnimation = this.scene.beginAnimation(this.guideMesh, 0, 20, true, 2);
    }


    private createSpinAnimation(): void {
        if (!this.guideMesh) return;

        const spin = new BABYLON.Animation(
            "guideSpin",
            "rotation.y",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );

        spin.setKeys([
            { frame: 0, value: 0 },
            { frame: 30, value: Math.PI * 2 }
        ]);

        this.guideMesh.animations = [spin];
        this.currentAnimation = this.scene.beginAnimation(this.guideMesh, 0, 30, true, 3);
    }


    private fadeToRestingColor(): void {
        const material = this.guideMesh?.material as BABYLON.StandardMaterial;
        if (!material) return;

        const colorAnim = new BABYLON.Animation(
            "guideRestColor",
            "emissiveColor",
            30,
            BABYLON.Animation.ANIMATIONTYPE_COLOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        colorAnim.setKeys([
            { frame: 0, value: material.emissiveColor.clone() },
            { frame: 60, value: new BABYLON.Color3(0.5, 0.5, 0.8) } // Bleu doux
        ]);

        material.animations = [colorAnim];
        this.currentMaterialAnimation = this.scene.beginAnimation(material, 0, 60, false);
    }


    private increaseParticles(rate: number): void {
        if (this.particleSystem) {
            this.particleSystem.emitRate = rate;
        }
    }


    private resetParticles(): void {
        if (this.particleSystem) {
            this.particleSystem.emitRate = 20;
        }
    }
}