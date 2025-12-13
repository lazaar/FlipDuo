import React from "react";
import { motion, AnimatePresence } from "motion/react";

interface ExitConfirmModalProps {
    isOpen: boolean;
    canGoBack: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
    isOpen,
    canGoBack,
    onConfirm,
    onCancel,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
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
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                        }}
                        className="confirm-modal-content"
                    >
                        <div className="confirm-modal-title">
                            {canGoBack ? "Go Back?" : "Exit App?"}
                        </div>
                        <div className="confirm-modal-text">
                            {canGoBack
                                ? "Are you sure you want to go back?"
                                : "Are you sure you want to exit the application?"}
                        </div>
                        <div className="confirm-modal-buttons">
                            <button
                                className="confirm-modal-button-rose"
                                onClick={onCancel}
                            >
                                Cancel
                            </button>
                            <button
                                className="confirm-modal-button-sky"
                                onClick={onConfirm}
                            >
                                {canGoBack ? "Go Back" : "Exit"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

