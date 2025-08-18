import {
    createSlice,
    PayloadAction
} from '@reduxjs/toolkit'

interface AppState {
    hintsModal: boolean;
    route: number;
    url: {
        level: number | undefined;
        crossword: number | undefined;
        question: number | undefined;
    };
}

const initialState: AppState = {
    hintsModal: false,
    route: 0,
    url: {
        level: undefined,
        crossword: undefined,
        question: undefined
    }
}

export const state = createSlice({
    name: 'state',
    initialState,
    reducers: {
        toggleHintModal: (state) => {
            state.hintsModal = !state.hintsModal
        },
        setRoute: (state, action: PayloadAction<number>) => {
            state.route = action.payload
        },
        setLevel: (state, action: PayloadAction<number>) => {
            state.url.level = action.payload
        },
        setCrossword: (state, action: PayloadAction<number>) => {
            state.url.crossword = action.payload
        },
        setQuestion: (state, action: PayloadAction<number>) => {
            state.url.question = action.payload
        },
    },
})

export const {
    toggleHintModal,
    setLevel,
    setCrossword,
    setQuestion,
    setRoute
} = state.actions

export default state.reducer;