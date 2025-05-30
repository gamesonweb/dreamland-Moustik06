import { EventBus } from '../../core/events/EventBus';
import { VisualFeedbackModel } from './VisualFeedbackModel';
import { KeyBlinkController } from './KeyBlinkController';
import { showNotification } from '../../core/utils/AnimationUtils';


export class VisualFeedbackLogic {
    private eventBus: EventBus;
    private model: VisualFeedbackModel;
    private keyBlinkController: KeyBlinkController;
    private scene: any;
    private debug: boolean = true;


    private feedbackEnabled: boolean = true;
    private isPlaybackActive: boolean = false;

    constructor(
        model: VisualFeedbackModel,
        keyBlinkController: KeyBlinkController,
        scene: any
    ) {
        this.eventBus = EventBus.getInstance();
        this.model = model;
        this.keyBlinkController = keyBlinkController;
        this.scene = scene;
    }


    public setupEventListeners(): void {
        console.log('[VisualFeedback] Setting up event listeners');


        this.eventBus.on('NOTE_PLAYED', (data: { note: string }) => {
            if (!this.feedbackEnabled || this.isPlaybackActive) return;

            if (this.debug) {
                console.log(`[VisualFeedback] Note played: ${data.note}`);
            }

            this.keyBlinkController.stopAllBlinking();

            this.model.addRecentNote(data.note);

            setTimeout(() => {
                this.updateVisualFeedback();
            }, 100);
        });

        this.eventBus.on('PLAYBACK_STARTED', () => {
            console.log('[VisualFeedback] Playback started - disabling feedback');

            this.isPlaybackActive = true;
            this.feedbackEnabled = false;

            this.keyBlinkController.stopAllBlinking();
        });

        this.eventBus.on('PLAYBACK_COMPLETED', () => {
            console.log('[VisualFeedback] Playback completed - re-enabling feedback');

            this.isPlaybackActive = false;
            this.feedbackEnabled = true;

            this.model.resetAfterPlayback();

            setTimeout(() => {
                this.updateVisualFeedback();
            }, 500);
        });

        this.eventBus.on('TRANSFORMATION_DISCOVERED', (data: { type: string }) => {
            if (this.debug) {
                console.log(`[VisualFeedback] Transformation discovered: ${data.type}`);
            }

            this.model.markAsDiscovered(data.type);

            showNotification(`${data.type} découvert!`, "#00ff00", this.scene);

            setTimeout(() => {
               if (!this.isPlaybackActive && this.feedbackEnabled) {
                    this.updateVisualFeedback();
                }
            }, 1500);
        });


        this.eventBus.on('WORLD_COMPLETED', () => {
            console.log('[VisualFeedback] World completed');
            this.keyBlinkController.stopAllBlinking();
            this.feedbackEnabled = true;
            this.isPlaybackActive = false;
        });
    }

    private updateVisualFeedback(): void {
        if (!this.feedbackEnabled || this.isPlaybackActive) return;

        if (this.model.hasCompleteSequences()) {
            const completeSequences = this.model.getCompleteSequences();
            showNotification(`Séquence complète: ${completeSequences[0]}! Activez le levier!`, "#ffff00", this.scene);
            return;
        }

        const suggestion = this.model.getSequenceToSuggest();

        if (suggestion && suggestion.remainingNotes.length > 0) {
            if (this.debug) {
                console.log(`[VisualFeedback] Suggesting notes for ${suggestion.type}: ${suggestion.remainingNotes.join(', ')}`);
            }

            this.keyBlinkController.blinkKeys(suggestion.remainingNotes);
        }
    }
}