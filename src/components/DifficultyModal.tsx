import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Difficulty } from "../data/playTypes";
import "./DifficultyModal.css";

interface DifficultyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectDifficulty: (difficulty: Difficulty) => void;
}

const DifficultyModal: React.FC<DifficultyModalProps> = ({
    isOpen,
    onClose,
    onSelectDifficulty,
}) => {
    const difficulties = [
        {
            level: "easy" as Difficulty,
            name: "Easy",
            description: "3x3",
            color: "#3594ef",
        },
        {
            level: "medium" as Difficulty,
            name: "Medium",
            description: "4x4",
            color: "#9e21cc",
        },
        {
            level: "hard" as Difficulty,
            name: "Hard",
            description: "5x5",
            color: "#d031a7",
        },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="difficulty-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="difficulty-modal-content"
                    >
                        <div className="difficulty-modal-text">
                            Choose your challenge level
                        </div>
                        
                        <div className="difficulty-options">
                            {difficulties.map((difficulty) => (
                                <motion.button
                                    key={difficulty.level}
                                    className="difficulty-option"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onSelectDifficulty(difficulty.level)}
                                    style={{ borderColor: difficulty.color }}
                                >
                                    <div className="difficulty-header">
                                        <h3 
                                            className="difficulty-name"
                                            style={{ color: difficulty.color }}
                                        >
                                            {difficulty.name}
                                        </h3>
                                        <p className="difficulty-description">
                                            {difficulty.description}
                                        </p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                        
                        <div className="difficulty-modal-buttons">
                            <button
                                className="difficulty-modal-button-cancel"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DifficultyModal;
