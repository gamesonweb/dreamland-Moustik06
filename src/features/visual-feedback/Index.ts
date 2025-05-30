import * as BABYLON from '@babylonjs/core';
import { PianoModel } from '../piano/PianoModel';
import { VisualFeedbackModel } from './VisualFeedbackModel';
import { KeyBlinkController } from './KeyBlinkController';
import { VisualFeedbackLogic } from './VisualFeedbackLogic';


export class VisualFeedback {
    model: VisualFeedbackModel;
    keyBlinkController: KeyBlinkController;
    private logic: VisualFeedbackLogic;

    constructor(scene: BABYLON.Scene, pianoModel: PianoModel) {
        this.model = new VisualFeedbackModel();
        this.keyBlinkController = new KeyBlinkController(scene, pianoModel);
        this.logic = new VisualFeedbackLogic(
            this.model,
            this.keyBlinkController,
            scene
        );
    }

    public async initialize(transformationSequences: { [key: string]: string[] }): Promise<void> {
        this.model.initialize(transformationSequences);
        this.logic.setupEventListeners();
    }
}