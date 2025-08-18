import { PlayPageProps } from "../data/playTypes";
import { FlipConstants } from "../data/playConstants";
import { useBaseGameLogic } from "./useBaseGameLogic";

export function useGameLogic({ difficulty = "medium" }: PlayPageProps) {
    const baseGame = useBaseGameLogic({ difficulty, isFlashMode: false });


    const onContinue = (): void => {
        baseGame.setLose(false);
        baseGame.setHearts(1);
        setTimeout(() => {
            baseGame.setGameStarted(true);
        }, 700);
    };

    const onTryAgain = (): void => {
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

