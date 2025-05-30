import * as BABYLON from '@babylonjs/core';
import { Piano } from '../piano';
import { LeverRenderer } from './LeverRenderer';
import { PlaybackService } from './PlaybackService';
import { CompositionEvent} from "../../core/types/Types.ts";


export class Playback {
    private scene: BABYLON.Scene;
    //@ts-ignore
    private piano: Piano;
    private leverRenderer: LeverRenderer;
    private playbackService: PlaybackService;

    constructor(scene: BABYLON.Scene, piano: Piano) {
        this.scene = scene;
        this.piano = piano;
        this.leverRenderer = new LeverRenderer(scene);
        this.playbackService = new PlaybackService(piano, this.leverRenderer);
    }


    public async initialize(): Promise<void> {
        await this.leverRenderer.initialize();
        this.setupEventListeners();
    }


    private setupEventListeners(): void {
        this.leverRenderer.leverMesh.actionManager = new BABYLON.ActionManager(this.scene);
        this.leverRenderer.leverMesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                (_) => {
                    this.onLeverClicked();
                }
            )
        );
    }


    private onLeverClicked(): void {
        if (this.playbackService.isPlaybackActive()) {
            return;
        }


        this.scene.onBeforeRenderObservable.addOnce(() => {

            const event = new CustomEvent('REQUEST_COMPOSITION');
            document.dispatchEvent(event);
        });
    }


    public playComposition(composition: CompositionEvent[]): void {
        if (!this.playbackService.isPlaybackActive()) {
            this.playbackService.playComposition(composition);
        }
    }


}