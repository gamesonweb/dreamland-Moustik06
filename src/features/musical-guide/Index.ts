// src/features/musical-guide/Index.ts - VERSION CORRIGÉE
import * as BABYLON from '@babylonjs/core';
import { MusicalGuideModel } from './MusicalGuideModel';
import { MusicalGuideRenderer } from './MusicalGuideRenderer';
import { MusicalGuideLogic } from './MusicalGuideLogic';


export class MusicalGuide {
    model: MusicalGuideModel;
    private renderer: MusicalGuideRenderer;
    private logic: MusicalGuideLogic;

    constructor(scene: BABYLON.Scene) {
        this.model = new MusicalGuideModel();
        this.renderer = new MusicalGuideRenderer(scene, this.model);
        this.logic = new MusicalGuideLogic(this.model, this.renderer);
    }


    public async initialize(): Promise<void> {
        await this.renderer.initialize();
        this.logic.setupEventListeners();
    }


    public update(): void {
        this.logic.update();
    }
}