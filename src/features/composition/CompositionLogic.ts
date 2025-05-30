import { CompositionModel } from './CompositionModel';
import { EventBus } from '../../core/events/EventBus';
import { CompositionEvent } from "../../core/types/Types.ts";


export class CompositionLogic {
    private model: CompositionModel;
    private eventBus: EventBus;

    constructor(model: CompositionModel) {
        this.model = model;
        this.eventBus = EventBus.getInstance();
        this.setupEventListeners();
    }


    private setupEventListeners(): void {
        this.eventBus.on('COMPOSITION_NOTE_ADDED', (data: { event: CompositionEvent }) => {
            this.model.addEvent(data.event);
        });

        this.eventBus.on('COMPOSITION_CHORD_ADDED', (data: { event: CompositionEvent }) => {
            this.model.addEvent(data.event);
        });
    }


    public addNote(note: string): void {
        this.model.addNote(note);
    }


    public addChord(notes: string[]): void {
        this.model.addChord(notes);
    }


    public clearComposition(): void {
        this.model.clear();
        this.eventBus.emit('COMPOSITION_CLEARED', {});
    }

    public isEmpty(): boolean {
        return this.model.isEmpty();
    }


    public getEvents(): CompositionEvent[] {
        return this.model.getEvents();
    }
}