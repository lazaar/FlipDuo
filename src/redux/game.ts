import {
    createSlice,
    PayloadAction
} from '@reduxjs/toolkit'
import constants from "../data/constants";

interface GameState {
    currentLevel: number;
    currentCrossword: number;
    hints: number;
    stars: Record<string, number>;
    lettersHinted: string[];
    correctedQuestions: string[];
    lastDate: string | undefined;
    rewardVideo: {
        loading: boolean;
        ready: boolean;
        success: boolean;
    };
}

const initialState: GameState = {
    currentLevel: 0,
    currentCrossword: 0,
    hints: 5,
    stars: {},
    lettersHinted: [],
    correctedQuestions: [],
    lastDate: undefined,
    rewardVideo: { loading: false, ready: false, success: false }
}

export const game = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setDate: (state) => {
            state.lastDate = new Date().toLocaleDateString("en-US")
        },
        incrementLevel: (state) => {
            state.currentLevel = state.currentLevel + 1
        },
        incrementCrossword: (state) => {
            state.currentCrossword = state.currentCrossword + 1
        },
        setCrossword: (state, action: PayloadAction<number>) => {
            state.currentCrossword = action.payload;
        },
        decrementHints: (state) => {
            state.hints = state.hints - constants.HINT_COST;
        },
        incrementHints: (state, action: PayloadAction<string>) => {
            state.hints = state.hints + parseInt(action.payload);
        },
        setStars: (state, action: PayloadAction<{ crosswordId: string; stars: number }>) => {
            state.stars[action.payload.crosswordId] = action.payload.stars
        },
        setRewardVideo: (state, action: PayloadAction<Partial<GameState['rewardVideo']>>) => {
            state.rewardVideo = {...state.rewardVideo, ...action.payload}
        },
        setLettersHinted: (state, action: PayloadAction<string>) => {
            state.lettersHinted.push(action.payload);
        },
        setCorrectedQuestions: (state, action: PayloadAction<string>) => {
            state.correctedQuestions.push(action.payload);
        },
    },
})

export const {
    incrementLevel,
    incrementCrossword,
    decrementHints,
    incrementHints,
    setStars,
    setLettersHinted,
    setCorrectedQuestions,
    setCrossword,
    setDate,
    setRewardVideo
} = game.actions

export default game.reducer;