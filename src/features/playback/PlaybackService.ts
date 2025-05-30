import { EventBus } from '../../core/events/EventBus';
import { AudioEngine } from '../../core/audio/AudioEngine';
import { Piano } from '../piano';
import { LeverRenderer } from './LeverRenderer';
import {CompositionEvent} from "../../core/types/Types.ts";
import {QuantizationService} from "../../core/timing/QuantizationService.ts";

export class PlaybackService {
    private eventBus: EventBus;
    private audioEngine: AudioEngine;
    private piano: Piano;
    private leverRenderer: LeverRenderer;
    private isPlaying: boolean = false;


    constructor(piano: Piano, leverRenderer: LeverRenderer) {
        this.piano = piano;
        this.leverRenderer = leverRenderer;
        this.eventBus = EventBus.getInstance();
        this.audioEngine = AudioEngine.getInstance();

    }

    public playComposition(composition: CompositionEvent[]): void {
        if (this.isPlaying || composition.length === 0) return;
        this.eventBus.emit('PLAYBACK_STARTED', {});
        this.piano.setPlayingState(true);

        this.leverRenderer.animateLever();

        const quantizationService = QuantizationService.getInstance();
        const normalizedEvents = quantizationService.normalizePlaybackTiming(composition);

        this.playNormalizedEvents(normalizedEvents, 0);
    }

    private playNormalizedEvents(events: { event: CompositionEvent, delay: number }[], index: number): void {
        if (index >= events.length) {
            this.isPlaying = false;
            this.piano.setPlayingState(false);

            const allNotes = events.flatMap(item =>
                item.event.notes.map(note => ({
                    note,
                    timestamp: item.event.timestamp
                }))
            );

            this.eventBus.emit('SEQUENCE_ACTIVATED', { sequence: allNotes });
            this.eventBus.emit('PLAYBACK_COMPLETED', {});
            return;
        }

        const currentItem = events[index];

        setTimeout(() => {

            if (currentItem.event.type === 'chord') {

                this.audioEngine.playChord(currentItem.event.notes);


                currentItem.event.notes.forEach(note => {

                    this.piano.getInteractions().animateKey(note);
                });
            } else {

                this.piano.playNote(currentItem.event.notes[0], true);
            }


            this.playNormalizedEvents(events, index + 1);
        }, currentItem.delay);
    }

    public isPlaybackActive(): boolean {
        return this.isPlaying;
    }

}