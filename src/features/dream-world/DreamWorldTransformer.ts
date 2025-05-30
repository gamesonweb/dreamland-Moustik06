import { DreamWorldModel } from './DreamWorldModel';
import { DreamWorldRenderer } from './DreamWorldRenderer';
import { EventBus } from '../../core/events/EventBus';
import { NoteInfo } from "../../core/types/Types.ts";


export class DreamWorldTransformer {
    private model: DreamWorldModel;
    private renderer: DreamWorldRenderer;
    private eventBus: EventBus;

    constructor(model: DreamWorldModel, renderer: DreamWorldRenderer) {
        this.model = model;
        this.renderer = renderer;
        this.eventBus = EventBus.getInstance();
    }


    public setupEventListeners(): void {
        this.eventBus.on('NOTE_PLAYED', (data: { note: string }) => {
            this.renderer.createNoteEffect(data.note);
        });

        this.eventBus.on('SEQUENCE_ACTIVATED', (data: { sequence: NoteInfo[] }) => {
            this.checkForTransformation(data.sequence);
        });
    }


    private checkForTransformation(sequence: NoteInfo[]): void {
        const notes = sequence.map(item => item.note);

        Object.entries(this.model.transformationSequences).forEach(([transformationKey, requiredNotes]) => {

            const hasAllNotes = requiredNotes.every(note => notes.includes(note));

            if (hasAllNotes && !this.model.isTransformationDiscovered(transformationKey)) {

                this.applyTransformation(transformationKey);
                this.model.setTransformationDiscovered(transformationKey);
            }
        });

        if (this.model.areAllTransformationsDiscovered()) {
            this.completeWorld();
        }
    }


    private applyTransformation(transformationType: string): void {
        this.renderer.applyTransformation(transformationType);

        this.eventBus.emit('TRANSFORMATION_DISCOVERED', { type: transformationType });
    }


    private completeWorld(): void {

        console.log("Le monde est complet!");
        this.renderer.createCompletionCelebration();
        this.eventBus.emit('WORLD_COMPLETED', {});
    }
}