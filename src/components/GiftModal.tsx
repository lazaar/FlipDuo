import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSelector, useDispatch } from "react-redux";
import { incrementDiamond } from "../redux/play";
import { playSound } from "../data/audio";

interface GiftModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface RootState {
    play: {
        diamonds: {
            showAll: number;
            showOne: number;
            hearts: number;
        };
    };
}

// Utility function to get random gift (can be used for testing)
export const getRandomGift = () => {
    const random = Math.random();
    if (random < 0.5) {
        return { type: "showOne", amount: 1, label: "Show One Diamond", icon: "💎" };
    } else if (random < 0.75) {
        return { type: "hearts", amount: 1, label: "Heart", icon: "❤️" };
    } else {
        return { type: "showAll", amount: 1, label: "Show All Diamond", icon: "✨" };
    }
};

export const GiftModal: React.FC<GiftModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const diamonds = useSelector((state: RootState) => state.play.diamonds);
    const [dailyGift, setDailyGift] = useState<ReturnType<typeof getRandomGift> | null>(null);

    // Generate the gift when modal opens
    useEffect(() => {
        if (isOpen && !dailyGift) {
            setDailyGift(getRandomGift());
        }
    }, [isOpen, dailyGift]);

    const handleClaimGift = () => {
        if (dailyGift) {
            dispatch(incrementDiamond({ key: dailyGift.type as keyof typeof diamonds, amount: dailyGift.amount }));
            playSound("unlocked");
            setDailyGift(null); // Reset for next day
            onClose();
        }
    };

    const handleClose = () => {
        setDailyGift(null); // Reset for next day
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && dailyGift && (
                <motion.div
                    className="gift-modal-overlay"
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
                        className="gift-modal-content"
                    >
                        <div className="gift-modal-title">🎁 Daily Gift!</div>
                        <div className="gift-modal-text">
                            You found a gift! Claim it now.
                        </div>
                        <div className="gift-modal-reward">
                            <div className="gift-reward-icon-large">
                                {dailyGift.icon}
                            </div>
                            <div className="gift-reward-label">
                                {dailyGift.label}
                            </div>
                        </div>
                        <div className="gift-modal-buttons">
                            <button
                                className="gift-modal-button-rose"
                                onClick={handleClose}
                            >
                                Cancel
                            </button>
                            <button
                                className="gift-modal-button-emerald"
                                onClick={handleClaimGift}
                            >
                                Claim Gift
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
