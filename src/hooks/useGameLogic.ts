import { PlayPageProps } from "../data/playTypes";
import { FlipConstants } from "../data/playConstants";
import { useBaseGameLogic } from "./useBaseGameLogic";
import { admobService } from "../data/admob/adMobService";
import { hideAll } from "../data/playUtils";
import { usePlayData } from "./usePlayData";

export function useGameLogic({ difficulty = "medium", setShowWatchAdModal, setTypeAd }: PlayPageProps) {
    const baseGame = useBaseGameLogic({ difficulty, isFlashMode: false, setShowWatchAdModal, setTypeAd });
    const { decrementDiamondByKey } = usePlayData();

    const onContinue = (): void => {
        baseGame.setLose(false);
        baseGame.setHearts(1);
        
        // Reset refs to allow game interaction
        baseGame.openedRef.current = -1;
        baseGame.triggerEventRef.current = true;
        baseGame.noClickRef.current = true;
        
        // Hide all cards first
        const cards = [...baseGame.cards];
        hideAll(cards);
        baseGame.setCards(cards);
        decrementDiamondByKey("hearts");
        setTimeout(() => {
            baseGame.setGameStarted(true);
        }, 700);
    };

    const onTryAgain = async (): Promise<void> => {
        await admobService.showInterstitial();
        baseGame.setHearts(FlipConstants.init.hearts);
        baseGame.onTryAgain();
    };

    return {
        // State
        cards: baseGame.cards,
        hearts: baseGame.hearts,
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
        onContinue,
        onShare: baseGame.onShare,
        onTryAgain,
        setToast: baseGame.setToast,
        setInfo: baseGame.setInfo,
        setShowAllConfirm: baseGame.setShowAllConfirm,
    };
}

