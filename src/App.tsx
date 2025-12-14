import { Redirect, Route } from "react-router-dom";
import {
    IonApp,
    IonRouterOutlet,
    setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useEffect } from "react";
import Home from "./pages/Home";
import Play from "./pages/Play.tsx";
import Flash from "./pages/Flash.tsx";
import HowToPlay from "./pages/HowToPlay";

import { store } from "./store";
import { persistStore } from "redux-persist";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";
import { initAudio } from "./data/audio";
import {
    OrientationType,
    ScreenOrientation,
} from "@capawesome/capacitor-screen-orientation";
import GiftDialog from "./components/GiftDialog";
import { admobService } from "./data/admob/adMobService.ts";
import { Capacitor } from "@capacitor/core";
import { BackButtonHandler } from "./components/BackButton/BackButtonHandler.tsx";

// Disable Ionic's default back button handling
setupIonicReact({
    hardwareBackButton: false
});

const persistor = persistStore(store);

const App: React.FC = () => {
    useEffect(() => {
        async () =>
            await ScreenOrientation.lock({ type: OrientationType.PORTRAIT });
    }, []);

    useEffect(() => {
        initAudio();
    }, []);

    useEffect(() => {
        if (Capacitor.getPlatform() === "android") {
            (async () => {
                try {
                    await StatusBar.setOverlaysWebView({ overlay: false });
                    await StatusBar.setStyle({ style: Style.Light });
                } catch (err) {
                    console.warn(
                        "StatusBar plugin not available in web preview",
                        err
                    );
                }
            })();
        }
    }, []);

    useEffect(() => {
        admobService.initialize();
    }, []);

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <IonApp>
                    <GiftDialog />
                    
                    <IonReactRouter>
                        {/* BackButtonHandler now has access to router context */}
                        <BackButtonHandler />
                        
                        <IonRouterOutlet>
                            <Route exact path="/home">
                                <Home />
                            </Route>
                            <Route exact path="/play/:difficulty">
                                <Play />
                            </Route>
                            <Route exact path="/flash/:difficulty">
                                <Flash />
                            </Route>
                            <Route exact path="/how-to-play">
                                <HowToPlay />
                            </Route>
                            <Route exact path="/">
                                <Redirect to="/home" />
                            </Route>
                        </IonRouterOutlet>
                    </IonReactRouter>
                </IonApp>
            </PersistGate>
        </Provider>
    );
};

export default App;