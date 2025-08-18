import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { trophy, timerOutline, play } from "ionicons/icons";
import { IonIcon } from "@ionic/react";
import { useSelector } from "react-redux";
import "./BestScoresModal.css";

interface BestScoresModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const BestScoresModal: React.FC<BestScoresModalProps> = ({ isOpen, onClose }) => {
    const { bestScoreSimple, bestScoreFlash } = useSelector(
        ({ play }: { play: { bestScoreSimple: number; bestScoreFlash: number } }) => ({
            bestScoreSimple: play.bestScoreSimple,
            bestScoreFlash: play.bestScoreFlash,
        })
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="best-scores-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="best-scores-modal-content"
                    >
                        <div className="best-scores-modal-title">Best Scores</div>
                        
                        <div className="scores-container">
                            <div className="score-card simple-score">
                                <div className="score-header">
                                    <IonIcon icon={play} className="score-icon" />
                                    <span className="score-mode">Simple Mode</span>
                                </div>
                                <div className="score-value">
                                    <IonIcon icon={trophy} className="trophy-icon" />
                                    {bestScoreSimple}
                                </div>
                            </div>

                            <div className="score-card flash-score">
                                <div className="score-header">
                                    <IonIcon icon={timerOutline} className="score-icon" />
                                    <span className="score-mode">Flash Mode</span>
                                </div>
                                <div className="score-value">
                                    <IonIcon icon={trophy} className="trophy-icon" />
                                    {bestScoreFlash}
                                </div>
                            </div>
                        </div>

                        <div className="best-scores-modal-buttons">
                            <button
                                className="best-scores-modal-button"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BestScoresModal;
