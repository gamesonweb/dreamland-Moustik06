// src/features/tutorial/TutorialManager.ts - Version corrigée
import {TUTORIAL_STEPS, TutorialStep, TutorialStepData} from "./TutorialSteps.ts";
import {TutorialRenderer} from "./TutorialRenderer.ts";
import {EventBus} from "../../core/events/EventBus.ts";
import {Scene} from "@babylonjs/core";

export class TutorialManager {
    private renderer: TutorialRenderer;
    private eventBus: EventBus;

    private currentStep: number = 0;
    private isActive: boolean = false;
    private lastPlayedNotes: string[] = [];

    constructor(scene: Scene) {
        this.renderer = new TutorialRenderer(scene);
        this.eventBus = EventBus.getInstance();
    }

    public async initialize(): Promise<void> {
        await this.renderer.initialize();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {

        this.eventBus.on('NOTE_PLAYED', (data) => {
            if (!this.isActive) return;

            this.lastPlayedNotes.push(data.note);
            this.lastPlayedNotes = this.lastPlayedNotes.slice(-10); // Garder les 10 dernières

            this.checkStepCompletion();
        });

        this.eventBus.on('TRANSFORMATION_DISCOVERED', (data) => {
            if (data.type === 'light' && this.isActive) {
                const currentStepData = TUTORIAL_STEPS[this.currentStep];
                if (currentStepData.step === TutorialStep.PLAY_NOTE_3) {
                    this.nextStep();
                }
            }
        });

        document.addEventListener('TUTORIAL_SKIP', () => {
            this.skip();
        });

        document.addEventListener('TUTORIAL_CONTINUE', () => {
            this.nextStep();
        });
    }

    public start(): void {
        this.isActive = true;
        this.currentStep = 0;
        this.showStep(TUTORIAL_STEPS[0]);
    }

    private showStep(stepData: TutorialStepData): void {
        this.renderer.showStepUI(stepData);

        if (stepData.highlights) {
            stepData.highlights.forEach(highlight => {
                this.renderer.addHighlight(highlight);
            });
        }
    }

    private checkStepCompletion(): void {
        const currentStepData = TUTORIAL_STEPS[this.currentStep];

        if (!currentStepData.action) {
            return;
        }

        switch (currentStepData.action.type) {
            case 'click_note':
                // Debug: Ajouter un log pour voir ce qui se passe
                console.log('[Tutorial] Note jouée:', this.lastPlayedNotes[this.lastPlayedNotes.length - 1]);
                console.log('[Tutorial] Note attendue:', currentStepData.action.target);

                const expectedNote = currentStepData.action.target as string;
                const lastPlayedNote = this.lastPlayedNotes[this.lastPlayedNotes.length - 1];

                if (lastPlayedNote === expectedNote) {
                    console.log('[Tutorial] Note correcte, passage à l\'étape suivante');

                    setTimeout(() => {
                        this.nextStep();
                    }, 1000);
                }
                break;

            case 'play_sequence':
                const targetSequence = currentStepData.action.target as string[];
                if (this.validateSequence(targetSequence)) {
                    this.nextStep();
                }
                break;

            case 'click_continue':
                break;

            default:
                break;
        }
    }
    private validateSequence(targetSequence: string[]): boolean {
        if (this.lastPlayedNotes.length < targetSequence.length) return false;

        const actualSequence = this.lastPlayedNotes.slice(-targetSequence.length);
        return actualSequence.join(',') === targetSequence.join(',');
    }

    private nextStep(): void {
        this.currentStep++;

        if (this.currentStep >= TUTORIAL_STEPS.length) {
            this.complete();
            return;
        }

        this.renderer.clearAllHighlights();

        this.showStep(TUTORIAL_STEPS[this.currentStep]);
    }

    private complete(): void {
        this.isActive = false;
        this.renderer.showCompletionMessage();

        localStorage.setItem('tutorialCompleted', 'true');

        // Émettre un événement pour informer le reste du jeu
        this.eventBus.emit('TUTORIAL_COMPLETED', {});
    }

    public skip(): void {
        this.nextStep();
    }
}