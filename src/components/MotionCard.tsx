import React from "react";
import { motion } from "motion/react";
import { Card, Difficulty } from "../data/playTypes";
import { getNumberClass } from "../data/playUtils.ts";

interface CardFaceProps {
    value: number | "X" | "J";
    difficulty: Difficulty;
}

interface MotionCardProps {
    card: Card;
    onClick: () => void;
    difficulty: Difficulty;
}
// ---------------------- UI Building Blocks ----------------------
const CardFace: React.FC<CardFaceProps> = ({ value, difficulty }) => {
    // Get CSS class based on value
    const numberClass = getNumberClass(value);
    const isBigNumber = typeof value === "number" && value > 10000;
    return (
        <div
            className={`card-face ${"card-face-" + difficulty} ${numberClass} ${
                isBigNumber ? "big-number" : ""
            }`}
        >
            {value}
        </div>
    );
};

const MotionCard: React.FC<MotionCardProps> = ({
    card,
    onClick,
    difficulty,
}) => {
    const isFaceUp = card.state !== "hide";
    const isLoading = card.state === "load";
    const isMoving = card.state === "moving";
    // const numeric = typeof card.value === "number" ? card.value : 0;

    return (
        <motion.div
            className={`motion-card ${isMoving ? "motion-card-moving" : ""}`}
            onClick={isLoading || isMoving ? undefined : onClick}
            initial={{ rotateY: 0 }}
            animate={{
                rotateY: isFaceUp ? 0 : 180,
                scale: isMoving ? 0 : 1,
                opacity: isMoving ? 0 : 1,
            }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                scale: {
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                },
            }}
        >
            {/* Front */}
            <div className="card-front">
                <CardFace value={card.value} difficulty={difficulty} />
                {card.timeBonus && (
                    <div className="time-bonus-badge">+{card.timeBonus}s</div>
                )}
            </div>
            {/* Back */}
            <div className="card-back">
                {card.timeBonus && (
                    <div className="time-bonus-badge">+{card.timeBonus}s</div>
                )}
            </div>
        </motion.div>
    );
};

export default MotionCard;

