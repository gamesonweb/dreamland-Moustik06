import * as BABYLON from '@babylonjs/core';
import HavokPhysics, {HavokPhysicsWithBindings} from '@babylonjs/havok';
import { Piano } from './features/piano';
import { EventBus } from './core/events/EventBus';
import {DreamWorld} from "./features/dream-world/Index.ts";
import {ChordMode} from "./features/chord-mode/Index.ts";
import {Composition} from "./features/composition/Index.ts";
import {Playback} from "./features/playback/Index.ts";
import {TutorialManager} from "./features/tutorial/TutorialManager.ts";
import {VisualFeedback} from "./features/visual-feedback/Index.ts";
import {MusicalGuide} from "./features/musical-guide/Index.ts";
import {AssetManager} from "./core/assets/AssetManager.ts";
import {PlayerManager} from "./core/player/PlayerManager.ts";
import {Color4, DefaultRenderingPipeline} from "@babylonjs/core";
console.log("====== DreamLand Piano ======");
console.log("Script principal chargé");

class Game {
    private canvas: HTMLCanvasElement;
    private engine: BABYLON.Engine;
    //@ts-ignore
    private scene: BABYLON.Scene;
    //@ts-ignore
    private playerManager: PlayerManager;

    // Features du jeu
    //@ts-ignore
    private piano: Piano;
    //@ts-ignore
    private chordMode: ChordMode;
    //@ts-ignore
    private composition: Composition;
    //@ts-ignore
    private playback: Playback;
    //@ts-ignore
    private dreamWorld: DreamWorld;
    //@ts-ignore
    private eventBus: EventBus;
    //@ts-ignore
    private tutorial : TutorialManager;
    //@ts-ignore
    private visualFeedback: VisualFeedback;
    //@ts-ignore
    private musicalGuide: MusicalGuide;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.eventBus = EventBus.getInstance();

        console.log("BJS - " + new Date().toLocaleTimeString() +
            ": Babylon.js v" + BABYLON.Engine.Version +
            " - " + this.engine.webGLVersion +
            " - " + (this.engine.getCaps().parallelShaderCompile ?
                "Parallel shader compilation" : "Sequential shader compilation"));
    }

    public async initialize(): Promise<void> {
        console.log("Initializing game...");

        this.scene = new BABYLON.Scene(this.engine);
        const havokInstance = await this._getHavokInstance();
        const havokPlugin = new BABYLON.HavokPlugin(true, havokInstance);
        this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), havokPlugin);

        this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 1); // Noir au début
        const assetManager = AssetManager.getInstance(this.scene);
        try {
            const worldMesh = await assetManager.loadWorld();
            if (worldMesh) {
                worldMesh.position = new BABYLON.Vector3(0, 0, 0);
                worldMesh.scaling = new BABYLON.Vector3(1, 1, 1);
                this.playerManager = new PlayerManager(this.scene, this.canvas);
                await this.playerManager.initialize();
                this.playerManager.setupWorldPhysics(worldMesh);
                console.log("World loaded and positioned");
            }
        } catch (error) {
            console.warn("Could not load world model, continuing without it");
        }

        const ambientLight = new BABYLON.HemisphericLight(
            "ambientLight",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = 0.1;



        this.dreamWorld = new DreamWorld(this.scene);
        await this.dreamWorld.initialize();


        await this.initializeFeatures();


        this.setupInteractions();

        this.tutorial = new TutorialManager(this.scene);
        await this.tutorial.initialize();
        this.tutorial.start();
        this.engine.runRenderLoop(() => {
            this.scene.render();

            if (this.musicalGuide) {
                this.musicalGuide.update();
            }
        });

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
        document.addEventListener('TUTORIAL_SKIP', () => {
            this.tutorial.skip();
        });

        this.setupPostProcessing();
    }
    private async _getHavokInstance(): Promise<HavokPhysicsWithBindings> {
        // load physics plugin
        // doesn't work with the following code
        // const havokInstance: HavokPhysicsWithBindings = await HavokPhysics();

        // TODO: change this to a more elegant solution
        // dirty hack to get the wasm file to load
        const wasmBinary: Response = await fetch(
            'libs/HavokPhysics.wasm'
        );
        const wasmBinaryArrayBuffer: ArrayBuffer = await wasmBinary.arrayBuffer();
        const havokInstance: HavokPhysicsWithBindings = await HavokPhysics({
            wasmBinary: wasmBinaryArrayBuffer,
        });

        return havokInstance;
    }
    private async initializeFeatures(): Promise<void> {
        this.piano = new Piano(this.scene);
        await this.piano.initialize();

        this.chordMode = new ChordMode(this.scene, this.piano.getModel());
        await this.chordMode.initialize();

        const chordModeLogic = this.chordMode.getLogic();
        if (chordModeLogic) {
            chordModeLogic.setPianoInteractions(this.piano.getInteractions());
        }

        this.composition = new Composition(this.scene);
        await this.composition.initialize();

        this.playback = new Playback(this.scene, this.piano);
        await this.playback.initialize();

        this.visualFeedback = new VisualFeedback(this.scene, this.piano.getModel());
        this.eventBus.on('TUTORIAL_COMPLETED', async () => {
            await this.visualFeedback.initialize(this.dreamWorld.model.transformationSequences);

        });

        this.musicalGuide = new MusicalGuide(this.scene);
        await this.musicalGuide.initialize();
    }

    private setupInteractions(): void {
        this.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN &&
                !document.pointerLockElement) {

                const pickResult = this.scene.pick(
                    this.scene.pointerX,
                    this.scene.pointerY,
                    (mesh) => {
                        return mesh.name.startsWith('key_') && mesh.isPickable;
                    }
                );

                if (pickResult?.hit && pickResult.pickedMesh) {
                    const pickedMesh = pickResult.pickedMesh;
                    const noteName = pickedMesh.name.substring(4);

                    console.log(`Piano key clicked: ${noteName}`);

                    if (this.chordMode.isActive()) {
                        this.chordMode.handleKeyClick(noteName);
                    }
                }
            }
        });

        document.addEventListener('REQUEST_COMPOSITION', () => {
            const events = this.composition.getEvents();
            if (events.length > 0) {
                this.playback.playComposition(events);
            }
        });
    }


    private setupPostProcessing(): void {
        const camera = this.scene.activeCamera;
        if (!camera) {
            console.warn("No active camera found to attach post-processes.");
            return;
        }

        const defaultPipeline = new DefaultRenderingPipeline(
            "defaultPipeline",
            true,
            this.scene,
            [camera]
        );

        defaultPipeline.fxaaEnabled = true;

        defaultPipeline.bloomEnabled = true;
        defaultPipeline.bloomThreshold = 0.9;
        defaultPipeline.bloomWeight = 0.8;
        defaultPipeline.bloomKernel = 64;
        defaultPipeline.bloomScale = 0.5;


        defaultPipeline.imageProcessing.contrast = 1.6;
        defaultPipeline.imageProcessing.exposure = 1.0;
        defaultPipeline.imageProcessing.vignetteEnabled = true;
        defaultPipeline.imageProcessing.vignetteWeight = 1.0;
        defaultPipeline.imageProcessing.vignetteColor = new Color4(0, 0, 0, 1);
        defaultPipeline.imageProcessing.vignetteStretch = 0;


    }
}

window.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM chargé, initialisation du jeu...");

    try {
        const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
        if (!canvas) {
            throw new Error("Canvas element not found!");
        }

        console.log("Canvas trouvé, création du jeu...");
        const game = new Game(canvas);

        await game.initialize();
        console.log("Jeu initialisé avec succès!");
    } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
    }
});