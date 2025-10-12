import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonContent,
    IonText,
    IonChip,
    useIonRouter,
    IonIcon,
    IonToast,
} from "@ionic/react";
import { motion, AnimatePresence } from "motion/react";
import { arrowBack, heart } from "ionicons/icons";
import { useParams } from "react-router-dom";
import FooterToolbar from "../components/FooterToolbar";
import MotionCard from "../components/MotionCard";
import {
    LoseModal,
    ConfirmModal,
    WatchAdModal,
} from "../components/GameModals";
import { useGameLogic } from "../hooks/useGameLogic";
import { PlayPageProps, Difficulty } from "../data/playTypes";
import "./Play.css";
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { admobService } from "../data/admob/adMobService";
import { usePlayData } from "../hooks/usePlayData";

// ---------------------- Main Component ----------------------
export default function PlayPage(props: PlayPageProps) {
    const router = useIonRouter();
    const [showWatchAdModal, setShowWatchAdModal] = useState(false);
    const [typeAd, setTypeAd] = useState<"showOne" | "showAll">("showOne");
    const { difficulty } = useParams<{ difficulty: Difficulty }>();

    // Combine props with URL params
    const playProps: PlayPageProps = {
        ...props,
        setShowWatchAdModal: setShowWatchAdModal,
        setTypeAd: setTypeAd,
        difficulty: difficulty || props.difficulty,
    };

    const { incrementDiamondByKey } = usePlayData();

    const {
        cards,
        hearts,
        score,
        highScoreMessage,
        lose,
        showAllConfirm,
        showAllDiamonds,
        showOneDiamonds,
        heartsDiamonds,
        gameStarted,
        info,
        textShare,
        toast,
        gridSize,
        handleCardClick,
        onShowAll,
        onToggleShowOne,
        onContinue,
        onShare,
        onTryAgain,
        setToast,
        setInfo,
        setShowAllConfirm,
    } = useGameLogic(playProps);

    useEffect(() => {
        if (Capacitor.getPlatform() === "web") return;

        admobService.showBanner();

        return () => {
            admobService.hideBanner();
        };
    }, []);

    useEffect(() => {
        admobService.prepareInterstitial();
        admobService.prepareRewarded();
    }, []);

    return (
        <IonPage className="play-page">
            <IonHeader translucent>
                <IonToolbar className="px-2">
                    <IonButtons slot="start">
                        <IonButton onClick={() => router.goBack()}>
                            <IonIcon icon={arrowBack} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle className="text-center">
                        <div className="header-title">
                            <span className="header-title-text">score</span>
                            <span className="header-title-score">{score}</span>
                        </div>
                    </IonTitle>
                    <IonButtons slot="end">
                        <IonChip color="light" className="header-hearts">
                            <IonIcon
                                icon={heart}
                                className="mr-1"
                                color="danger"
                            />
                            <IonText
                                className="header-hearts-text"
                                color="danger"
                            >
                                {hearts}
                            </IonText>
                        </IonChip>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="content-container">
                {/* High Score Message */}
                {highScoreMessage && (
                    <div className="high-score-message">{highScoreMessage}</div>
                )}
                <div className={`card-grid card-grid-${gridSize}`}>
                    {/* CARD GRID */}
                    {cards.map((card, idx) => (
                        <div key={idx} className="card-grid-item">
                            {card ? (
                                <MotionCard
                                    card={card}
                                    onClick={() =>
                                        gameStarted && handleCardClick(idx)
                                    }
                                    difficulty={difficulty}
                                />
                            ) : (
                                <div className="empty-card" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Info Window */}
                <AnimatePresence>
                    {info.show && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="info-window"
                        >
                            {info.content}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Lose Modal */}
                <LoseModal
                    lose={lose}
                    heartsDiamonds={heartsDiamonds}
                    score={score}
                    textShare={textShare}
                    onTryAgain={onTryAgain}
                    onContinue={onContinue}
                    onShare={onShare}
                />

                {/* Show All Confirm Modal */}
                <ConfirmModal
                    showAllConfirm={showAllConfirm}
                    onShowAll={onShowAll}
                    onCancel={() => {
                        setShowAllConfirm(false);
                        setInfo({ show: false });
                    }}
                />
                <WatchAdModal
                    isOpen={showWatchAdModal}
                    onCancel={() => setShowWatchAdModal(false)}
                    onWatch={async () => {
                        await admobService.showRewarded();
                        incrementDiamondByKey(typeAd, 1);
                        setShowWatchAdModal(false);
                    }}
                />
            </IonContent>

            <FooterToolbar
                onToggleShowOne={onToggleShowOne}
                onShowAll={onShowAll}
                showOneDiamonds={showOneDiamonds}
                showAllDiamonds={showAllDiamonds}
            />

            <IonToast
                isOpen={toast.open}
                message={toast.msg}
                onDidDismiss={() => setToast({ open: false, msg: "" })}
                duration={1500}
            />
        </IonPage>
    );
}
