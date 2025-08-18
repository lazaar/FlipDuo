import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useIonRouter } from "@ionic/react";

interface FlashLoseModalProps {
    lose: boolean;
    score: number;
    textShare: string;
    onTryAgain: () => void;
    onShare: () => void;
}

export const FlashLoseModal: React.FC<FlashLoseModalProps> = ({
    lose,
    textShare,
    onTryAgain,
    onShare,
}) => {
    const router = useIonRouter();

    return (
        <AnimatePresence>
            {lose && (
                <motion.div
                    className="lose-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ x: 80, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 80, opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                        }}
                        className="lose-modal-content"
                    >
                        <div className="lose-modal-title">Time's up!</div>
                        <div className="lose-modal-text">
                            <p>Your 60 seconds are over. Great job!</p>
                        </div>
                        <div className="lose-modal-buttons">
                            <button
                                className="lose-modal-button-amber"
                                onClick={() => router.push("/", "back")}
                            >
                                Menu
                            </button>
                            <button
                                className="lose-modal-button-sky"
                                onClick={onTryAgain}
                            >
                                Try Again
                            </button>
                        </div>
                        <div className="lose-modal-share" onClick={onShare}>
                            {textShare}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
