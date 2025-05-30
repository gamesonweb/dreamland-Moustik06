export interface NoteInfo {
    note: string;
    timestamp: number;
}

export type EventType = {
    NOTE_PLAYED: 'NOTE_PLAYED';
    SEQUENCE_ACTIVATED: 'SEQUENCE_ACTIVATED';
    TRANSFORMATION_DISCOVERED: 'TRANSFORMATION_DISCOVERED';
    WORLD_COMPLETED: 'WORLD_COMPLETED';
    COMPOSITION_NOTE_ADDED: 'COMPOSITION_NOTE_ADDED';
    COMPOSITION_CHORD_ADDED: 'COMPOSITION_CHORD_ADDED';
    COMPOSITION_CLEARED: 'COMPOSITION_CLEARED';
    TUTORIAL_COMPLETED: 'TUTORIAL_COMPLETED';
    PLAYBACK_STARTED: 'PLAYBACK_STARTED';
    PLAYBACK_COMPLETED: 'PLAYBACK_COMPLETED';
    MAESTRO_MODE_ACTIVATED: 'MAESTRO_MODE_ACTIVATED';
}

export type EventPayload = {
    NOTE_PLAYED: { note: string };
    SEQUENCE_ACTIVATED: { sequence: NoteInfo[] };
    TRANSFORMATION_DISCOVERED: { type: string };
    WORLD_COMPLETED: Record<string, never>;
    COMPOSITION_NOTE_ADDED: { event: CompositionEvent };
    COMPOSITION_CHORD_ADDED: { event: CompositionEvent };
    COMPOSITION_CLEARED: Record<string, never>;
    TUTORIAL_COMPLETED: Record<string, never>;
    PLAYBACK_STARTED: Record<string, never>;
    PLAYBACK_COMPLETED: Record<string, never>;
    MAESTRO_MODE_ACTIVATED: Record<string, never>;
}

export interface CompositionEvent {
    type: 'note' | 'chord';
    notes: string[];
    timestamp: number;
    quantizedTime?: QuantizedTime;
}
export interface QuantizedTime {
    bar: number;
    beat: number;
    sixteenth: number;
    formatted: string;
}