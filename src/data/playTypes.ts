export type CardState = "show" | "hide" | "load" | "moving";

export type Difficulty = "easy" | "medium" | "hard";

export interface Card {
    value: number | "X" | "J";
    state: CardState;
    timeBonus?: number; // Bonus de temps en secondes pour les cartes flash mode
}

export interface FlipConstantsType {
    delay: {
        showAllDiamonds: number;
        removeCardOnsuccess: number;
        showAllShuffle: number;
        generateCardOnsuccess: number;
        hideAllShuffle: number;
        hideOnsuccess: number;
        hideOnError: number;
        firstShowDelay: number;
        firstHideAll: number;
    };
    init: {
        hearts: number;
        initValue: number;
    };
    mode: {
        simple: number;
        flash: number;
    };
    difficulty: {
        easy: number;
        medium: number;
        hard: number;
    };
}

export interface DiamondsBag {
    showAll: number;
    showOne: number;
    hearts: number;
}

export interface PlayPageProps {
    mode?: keyof FlipConstantsType["mode"];
    difficulty?: Difficulty;
}
