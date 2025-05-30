import { EventBus } from '../../core/events/EventBus';
import { MusicalGuideModel } from './MusicalGuideModel';
import { MusicalGuideRenderer } from './MusicalGuideRenderer';

export class MusicalGuideLogic {
    private model: MusicalGuideModel;
    private renderer: MusicalGuideRenderer;
    private eventBus: EventBus;
    private hasAppeared: boolean = false;

    constructor(
        model: MusicalGuideModel,
        renderer: MusicalGuideRenderer,
    ) {
        this.model = model;
        this.renderer = renderer;
        this.eventBus = EventBus.getInstance();
    }


    public setupEventListeners(): void {
        this.eventBus.on('TRANSFORMATION_DISCOVERED', (data: { type: string }) => {
            if (!this.hasAppeared) {
                this.hasAppeared = true;
                this.model.appear();
                console.log('[MusicalGuide] Guide appeared!');
            }
            this.model.celebrateTransformation(data.type);
        });

        this.eventBus.on('NOTE_PLAYED', (data: { note: string }) => {
            if (this.model.shouldBeVisible()) {
                this.model.reactToNote(data.note);
            }
        });

        this.eventBus.on('COMPOSITION_CHORD_ADDED', () => {
            if (this.model.shouldBeVisible()) {
                this.model.setPattern('dance');
            }
        });

        this.eventBus.on('PLAYBACK_STARTED', () => {
            if (this.model.shouldBeVisible()) {
                this.model.setPattern('dance');
            }
        });

        this.eventBus.on('WORLD_COMPLETED', () => {
            if (this.model.shouldBeVisible()) {
                this.model.celebrateTransformation('world_completed');
                setTimeout(() => {
                    this.transformIntoTeacher();
                }, 3000);
            }
        });
    }


    public update(): void {
        this.model.update();
        this.renderer.update();
    }


    private transformIntoTeacher(): void {
        this.eventBus.emit('MAESTRO_MODE_ACTIVATED', {});
    }
}