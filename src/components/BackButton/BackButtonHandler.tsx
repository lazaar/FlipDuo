import { useEffect, useState } from "react";
import { useIonRouter } from "@ionic/react";
import { App as CapacitorApp } from "@capacitor/app";
import { ExitConfirmModal } from "../ExitConfirmModal";

export const BackButtonHandler: React.FC = () => {
    const router = useIonRouter();
    const [showExitModal, setShowExitModal] = useState(false);
    const [canGoBack, setCanGoBack] = useState(false);

    useEffect(() => {
        const backHandler = CapacitorApp.addListener(
            "backButton",
            ({ canGoBack: canGoBackValue }) => {
                setCanGoBack(canGoBackValue);
                setShowExitModal(true);
            }
        );

        return () => {
            void backHandler.then((handler) => handler.remove());
        };
    }, []);

    const handleExitConfirm = () => {
        setShowExitModal(false);
        if (canGoBack) {
            router.goBack();
        } else {
            CapacitorApp.exitApp();
        }
    };

    const handleExitCancel = () => {
        setShowExitModal(false);
    };

    return (
        <ExitConfirmModal
            isOpen={showExitModal}
            canGoBack={canGoBack}
            onConfirm={handleExitConfirm}
            onCancel={handleExitCancel}
        />
    );
};