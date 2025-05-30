export enum GuideEmotion {
    HIDDEN = 'hidden',
    CURIOUS = 'curious',
    EXCITED = 'excited',
    DANCING = 'dancing',
    PATIENT = 'patient',
    CELEBRATING = 'celebrating',
    RESTING = 'resting'
}

export interface GuideState {
    isVisible: boolean;
    currentEmotion: GuideEmotion;
    targetPosition: { x: number, y: number, z: number };
    currentPosition: { x: number, y: number, z: number };
    lastInteractionTime: number;
    transformationsWitnessed: string[];
    currentPattern: string;
    patternStartTime: number;
    emotionStartTime: number;
}

export class MusicalGuideModel {
    private state: GuideState;
    private idleTimeout: number = 15000; // 15 secondes avant de se reposer
    private hideTimeout: number = 45000; // 45 secondes avant de se cacher

    constructor() {
        const startPos = { x: 0, y: 3, z: -3 };
        this.state = {
            isVisible: false,
            currentEmotion: GuideEmotion.HIDDEN,
            targetPosition: {...startPos},
            currentPosition: {...startPos},
            lastInteractionTime: Date.now(),
            transformationsWitnessed: [],
            currentPattern: 'idle',
            patternStartTime: Date.now(),
            emotionStartTime: Date.now()
        };
    }


    public appear(): void {
        this.state.isVisible = true;
        this.state.currentEmotion = GuideEmotion.CURIOUS;
        this.state.lastInteractionTime = Date.now();
        this.state.emotionStartTime = Date.now();
        this.startPattern('float_around');
    }


    public reactToNote(_: string): void {
        this.state.lastInteractionTime = Date.now();
        const timeSinceLastChange = Date.now() - this.state.emotionStartTime;


        if (timeSinceLastChange < 1000) return;


        if (this.state.currentEmotion === GuideEmotion.DANCING) {
            this.setEmotion(GuideEmotion.EXCITED);
        } else if (this.state.currentEmotion === GuideEmotion.EXCITED) {

            if (Math.random() > 0.5) {
                this.setEmotion(GuideEmotion.DANCING);
            }
        } else {

            this.setEmotion(Math.random() > 0.5 ? GuideEmotion.EXCITED : GuideEmotion.DANCING);
        }
    }


    private setEmotion(emotion: GuideEmotion): void {
        if (this.state.currentEmotion === emotion) return;

        this.state.currentEmotion = emotion;
        this.state.emotionStartTime = Date.now();


        switch (emotion) {
            case GuideEmotion.EXCITED:
                this.startPattern('bounce');
                break;
            case GuideEmotion.DANCING:
                this.startPattern('dance');
                break;
            case GuideEmotion.CELEBRATING:
                this.startPattern('celebration');
                break;
            case GuideEmotion.CURIOUS:
                this.startPattern('float_around');
                break;
            case GuideEmotion.RESTING:
                this.startPattern('rest');
                break;
        }
    }


    private startPattern(pattern: string): void {
        this.state.currentPattern = pattern;
        this.state.patternStartTime = Date.now();
    }



    public celebrateTransformation(transformationType: string): void {
        this.setEmotion(GuideEmotion.CELEBRATING);
        this.state.lastInteractionTime = Date.now();
        this.state.transformationsWitnessed.push(transformationType);

        // Retour à curious après célébration
        setTimeout(() => {
            if (this.state.currentEmotion === GuideEmotion.CELEBRATING) {
                this.setEmotion(GuideEmotion.CURIOUS);
            }
        }, 5000);
    }


    public update(): void {
        const timeSinceLastInteraction = Date.now() - this.state.lastInteractionTime;


        if (timeSinceLastInteraction > this.idleTimeout) {
            if (this.state.currentEmotion !== GuideEmotion.RESTING &&
                this.state.currentEmotion !== GuideEmotion.HIDDEN &&
                this.state.currentEmotion !== GuideEmotion.CELEBRATING) {
                this.setEmotion(GuideEmotion.RESTING);
            }
        }


        if (timeSinceLastInteraction > this.hideTimeout) {
            if (this.state.currentEmotion !== GuideEmotion.HIDDEN) {
                this.state.currentEmotion = GuideEmotion.HIDDEN;
                this.state.isVisible = false;
            }
        }


        this.updateTargetPosition();


        this.interpolatePosition();
    }


    private updateTargetPosition(): void {
        const time = performance.now() * 0.001;
        const patternTime = (Date.now() - this.state.patternStartTime) * 0.001;

        switch (this.state.currentPattern) {
            case 'float_around':

                const radius = 1.2;
                this.state.targetPosition.x = Math.cos(patternTime * 0.3) * radius;
                this.state.targetPosition.y = 3 + Math.sin(patternTime * 0.4) * 0.15;
                this.state.targetPosition.z = -3 + Math.sin(patternTime * 0.3) * radius;
                break;

            case 'dance':

                this.state.targetPosition.x = Math.sin(patternTime * 1.2) * 0.8;
                this.state.targetPosition.y = 3 + Math.sin(patternTime * 2.5) * 0.25;
                this.state.targetPosition.z = -3 + Math.cos(patternTime * 0.8) * 0.3;
                break;

            case 'bounce':

                this.state.targetPosition.x = Math.cos(patternTime * 1.5) * 0.4;
                this.state.targetPosition.y = 3 + Math.abs(Math.sin(patternTime * 3)) * 0.4;
                this.state.targetPosition.z = -3;
                break;

            case 'celebration':

                const spiralRadius = 0.8 + Math.sin(patternTime * 0.5) * 0.2;
                this.state.targetPosition.x = Math.cos(patternTime * 2) * spiralRadius;
                this.state.targetPosition.y = 3 + patternTime * 0.5;
                this.state.targetPosition.z = -3 + Math.sin(patternTime * 2) * spiralRadius;


                if (patternTime > 5) {
                    this.state.targetPosition.y = 3;
                }
                break;

            case 'rest':

                this.state.targetPosition.x = 0;
                this.state.targetPosition.y = 2.5 + Math.sin(time * 0.5) * 0.05;
                this.state.targetPosition.z = -3;
                break;

            default:

                this.state.targetPosition.x = 0;
                this.state.targetPosition.y = 3 + Math.sin(time * 0.8) * 0.1;
                this.state.targetPosition.z = -3;
                break;
        }
    }


    private interpolatePosition(): void {
        const lerpFactor = 0.05; // Ajustez pour contrôler la fluidité

        this.state.currentPosition.x = this.lerp(
            this.state.currentPosition.x,
            this.state.targetPosition.x,
            lerpFactor
        );
        this.state.currentPosition.y = this.lerp(
            this.state.currentPosition.y,
            this.state.targetPosition.y,
            lerpFactor
        );
        this.state.currentPosition.z = this.lerp(
            this.state.currentPosition.z,
            this.state.targetPosition.z,
            lerpFactor
        );
    }


    private lerp(start: number, end: number, factor: number): number {
        return start + (end - start) * factor;
    }

    public getState(): GuideState {
        return { ...this.state };
    }


    public shouldBeVisible(): boolean {
        return this.state.isVisible && this.state.currentEmotion !== GuideEmotion.HIDDEN;
    }


    public setPattern(pattern: string): void {
        this.startPattern(pattern);
    }

}