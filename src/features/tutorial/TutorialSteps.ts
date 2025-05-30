// src/features/tutorial/TutorialSteps.ts
export enum TutorialStep {
    WELCOME = 'welcome',
    FIRST_NOTE = 'first_note',
    SEQUENCE_INTRO = 'sequence_intro',
    SEQUENCE_PREVIEW = 'sequence_preview',
    PLAY_NOTE_3 = 'play_note_3',
    SEQUENCE_SUCCESS = 'sequence_success',
    PLAYBACK = 'playback',
}


export interface TutorialHighlight {
    type: 'key' | 'button' | 'element';
    target: string | string[];
    pulse?: boolean;
    number?: number;
    showNumbers?: boolean;
}

export interface TutorialAction {
    type: 'click_note' | 'play_sequence' | 'activate_chord' | 'click_lever' | 'click_continue';
    target?: string | string[];
    validation?: (data: any) => boolean;
    number?: number;
}

export interface TutorialStepData {
    step: TutorialStep;
    title: string;
    message: string;
    action?: TutorialAction;
    highlights?: TutorialHighlight[];
}


export const TUTORIAL_STEPS: TutorialStepData[] = [
    {
        step: TutorialStep.WELCOME,
        title: "Bienvenue dans DreamLand Piano !",
        message: "Vous allez créer un monde merveilleux en jouant des séquences musicales.",
        action: {
            type: 'click_continue'
        }
    },
    {
        step: TutorialStep.FIRST_NOTE,
        title: "Jouez votre première note",
        message: "Cliquez sur la touche C3 pour commencer",
        action: {
            type: 'click_note',
            target: 'C3',
            validation: (data) => data.note === 'C3'
        },
        highlights: [{
            type: 'key',
            target: 'C3',
            pulse: true
        }]
    },
    {
        step: TutorialStep.SEQUENCE_INTRO,
        title: "Les séquences magiques",
        message: "Nous allons jouer une séquence de 3 notes pour créer de la lumière.\nChaque note sera indiquée clairement !",
        action: {
            type: 'click_continue'
        }
    },
    {
        step: TutorialStep.SEQUENCE_PREVIEW,
        title: "Voici la séquence complète",
        message: "Observez bien : terminez la séquences avec E3, puis G3\n",
        action: {
            type: 'click_continue'
        },
        highlights: [{
            type: 'key',
            target: ['E3', 'G3'],
            pulse: true,
            showNumbers: true
        }]
    },
    {
        step: TutorialStep.PLAYBACK,
        title: "Rejouez votre séquence",
        message: "Appuez sur le levier pour rejouer la séquence !",
        action: {
            type: 'play_sequence',
            target: ['C3', 'E3', 'G3'],
        },
    },
    {
        step: TutorialStep.SEQUENCE_SUCCESS,
        title: "Magnifique ! ✨",
        message: "Vous avez créé de la lumière !\n Les autres transformations fonctionnent de la même manière.\nChaque séquence de 3 notes crée une transformation différente.",
        action: {
            type: 'click_continue'
        }
    }
];