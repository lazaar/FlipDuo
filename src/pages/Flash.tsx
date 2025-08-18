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
import { arrowBack } from "ionicons/icons";
import { useParams } from "react-router-dom";
import FooterToolbar from "../components/FooterToolbar";
import MotionCard from "../components/MotionCard";
import { FlashLoseModal } from "../components/FlashLoseModal";
import { ConfirmModal } from "../components/GameModals";
import { useFlashGameLogic } from "../hooks/useFlashGameLogic";
import { PlayPageProps, Difficulty } from "../data/playTypes";
import "./Play.css";

// ---------------------- Main Component ----------------------
export default function PlayPage(props: PlayPageProps) {
    const router = useIonRouter();
    const { difficulty } = useParams<{ difficulty: Difficulty }>();
    
    // Combine props with URL params
    const playProps: PlayPageProps = {
        ...props,
        difficulty: difficulty || props.difficulty,
    };

    const {
        cards,
        timeLeft,
        score,
        highScoreMessage,
        lose,
        showAllConfirm,
        showAllDiamonds,
        showOneDiamonds,
        gameStarted,
        info,
        textShare,
        toast,
        gridSize,
        handleCardClick,
        onShowAll,
        onToggleShowOne,
        onShare,
        onTryAgain,
        setToast,
        setInfo,
        setShowAllConfirm,
    } = useFlashGameLogic(playProps);

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
                            <span className="header-title-text">
                                score
                            </span>
                            <span className="header-title-score">{score}</span>
                        </div>
                    </IonTitle>
                    <IonButtons slot="end">
                        <IonChip color="light" className="header-timer">
                            <IonText className="header-timer-text" color="warning">
                                {timeLeft}s
                            </IonText>
                        </IonChip>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="content-container">
                {/* High Score Message */}
                {highScoreMessage && (
                    <div className="high-score-message">
                        {highScoreMessage}
                    </div>
                )}
                <div className={`card-grid card-grid-${gridSize}`}>
                    {/* CARD GRID */}
                    {cards.map((card, idx) => (
                        <div key={idx} className="card-grid-item">
                            {card ? (
                                <MotionCard
                                    card={card}
                                    onClick={() => gameStarted && handleCardClick(idx)}
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

                {/* Flash Lose Modal */}
                <FlashLoseModal
                    lose={lose}
                    score={score}
                    textShare={textShare}
                    onTryAgain={onTryAgain}
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

