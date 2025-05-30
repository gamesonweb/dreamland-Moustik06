import * as BABYLON from '@babylonjs/core';
import { PianoModel } from '../piano/PianoModel';
import { ChordModeRenderer } from './ChordModeRenderer';
import { ChordModeLogic } from './ChordModeLogic';


export class ChordMode {
    //@ts-ignore
    private scene: BABYLON.Scene;
    //@ts-ignore
    private pianoModel: PianoModel;
    private renderer: ChordModeRenderer;
    private logic: ChordModeLogic;

    constructor(scene: BABYLON.Scene, pianoModel: PianoModel) {
        this.scene = scene;
        this.pianoModel = pianoModel;
        this.renderer = new ChordModeRenderer(scene, pianoModel);
        this.logic = new ChordModeLogic(scene, this.renderer);
    }


    public async initialize(): Promise<void> {
        await this.renderer.initialize();
        this.logic.setupEventListeners();
    }


    public isActive(): boolean {
        return this.logic.isChordModeActive();
    }


    public handleKeyClick(note: string): void {
        if (this.isActive()) {
            this.logic.toggleNoteSelection(note);
        }
    }


    public getLogic(): ChordModeLogic {
        return this.logic;
    }
}