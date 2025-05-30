import * as BABYLON from '@babylonjs/core';


export class PianoModel {
    public readonly notes: string[] = [
        'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
        'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'
    ];

    public readonly whiteKeyWidth: number = 0.45;
    public readonly whiteKeyDepth: number = 1.5;
    public readonly blackKeyWidth: number = 0.3;
    public readonly blackKeyDepth: number = 1;
    public readonly blackKeyHeight: number = 0.2;
    public readonly keySpacing: number = 0.05;


    public keyMeshes: Map<string, BABYLON.Mesh> = new Map();
    public keyLabels: Map<string, BABYLON.Mesh> = new Map();

    // @ts-ignore
    public pianoMesh: BABYLON.Mesh;

    public isBlackKey(note: string): boolean {
        return note.includes('#');
    }

}