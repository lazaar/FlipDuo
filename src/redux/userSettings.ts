import {
    createSlice
} from '@reduxjs/toolkit'

interface UserSettingsState {
    sound: boolean;
}

const initialState: UserSettingsState = {
    sound: true
}

export const userSettings = createSlice({
    name: 'userSettings',
    initialState,
    reducers: {
        toggleSound: (state) => {
            state.sound = !state.sound
        },
    },
})

export const {
    toggleSound
} = userSettings.actions

export default userSettings.reducer;