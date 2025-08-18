import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useIonRouter } from "@ionic/react";

interface LoseModalProps {
    lose: boolean;
    heartsDiamonds: number;
    score: number;
    textShare: string;
    onTryAgain: () => void;
    onContinue: () => void;
    onShare: () => void;
}

interface ConfirmModalProps {
    showAllConfirm: boolean;
    onShowAll: (isSure: boolean) => void;
    onCancel: () => void;
}

export const LoseModal: React.FC<LoseModalProps> = ({
    lose,
    heartsDiamonds,
    textShare,
    onTryAgain,
    onContinue,
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
                        <div className="lose-modal-title">You lose!</div>
                        <div className="lose-modal-text">
                            {heartsDiamonds === 0 ? (
                                <p>Sorry, you don't have more hearts :(</p>
                            ) : heartsDiamonds === 1 ? (
                                <p>Do you want to use your last heart?</p>
                            ) : (
                                <p>Do you want to use one of your hearts?</p>
                            )}
                        </div>
                        {heartsDiamonds > 0 && (
                            <div className="mb-3">
                                <button
                                    className="lose-modal-button-emerald"
                                    onClick={onContinue}
                                >
                                    Continue
                                </button>
                            </div>
                        )}
                        <div className="lose-modal-buttons">
                            <button
                                className="lose-modal-button-amber"
                                onClick={() => router.push("/", "back")}
                            >
                                Back
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

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    showAllConfirm,
    onShowAll,
    onCancel,
}) => {
    return (
        <AnimatePresence>
            {showAllConfirm && (
                <motion.div
                    className="confirm-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="confirm-modal-content"
                    >
                        <div className="confirm-modal-title">Show All Cards!</div>
                        <div className="confirm-modal-text">
                            Are you sure you want to show all cards for 2 seconds?
                        </div>
                        <div className="confirm-modal-buttons">
                            <button
                                className="confirm-modal-button-rose"
                                onClick={onCancel}
                            >
                                No
                            </button>
                            <button
                                className="confirm-modal-button-sky"
                                onClick={() => onShowAll(true)}
                            >
                                Yes
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
