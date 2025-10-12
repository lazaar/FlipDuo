import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PlayPageProps } from "../data/playTypes";
import { useBaseGameLogic } from "./useBaseGameLogic";
import { RootState } from "../store";
import { admobService } from "../data/admob/adMobService";

export function useFlashGameLogic({
    difficulty = "medium",
    setShowWatchAdModal,
    setTypeAd,
}: PlayPageProps) {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const dispatch = useDispatch();
    const { bestScoreFlash } = useSelector((state: RootState) => state.play);

    const baseGame = useBaseGameLogic({
        difficulty,
        isFlashMode: true,
        setShowWatchAdModal,
        setTypeAd,
    });

    // Timer effect using setInterval for more reliable timing
    useEffect(() => {
        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Only start timer if game is active and not lost
        if (baseGame.gameStarted && baseGame.timeLeft > 0 && !baseGame.lose) {
            intervalRef.current = setInterval(() => {
                baseGame.setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // Game over when timer reaches 0
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                        }
                        baseGame.setLose(true);
                        baseGame.setGameStarted(false);
                        if (baseGame.score > bestScoreFlash) {
                            // Mettre à jour le best score flash dans Redux
                            baseGame.setTextShare("Share your new high score");
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [baseGame.gameStarted, baseGame.lose, dispatch, bestScoreFlash]);

    const onTryAgain = async (): Promise<void> => {
        // Clear any existing interval first
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        baseGame.setTimeLeft(60); // Reset timer to 60 seconds
        await admobService.showInterstitial();

        baseGame.onTryAgain();
    };

    const onShare = (): void => {
        const msg = `${baseGame.score} – my score in 2xFlip Flash Mode!`;
        if (navigator.share) {
            navigator
                .share({
                    title: "2xFlip",
                    text: msg,
                    url: window.location.href,
                })
                .catch(() => {
                    baseGame.setToast({ open: true, msg: "Share canceled" });
                });
        } else {
            navigator.clipboard.writeText(msg).then(() =>
                baseGame.setToast({
                    open: true,
                    msg: "Copied to clipboard",
                })
            );
        }
    };

    return {
        // State
        cards: baseGame.cards,
        timeLeft: baseGame.timeLeft, // Instead of hearts, we have timeLeft
        score: baseGame.score,
        highScoreMessage: baseGame.highScoreMessage,
        lose: baseGame.lose,
        showAllConfirm: baseGame.showAllConfirm,
        showAllDiamonds: baseGame.showAllDiamonds,
        showOneDiamonds: baseGame.showOneDiamonds,
        heartsDiamonds: baseGame.heartsDiamonds,
        showOne: baseGame.showOne,
        info: baseGame.info,
        textShare: baseGame.textShare,
        toast: baseGame.toast,
        gridSize: baseGame.gridSize,
        gameStarted: baseGame.gameStarted,
        // Actions
        handleCardClick: baseGame.handleCardClick,
        onShowAll: baseGame.onShowAll,
        onToggleShowOne: baseGame.onToggleShowOne,
        onShare,
        onTryAgain,
        setToast: baseGame.setToast,
        setInfo: baseGame.setInfo,
        setShowAllConfirm: baseGame.setShowAllConfirm,
    };
}
