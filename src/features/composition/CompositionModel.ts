import { CompositionEvent, NoteInfo } from "../../core/types/Types.ts";


export class CompositionModel {
    private composition: CompositionEvent[] = [];
    private currentSequence: NoteInfo[] = [];


    public addNote(note: string): void {
        const timestamp = Date.now();


        this.currentSequence.push({ note, timestamp });

        const noteEvent: CompositionEvent = {
            type: 'note',
            notes: [note],
            timestamp
        };

        this.composition.push(noteEvent);
    }


    public addChord(notes: string[]): void {
        if (notes.length === 0) return;

        const timestamp = Date.now();

        notes.forEach(note => {
            this.currentSequence.push({ note, timestamp });
        });

        const chordEvent: CompositionEvent = {
            type: 'chord',
            notes: [...notes],
            timestamp
        };

        this.composition.push(chordEvent);
    }


    public addEvent(event: CompositionEvent): void {
        event.notes.forEach(note => {
            this.currentSequence.push({ note, timestamp: event.timestamp });
        });

        this.composition.push({...event});
    }


    public clear(): void {
        this.composition = [];
        this.currentSequence = [];
    }


    public getEvents(): CompositionEvent[] {
        return [...this.composition];
    }


    public getNoteSequence(): NoteInfo[] {
        return [...this.currentSequence];
    }


    public isEmpty(): boolean {
        return this.composition.length === 0;
    }


    public getEventCount(): number {
        return this.composition.length;
    }
}