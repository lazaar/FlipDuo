import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact, useIonRouter } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import { App as CapacitorApp } from "@capacitor/app";
import { StatusBar, Style } from '@capacitor/status-bar';
import { useEffect } from "react";
import Home from "./pages/Home";
import Play from "./pages/Play.tsx";
import Flash from "./pages/Flash.tsx";

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

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";
import { initAudio } from "./data/audio";
import GiftDialog from "./components/GiftDialog";

setupIonicReact();
const persistor = persistStore(store);

const App: React.FC = () => {

    const router = useIonRouter();

    useEffect(() => {
        initAudio();
    }, []);

    useEffect(() => {
    const backHandler = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        router.goBack();
      } else {
        // Already at first page → exit app
        CapacitorApp.exitApp();
      }
    });

    return () => {
      void backHandler.then(handler => handler.remove());
    };
  }, [router]);

     (async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: Style.Light }); // or Style.Dark
      } catch (err) {
        console.warn('StatusBar plugin not available in web preview', err);
      }
    })();

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <IonApp>
                    <GiftDialog />

                    <IonReactRouter>
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


