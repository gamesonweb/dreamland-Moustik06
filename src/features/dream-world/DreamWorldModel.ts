import * as BABYLON from '@babylonjs/core';


export class DreamWorldModel {
    //@ts-ignore
    public ground: BABYLON.Mesh;
    //@ts-ignore
    public skybox: BABYLON.Mesh;
    //@ts-ignore
    public worldLight: BABYLON.HemisphericLight;
    public spotlights: BABYLON.SpotLight[] = [];

    //@ts-ignore
    public particleTexture: BABYLON.Texture;


    private transformations: Map<string, boolean> = new Map();


    public readonly transformationSequences: { [key: string]: string[] } = {
        'light': ['C3', 'E3', 'G3'],
        'color': ['F3', 'A3', 'C4'],
        'sky': ['D3', 'F#3', 'A3'],
    };

    constructor() {

        Object.keys(this.transformationSequences).forEach(key => {
            this.transformations.set(key, false);
        });
    }


    public isTransformationDiscovered(transformationType: string): boolean {
        return this.transformations.get(transformationType) || false;
    }


    public setTransformationDiscovered(transformationType: string): void {
        this.transformations.set(transformationType, true);
    }


    public areAllTransformationsDiscovered(): boolean {
        return Array.from(this.transformations.values()).every(value => value === true);
    }


    public getTransformationTypes(): string[] {
        return Object.keys(this.transformationSequences);
    }


    public getTransformationSequence(transformationType: string): string[] {
        return this.transformationSequences[transformationType] || [];
    }


    public getNoteIndex(note: string): number {
        const notes = [
            'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
            'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'
        ];

        return notes.indexOf(note);
    }
}