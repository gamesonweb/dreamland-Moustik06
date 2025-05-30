import * as BABYLON from '@babylonjs/core';
import { PianoModel } from './PianoModel';
import { AudioEngine } from '../../core/audio/AudioEngine';
import { animateKeyPress } from '../../core/utils/AnimationUtils';
import { EventBus } from '../../core/events/EventBus';
import { CompositionEvent } from "../../core/types/Types.ts";


export class PianoInteractions {
    private scene: BABYLON.Scene;
    private model: PianoModel;
    private audioEngine: AudioEngine;
    private eventBus: EventBus;
    private isPlaying: boolean = false;
    private isChordMode: boolean = false; // Nouvelle propriété
    constructor(scene: BABYLON.Scene, model: PianoModel) {
        this.scene = scene;
        this.model = model;
        this.audioEngine = AudioEngine.getInstance();
        this.eventBus = EventBus.getInstance();
    }


    public setupEventListeners(): void {

        this.model.keyMeshes.forEach((mesh, note) => {
            mesh.actionManager = new BABYLON.ActionManager(this.scene);

            mesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPickTrigger,
                    () => {
                        if (!this.isPlaying) {
                            this.onKeyPressed(note);
                        }
                    }
                )
            );
        });
    }

    public onKeyPressed(note: string): void {
        this.playNote(note)
        this.eventBus.emit('NOTE_PLAYED', { note });
    }


    public setChordMode(isChordMode: boolean): void {
        this.isChordMode = isChordMode;
    }

    public playNote(note: string, isReplay: boolean = false): void {

        this.audioEngine.playNote(note);

        this.animateKey(note);

        if (!isReplay && !this.isChordMode) {
            const noteEvent: CompositionEvent = {
                type: 'note',
                notes: [note],
                timestamp: Date.now()
            };


            this.eventBus.emit('COMPOSITION_NOTE_ADDED', { event: noteEvent });
        }
    }


    public setPlayingState(isPlaying: boolean): void {
        this.isPlaying = isPlaying;
    }


    private activeAnimations: Map<string, boolean> = new Map();

    public animateKey(note: string): void {
        if (this.activeAnimations.get(note)) return;

        const keyMesh = this.model.keyMeshes.get(note);
        if (keyMesh) {
            this.activeAnimations.set(note, true);


            setTimeout(() => {
                this.activeAnimations.set(note, false);
            }, 500);

            animateKeyPress(keyMesh, this.scene);
        }
    }
}