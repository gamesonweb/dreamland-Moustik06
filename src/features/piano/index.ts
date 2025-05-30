import * as BABYLON from '@babylonjs/core';
import { PianoModel } from './PianoModel';
import { PianoRenderer } from './PianoRenderer';
import { PianoInteractions } from './PianoInteractions';


export class Piano {
    //@ts-ignore
    private scene: BABYLON.Scene;
    private model: PianoModel;
    private renderer: PianoRenderer;
    private interactions: PianoInteractions;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
        this.model = new PianoModel();
        this.renderer = new PianoRenderer(scene, this.model);
        this.interactions = new PianoInteractions(scene, this.model);
    }


    public async initialize(): Promise<void> {

        await this.renderer.initialize();


        this.interactions.setupEventListeners();
    }


    public playNote(note: string, isReplay: boolean = false): void {
        this.interactions.playNote(note, isReplay);
    }


    public setPlayingState(isPlaying: boolean): void {
        this.interactions.setPlayingState(isPlaying);
    }
    
    public getInteractions(): PianoInteractions {
        return this.interactions;
    }

    public getModel(): PianoModel {
        return this.model;
    }

}