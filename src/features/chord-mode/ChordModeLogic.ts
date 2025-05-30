import * as BABYLON from '@babylonjs/core';
import { ChordModeRenderer } from './ChordModeRenderer';
import { AudioEngine } from '../../core/audio/AudioEngine';
import { EventBus } from '../../core/events/EventBus';
import { animateButton, showNotification } from '../../core/utils/AnimationUtils';
import { CompositionEvent } from "../../core/types/Types.ts";
import {PianoInteractions} from "../piano/PianoInteractions.ts";

export class ChordModeLogic {
    private scene: BABYLON.Scene;
    private renderer: ChordModeRenderer;
    private audioEngine: AudioEngine;
    private eventBus: EventBus;

    private isChordMode: boolean = false;
    private selectedNotes: string[] = [];
    //@ts-ignore
    private pianoInteractions: PianoInteractions;

    constructor(scene: BABYLON.Scene, renderer: ChordModeRenderer) {
        this.scene = scene;
        this.renderer = renderer;
        this.audioEngine = AudioEngine.getInstance();
        this.eventBus = EventBus.getInstance();
    }


    public setupEventListeners(): void {

        this.renderer.chordModeButton.actionManager = new BABYLON.ActionManager(this.scene);
        this.renderer.chordModeButton.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                () => {
                    this.toggleChordMode();
                    animateButton(this.renderer.chordModeButton, this.scene);
                }
            )
        );

        this.renderer.addToSequenceButton.actionManager = new BABYLON.ActionManager(this.scene);
        this.renderer.addToSequenceButton.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                () => {
                    this.addCurrentSelectionToSequence();
                    animateButton(this.renderer.addToSequenceButton, this.scene);
                }
            )
        );
    }


    public toggleChordMode(): void {
        this.isChordMode = !this.isChordMode;

        if (this.pianoInteractions) {
            this.pianoInteractions.setChordMode(this.isChordMode);
        }


        this.renderer.updateChordModeButton(this.isChordMode);

        if (!this.isChordMode) {
            this.clearSelectedNotes();
        }
    }


    public isChordModeActive(): boolean {
        return this.isChordMode;
    }


    public toggleNoteSelection(note: string): void {
        if (!this.isChordMode) return;

        const noteIndex = this.selectedNotes.indexOf(note);

        if (noteIndex === -1) {
            this.selectedNotes.push(note);
            this.renderer.addNoteSelectionVisual(note);

            this.audioEngine.playNote(note, 0.3, "32n");
        } else {
            this.selectedNotes.splice(noteIndex, 1);
            this.renderer.removeNoteSelectionVisual(note);
        }
    }


    public addCurrentSelectionToSequence(): void {
        if (this.selectedNotes.length === 0) return;

        const timestamp = Date.now();

        const chordEvent: CompositionEvent = {
            type: 'chord',
            notes: [...this.selectedNotes],
            timestamp
        };


        this.playCurrentChord();


        this.eventBus.emit('COMPOSITION_CHORD_ADDED', { event: chordEvent });

        showNotification("Accord ajouté à la séquence!", "#ffcc00", this.scene);
    }


    public playCurrentChord(): void {
        if (this.selectedNotes.length === 0) return;
        this.audioEngine.playChord(this.selectedNotes);
    }


    public clearSelectedNotes(): void {
        this.selectedNotes = [];

        this.renderer.clearAllSelectionVisuals();
    }
    public setPianoInteractions(pianoInteractions: PianoInteractions): void {
        this.pianoInteractions = pianoInteractions;
    }

    public getSelectedNotes(): string[] {
        return [...this.selectedNotes];
    }
}