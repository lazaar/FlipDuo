import {
    createSlice,
    PayloadAction
} from '@reduxjs/toolkit'
import { DiamondsBag } from '../data/playTypes'

interface PlayState {
    diamonds: DiamondsBag;
    bestScoreSimple: number;
    bestScoreFlash: number;
}

const initialState: PlayState = {
    diamonds: { showAll: 3, showOne: 3, hearts: 1 },
    bestScoreSimple: 0,
    bestScoreFlash: 0
}

export const play = createSlice({
    name: 'play',
    initialState,
    reducers: {
        setDiamonds: (state, action: PayloadAction<DiamondsBag>) => {
            state.diamonds = action.payload;
        },
        updateDiamonds: (state, action: PayloadAction<Partial<DiamondsBag>>) => {
            state.diamonds = { ...state.diamonds, ...action.payload };
        },
        decrementDiamond: (state, action: PayloadAction<keyof DiamondsBag>) => {
            const key = action.payload;
            if (state.diamonds[key] > 0) {
                state.diamonds[key]--;
            }
        },
        incrementDiamond: (state, action: PayloadAction<{ key: keyof DiamondsBag; amount: number }>) => {
            const { key, amount } = action.payload;
            state.diamonds[key] += amount;
        },
        setBestScoreSimple: (state, action: PayloadAction<number>) => {
            if (action.payload > state.bestScoreSimple) {
                state.bestScoreSimple = action.payload;
            }
        },
        setBestScoreFlash: (state, action: PayloadAction<number>) => {
            if (action.payload > state.bestScoreFlash) {
                state.bestScoreFlash = action.payload;
            }
        },
        resetDiamonds: (state) => {
            state.diamonds = { showAll: 3, showOne: 3, hearts: 1 };
        },
    },
})

export const {
    setDiamonds,
    updateDiamonds,
    decrementDiamond,
    incrementDiamond,
    setBestScoreSimple,
    setBestScoreFlash,
    resetDiamonds,
} = play.actions

export default play.reducer;
