import * as BABYLON from '@babylonjs/core';
import {DreamWorldModel} from './DreamWorldModel';


export class DreamWorldRenderer {
    private scene: BABYLON.Scene;
    private model: DreamWorldModel;

    constructor(scene: BABYLON.Scene, model: DreamWorldModel) {
        this.scene = scene;
        this.model = model;
    }


    public async initialize(): Promise<void> {
        await this.createBasicEnvironment();
        await this.loadParticleTexture();
    }


    private async createBasicEnvironment(): Promise<void> {
        this.model.ground = BABYLON.MeshBuilder.CreateGround(
            "ground",
            { width: 50, height: 50 },
            this.scene
        );
        this.model.ground.position.y = -2;

        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2); // Gris foncé au début
        groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        this.model.ground.material = groundMaterial;

        this.model.skybox = BABYLON.MeshBuilder.CreateBox(
            "skybox",
            { size: 1000 },
            this.scene
        );

        const skyboxMaterial = new BABYLON.StandardMaterial("skyboxMaterial", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.alpha = 0;
        this.model.skybox.material = skyboxMaterial;

        this.model.worldLight = new BABYLON.HemisphericLight(
            "worldLight",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        this.model.worldLight.intensity = 0.1;
    }


    private async loadParticleTexture(): Promise<void> {
        try {
            this.model.particleTexture = new BABYLON.Texture("assets/textures/flare.png", this.scene);
            console.log("Flare texture loaded successfully");
        } catch (error) {
            console.warn("Failed to load flare texture from assets/textures/flare.png. Generating fallback texture.", error);

            const size = 256;
            const buffer = new Uint8Array(size * size * 4);

            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    const x = i / size - 0.5;
                    const y = j / size - 0.5;
                    const distance = Math.sqrt(x * x + y * y);

                    const alpha = Math.max(0, 1 - distance * 2);

                    const index = (i + j * size) * 4;
                    buffer[index] = 255;     // R
                    buffer[index + 1] = 255; // G
                    buffer[index + 2] = 255; // B
                    buffer[index + 3] = alpha * 255; // A
                }
            }

            this.model.particleTexture = new BABYLON.RawTexture(
                buffer,
                size,
                size,
                BABYLON.Engine.TEXTUREFORMAT_RGBA,
                this.scene,
                false,
                false,
                BABYLON.Texture.TRILINEAR_SAMPLINGMODE
            );
            console.log("Fallback flare texture generated successfully.");
        }
    }


    public createNoteEffect(note: string): void {
        const noteIndex = this.model.getNoteIndex(note);
        const pianoPosition = new BABYLON.Vector3(-11.5, 13, -3);
        const radius = 0.5;
        const angle = (noteIndex / 24) * Math.PI * 2;
        const particleYOffset = 0.2;
        const emitterX = pianoPosition.x + Math.cos(angle) * radius + Math.random() * 10;
        const emitterY = pianoPosition.y + particleYOffset + Math.random() * 10;
        const emitterZ = pianoPosition.z + Math.sin(angle) * radius + Math.random() * 10;


        const particleSystem = new BABYLON.ParticleSystem("noteParticles", 50, this.scene);

        if (!this.model.particleTexture) {
            console.warn("Particle texture not loaded for note effect.");
            return;
        }
        particleSystem.particleTexture = this.model.particleTexture;
        particleSystem.blendMode = BABYLON.ParticleSystem.BILLBOARDMODE_ALL
        particleSystem.color1 = new BABYLON.Color4(1, 1, 1, 0.7);
        particleSystem.color2 = new BABYLON.Color4(1, 1, 1, 0.4);
        particleSystem.colorDead = new BABYLON.Color4(1, 1, 1, 0);

        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.3;
        particleSystem.minLifeTime = 0.5;
        particleSystem.maxLifeTime = 1.0;


        particleSystem.emitRate = 50;
        particleSystem.direction1 = new BABYLON.Vector3(-0.5, 1, -0.5);
        particleSystem.direction2 = new BABYLON.Vector3(0.5, 1, 0.5);

        particleSystem.gravity = new BABYLON.Vector3(0, -1, 0);

        particleSystem.emitter = new BABYLON.Vector3(emitterX, emitterY, emitterZ);

        particleSystem.start();

        setTimeout(() => {
            particleSystem.stop();
            particleSystem.dispose();
        }, 1000);
    }


    public applyTransformation(transformationType: string): void {
        switch (transformationType) {
            case 'light':
                this.addLight();
                break;
            case 'color':
                this.addColor();
                break;
            case 'sky':
                this.addSky();
                break;
        }


        const element = document.getElementById(`discovery-${transformationType}`);
        if (element) {
            element.classList.add('discovered');
        }
    }


    private addLight(): void {

        const lightAnimation = new BABYLON.Animation(
            "lightAnimation",
            "intensity",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keyframes = [
            { frame: 0, value: this.model.worldLight.intensity },
            { frame: 60, value: 0.8 }
        ];

        lightAnimation.setKeys(keyframes);
        this.model.worldLight.animations = [lightAnimation];

        this.scene.beginAnimation(this.model.worldLight, 0, 60, false);


        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const radius = 10;

            const spotlight = new BABYLON.SpotLight(
                `spotlight_${i}`,
                new BABYLON.Vector3(
                    Math.cos(angle) * radius,
                    5,
                    Math.sin(angle) * radius
                ),
                new BABYLON.Vector3(0, -1, 0),
                Math.PI / 3,
                10,
                this.scene
            );

            spotlight.diffuse = BABYLON.Color3.FromHSV((i / 3) * 360 / 360, 0.7, 1);
            spotlight.intensity = 0;

            const spotlightAnimation = new BABYLON.Animation(
                `spotlightAnimation_${i}`,
                "intensity",
                30,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );

            const spotlightKeyframes = [
                { frame: 0, value: 0 },
                { frame: 60, value: 0.3 }
            ];

            spotlightAnimation.setKeys(spotlightKeyframes);
            spotlight.animations = [spotlightAnimation];

            this.scene.beginAnimation(spotlight, 0, 60, false);

            this.model.spotlights.push(spotlight);
        }
    }


    private addColor(): void {

        const groundMaterial = this.model.ground.material as BABYLON.StandardMaterial;

        const groundColorAnimation = new BABYLON.Animation(
            "groundColorAnimation",
            "diffuseColor",
            30,
            BABYLON.Animation.ANIMATIONTYPE_COLOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keyframes = [
            { frame: 0, value: groundMaterial.diffuseColor },
            { frame: 60, value: new BABYLON.Color3(0.3, 0.5, 0.2) }
        ];

        groundColorAnimation.setKeys(keyframes);
        groundMaterial.animations = [groundColorAnimation];

        this.scene.beginAnimation(groundMaterial, 0, 60, false);
    }

    private addSky(): void {
        const skyboxMaterial = this.model.skybox.material as BABYLON.StandardMaterial;

        skyboxMaterial.disableLighting = true;
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);

        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
            "assets/skybox/skybox",
            this.scene,
            ["_px.png", "_py.png", "_pz.png", "_nx.png", "_ny.png", "_nz.png"] // Spécifiez les suffixes et l'extension
        );

        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
        const skyboxAlphaAnimation = new BABYLON.Animation(
            "skyboxAlphaAnimation",
            "alpha",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const alphaKeyframes = [
            { frame: 0, value: skyboxMaterial.alpha },
            { frame: 60, value: 1.0 }
        ];
        skyboxAlphaAnimation.setKeys(alphaKeyframes);

        const skyboxColorAnimation = new BABYLON.Animation(
            "skyboxColorAnimation",
            "diffuseColor",
            30,
            BABYLON.Animation.ANIMATIONTYPE_COLOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const colorKeyframes = [
            { frame: 0, value: new BABYLON.Color3(0, 0, 0) },
            { frame: 60, value: new BABYLON.Color3(1, 1, 1) }
        ];
        skyboxColorAnimation.setKeys(colorKeyframes);

        skyboxMaterial.animations = [skyboxAlphaAnimation, skyboxColorAnimation];

        this.scene.beginAnimation(skyboxMaterial, 0, 60, false);

    }


    public createCompletionCelebration(): void {
        const celebrationParticles = new BABYLON.ParticleSystem("celebration", 500, this.scene);
        celebrationParticles.particleTexture = new BABYLON.Texture("assets/textures/flare.png", this.scene);

        celebrationParticles.color1 = new BABYLON.Color4(1, 1, 1, 1);
        celebrationParticles.color2 = new BABYLON.Color4(0.8, 0.8, 0.8, 1);
        celebrationParticles.colorDead = new BABYLON.Color4(0, 0, 0, 0);

        celebrationParticles.minSize = 0.1;
        celebrationParticles.maxSize = 0.5;

        celebrationParticles.minLifeTime = 0.5;
        celebrationParticles.maxLifeTime = 2.0;

        celebrationParticles.emitRate = 200;

        celebrationParticles.direction1 = new BABYLON.Vector3(-1, 8, -1);
        celebrationParticles.direction2 = new BABYLON.Vector3(1, 8, 1);

        celebrationParticles.gravity = new BABYLON.Vector3(0, -1, 0);

        celebrationParticles.emitter = new BABYLON.Vector3(0, 0, 0);

        celebrationParticles.start();

        setTimeout(() => {
            celebrationParticles.stop();
        }, 5000);
    }
}