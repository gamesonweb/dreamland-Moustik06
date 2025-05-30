import * as BABYLON from '@babylonjs/core';
import { DreamWorldModel } from './DreamWorldModel';
import { DreamWorldRenderer } from './DreamWorldRenderer';
import { DreamWorldTransformer } from './DreamWorldTransformer';


export class DreamWorld {
    //@ts-ignore
    private scene: BABYLON.Scene;
    model: DreamWorldModel;
    private renderer: DreamWorldRenderer;
    private transformer: DreamWorldTransformer;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
        this.model = new DreamWorldModel();
        this.renderer = new DreamWorldRenderer(scene, this.model);
        this.transformer = new DreamWorldTransformer(this.model, this.renderer);
    }


    public async initialize(): Promise<void> {
        await this.renderer.initialize();
        this.transformer.setupEventListeners();
    }

}