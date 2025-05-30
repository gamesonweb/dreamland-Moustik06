// src/features/visual-feedback/VisualFeedbackModel.ts (version avec séquence complète)
export interface SequenceProgress {
    transformationType: string;
    requiredNotes: string[];
    playedNotes: string[];
    progress: number;
    isComplete: boolean; // NOUVEAU
}


export class VisualFeedbackModel {
    private progressData: Map<string, SequenceProgress> = new Map();
    private discoveredTypes: Set<string> = new Set();
    private recentNotes: string[] = [];
    private completeSequences: string[] = []; // NOUVEAU
    private debug: boolean = true;


    public initialize(transformationSequences: { [key: string]: string[] }): void {
        console.log('[VisualFeedback] Initializing sequences:', transformationSequences);

        Object.entries(transformationSequences).forEach(([type, notes]) => {
            this.progressData.set(type, {
                transformationType: type,
                requiredNotes: notes,
                playedNotes: [],
                progress: 0,
                isComplete: false
            });
        });
    }


    public addRecentNote(note: string): void {

        this.recentNotes.push(note);

        if (this.recentNotes.length > 6) {
            this.recentNotes.shift();
        }

        if (this.debug) {
            console.log(`[VisualFeedback] Recent notes: ${this.recentNotes.join(', ')}`);
        }

        this.updateProgress();

        this.checkCompleteSequences();
    }


    private updateProgress(): void {
        this.progressData.forEach((data, type) => {
            if (this.discoveredTypes.has(type)) return;

            const matchingNotes: string[] = [];
            data.requiredNotes.forEach(requiredNote => {
                if (this.recentNotes.includes(requiredNote) && !matchingNotes.includes(requiredNote)) {
                    matchingNotes.push(requiredNote);
                }
            });

            data.playedNotes = matchingNotes;
            data.progress = matchingNotes.length;
            data.isComplete = data.progress === 3;

            if (this.debug && data.progress > 0) {
                console.log(`[VisualFeedback] ${type}: ${data.progress}/3 - Complete: ${data.isComplete}`);
            }
        });
    }


    private checkCompleteSequences(): void {
        const completeSequences: string[] = [];

        this.progressData.forEach((data, type) => {
            if (!this.discoveredTypes.has(type) && data.isComplete) {
                completeSequences.push(type);
            }
        });

        this.completeSequences = completeSequences;

        if (this.debug && completeSequences.length > 0) {
            console.log(`[VisualFeedback] Complete sequences: ${completeSequences.join(', ')}`);
        }
    }



    public resetAfterPlayback(): void {
        this.recentNotes = [];
        this.completeSequences = [];

        this.progressData.forEach((data) => {
            if (!this.discoveredTypes.has(data.transformationType)) {
                data.playedNotes = [];
                data.progress = 0;
                data.isComplete = false;
            }
        });

        if (this.debug) {
            console.log(`[VisualFeedback] Reset completed. Discovered: ${Array.from(this.discoveredTypes).join(', ')}`);
        }
    }

    public getSequenceToSuggest(): { type: string, remainingNotes: string[] } | null {
        if (this.hasCompleteSequences()) {
            return null;
        }

        let bestType: string | null = null;
        let bestProgress = 0;

        this.progressData.forEach((data, type) => {
            if (!this.discoveredTypes.has(type) && data.progress > bestProgress && data.progress < 3) {
                bestType = type;
                bestProgress = data.progress;
            }
        });

        if (bestType) {
            const data = this.progressData.get(bestType);
            if (data) {
                const remainingNotes = data.requiredNotes.filter(note => !data.playedNotes.includes(note));
                return { type: bestType, remainingNotes };
            }
        }

        return null;
    }

    public hasCompleteSequences(): boolean {
        return this.completeSequences.length > 0 &&
            this.completeSequences.some(type => !this.discoveredTypes.has(type));
    }


    public getCompleteSequences(): string[] {
        return this.completeSequences.filter(type => !this.discoveredTypes.has(type));
    }


    public markAsDiscovered(transformationType: string): void {
        this.discoveredTypes.add(transformationType);
        const data = this.progressData.get(transformationType);
        if (data) {
            data.progress = 3;
            data.playedNotes = [...data.requiredNotes];
            data.isComplete = true;
        }


        this.completeSequences = this.completeSequences.filter(type => type !== transformationType);

        if (this.debug) {
            console.log(`[VisualFeedback] Marked as discovered: ${transformationType}`);
        }
    }


}