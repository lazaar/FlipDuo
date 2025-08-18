import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userSettings from "./redux/userSettings.ts";
import game from "./redux/game.ts";
import state from "./redux/state.ts";
import play from "./redux/play.ts";

declare global {
    interface ImportMeta {
        readonly env: {
            readonly PROD: boolean;
            readonly DEV: boolean;
            readonly MODE: string;
        };
    }
}


const persistConfig = {
    key: "root",
    storage,
    blacklist: ["state"],
};

const rootReducer = combineReducers({
    userSettings,
    game,
    state,
    play,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    devTools: !import.meta.env.PROD,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
