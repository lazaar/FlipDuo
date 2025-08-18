import { IonContent, IonPage, IonIcon } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "motion/react";
import { Share as SharePlugin } from "@capacitor/share";
import { volumeHigh, volumeMute, shareSocial, play, timerOutline, trophy } from "ionicons/icons";

import "./Home.css";
import { getUrl } from "../data/utils";
import { playSound } from "../data/audio";
import { toggleSound } from "../redux/userSettings";
import DifficultyModal from "../components/DifficultyModal";
import BestScoresModal from "../components/BestScoresModal";
import { Difficulty } from "../data/playTypes";

const Home: React.FC = () => {
    const history = useHistory();
    const [isNavigating, setIsNavigating] = useState(false);
    const [showDifficultyModal, setShowDifficultyModal] = useState<"PLAY" | "FLASH" | false>(false);
    const [showBestScoresModal, setShowBestScoresModal] = useState(false);
    const dispatch = useDispatch();
    const isSound = useSelector(
        ({ userSettings }: { userSettings: { sound: boolean } }) =>
            userSettings.sound
    );

    const handlePlayClick = () => {
        playSound("click");
        setShowDifficultyModal("PLAY");
    };

    const handleFlashClick = () => {
        playSound("click");
        setShowDifficultyModal("FLASH");
    };

    const handleBestScoresClick = () => {
        playSound("click");
        setShowBestScoresModal(true);
    };

    const handleDifficultySelect = (difficulty: Difficulty) => {
        playSound("click");
        setShowDifficultyModal(false);
        setIsNavigating(true);
        if (showDifficultyModal) {
            setTimeout(() => {
                history.push(`/${showDifficultyModal.toLowerCase()}/${difficulty}`);
            setTimeout(() => {
                    setIsNavigating(false);
                }, 1000);
            }, 100);
        }
    };

    const onSoundClick = () => {
        playSound("click");
        dispatch(toggleSound());
    };

    const onShareApp = () => {
        playSound("click");
        SharePlugin.share({
            title: "The best Reflexion/Memory Game",
            text: "Come join me to play this amazing game",
            url: getUrl(),
            dialogTitle: "Flip Duo",
        });
    };

    return (
        <IonPage>
            <IonContent className="home-content">
                <div className="home-container">
                    {/* Top center icon buttons */}
                    <div
                        className={`top-icon-buttons ${
                            isNavigating ? "hidden" : ""
                        }`}
                    >
                        <button
                            className="custom-button icon-button"
                            onClick={onSoundClick}
                            title={isSound ? "Mute Sound" : "Unmute Sound"}
                        >
                            <IonIcon
                                icon={isSound ? volumeHigh : volumeMute}
                                className="icon-button-icon"
                            />
                        </button>
                        <button
                            className="custom-button icon-button secondary-button"
                            onClick={onShareApp}
                            title="Share App"
                        >
                            <IonIcon
                                icon={shareSocial}
                                className="icon-button-icon"
                            />
                        </button>
                        <button
                            className="custom-button icon-button warning-button"
                            onClick={handleBestScoresClick}
                            title="View Best Scores"
                        >
                            <IonIcon
                                icon={trophy}
                                className="icon-button-icon"
                            />
                        </button>
                    </div>

                    <div
                        className={`logo-section ${
                            isNavigating ? "hidden" : ""
                        }`}
                    >
                        <motion.img
                            src="/logo.png"
                            alt="Flip Duo Logo"
                            className="app-logo"
                            initial={{
                                opacity: 0,
                                scale: 0.6,
                                y: -30,
                                rotate: -10,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                                rotate: 0,
                            }}
                            transition={{
                                duration: 0.6,
                                ease: "easeOut",
                            }}
                            whileHover={{
                                scale: 1.15,
                                rotate: [0, -8, 8, 0],
                                transition: { duration: 0.4 },
                            }}
                            whileTap={{
                                scale: 0.9,
                            }}
                        />
                    </div>

                    <div
                        className={`menu-buttons ${
                            isNavigating ? "hidden" : ""
                        }`}
                    >
                        <button
                            className="custom-button"
                            onClick={handlePlayClick}
                        >
                           <IonIcon icon={play} size="large" /> Simple Mode
                        </button>
                        <button
                            className="custom-button secondary-button"
                            onClick={handleFlashClick}
                        >
                            <IonIcon icon={timerOutline} size="large" />
                            Flash Mode
                        </button>
                    </div>
                </div>
            </IonContent>

            <DifficultyModal
                isOpen={showDifficultyModal !== false}
                onClose={() => {
                    setShowDifficultyModal(false);
                    playSound("click");
                }}
                onSelectDifficulty={handleDifficultySelect}
            />

            <BestScoresModal
                isOpen={showBestScoresModal}
                onClose={() => {
                    setShowBestScoresModal(false);
                    playSound("click");
                }}
            />
        </IonPage>
    );
};

export default Home;

