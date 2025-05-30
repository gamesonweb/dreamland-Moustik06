import * as Tone from 'tone';
import {CompositionEvent} from '../types/Types';

export class QuantizationService {
    private static instance: QuantizationService;
    private bpm: number = 80;

    private constructor() {
        Tone.getTransport().bpm.value = this.bpm;
    }

    public static getInstance(): QuantizationService {
        if (!QuantizationService.instance) {
            QuantizationService.instance = new QuantizationService();
        }
        return QuantizationService.instance;
    }


    public normalizePlaybackTiming(events: CompositionEvent[]): { event: CompositionEvent, delay: number }[] {
        if (events.length === 0) return [];

        const normalizedEvents: { event: CompositionEvent, delay: number }[] = [];
        normalizedEvents.push({ event: events[0], delay: 0 });

        for (let i = 1; i < events.length; i++) {
            const eighthNoteDuration = (60 / this.bpm / 2) * 1000;
            normalizedEvents.push({
                event: events[i],
                delay: eighthNoteDuration
            });
        }

        return normalizedEvents;
    }
}