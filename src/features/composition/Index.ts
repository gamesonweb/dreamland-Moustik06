import * as BABYLON from '@babylonjs/core';
import { CompositionModel } from './CompositionModel';
import { CompositionPanel } from './CompositionPanel';
import { CompositionLogic } from './CompositionLogic';
import {NoteInfo,CompositionEvent} from "../../core/types/Types.ts";



export class Composition {
    //@ts-ignore
    private scene: BABYLON.Scene;
    private model: CompositionModel;
    private panel: CompositionPanel;
    private logic: CompositionLogic;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
        this.model = new CompositionModel();
        this.panel = new CompositionPanel(scene, this.model);
        this.logic = new CompositionLogic(this.model);
    }


    public async initialize(): Promise<void> {
        await this.panel.initialize();
    }


    public addNote(note: string): void {
        this.logic.addNote(note);
    }


    public addChord(notes: string[]): void {
        this.logic.addChord(notes);
    }


    public clear(): void {
        this.logic.clearComposition();
    }


    public isEmpty(): boolean {
        return this.logic.isEmpty();
    }


    public getEvents(): CompositionEvent[] {
        return this.logic.getEvents();
    }


    public getNoteSequence(): NoteInfo[] {
        return this.model.getNoteSequence();
    }
}