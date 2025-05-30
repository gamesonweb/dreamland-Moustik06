import * as Tone from 'tone';
import { EventBus } from '../events/EventBus';

export class AudioEngine {
    private static instance: AudioEngine;
    private synth: Tone.PolySynth;
    private eventBus: EventBus;

    private constructor() {
        this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
        this.eventBus = EventBus.getInstance();
    }

    public static getInstance(): AudioEngine {
        if (!AudioEngine.instance) {
            AudioEngine.instance = new AudioEngine();
        }
        return AudioEngine.instance;
    }


    public playNote(note: string, velocity: number = 1, duration: string = "8n"): void {
        this.synth.triggerAttackRelease(note, duration, undefined, velocity);
        this.eventBus.emit('NOTE_PLAYED', { note });
    }

    public playChord(notes: string[], velocity: number = 1, duration: string = "8n"): void {
        this.synth.triggerAttackRelease(notes, duration, undefined, velocity);
    }
}