import { useEffect, useRef, useState } from "react";
import { Card, PlayPageProps } from "../data/playTypes";
import { FlipConstants } from "../data/playConstants";
import {
    makeDeck,
    hideAll,
    showAll,
    showOneFunction,
    hideOne,
    shuffleExceptIndex,
    compareTwoCards,
} from "../data/playUtils";
import { usePlayData } from "./usePlayData";
import { playSound } from "../data/audio";
import { admobService } from "../data/admob/adMobService";

function generateNewCard(max: number): number | "X" | "J" {
    const random = Math.random();

    // 15% de chance pour X
    if (random < 0.15) {
        return "X";
    }

    // 15% de chance pour J
    if (random < 0.3) {
        return "J";
    }

    // 40% de chance pour max/2
    if (random < 0.7) {
        return Math.max(2, Math.floor(max / 2));
    }

    // 30% de chance pour max/4 (si max >= 8)
    if (max >= 8) {
        return Math.max(2, Math.floor(max / 4));
    }

    // Si max < 8, on utilise max/2 à la place
    return Math.max(2, Math.floor(max / 2));
}

// Fonction pour générer une carte avec bonus de temps pour le flash mode
function generateNewCardWithTimeBonus(
    max: number,
    isFlashMode: boolean = false
): { value: number | "X" | "J"; timeBonus?: number } {
    const value = generateNewCard(max);

    // Dans le flash mode, 45% des cartes ont un bonus de temps
    if (isFlashMode && Math.random() < 0.45 && value !== "X" && value !== "J") {
        const timeBonusOptions = [2, 5, 10];
        const timeBonus =
            timeBonusOptions[
                Math.floor(Math.random() * timeBonusOptions.length)
            ];
        return { value, timeBonus };
    }

    return { value, timeBonus: undefined };
}

// Fonction pour vérifier s'il y a une solution possible
function hasSolution(cards: Card[]): boolean {
    const values = cards.map((card) => card.value);

    // Vérifier s'il y a au moins un J ou X
    const hasWildcard = values.some((value) => value === "J" || value === "X");
    if (hasWildcard) return true;

    // Vérifier s'il y a au moins deux cartes avec la même valeur
    const numericValues = values.filter(
        (value) => typeof value === "number"
    ) as number[];
    const valueCounts = new Map<number, number>();

    for (const value of numericValues) {
        valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
        if (valueCounts.get(value)! >= 2) {
            return true;
        }
    }

    return false;
}

// Fonction pour générer une carte qui garantit une solution
function generateNewCardWithSolution(
    max: number,
    currentCards: Card[],
    index1: number,
    isFlashMode: boolean = false
): { value: number | "X" | "J"; timeBonus?: number } {
    // Essayer de générer une carte normale d'abord
    let cardData = generateNewCardWithTimeBonus(max, isFlashMode);

    // Créer un tableau temporaire avec la nouvelle carte pour tester
    const testCards = [...currentCards];
    testCards[index1] = { ...testCards[index1], value: cardData.value };

    // Si pas de solution, forcer une carte qui en garantit une
    if (!hasSolution(testCards)) {
        const values = currentCards.map((card) => card.value);
        const numericValues = values.filter(
            (value) => typeof value === "number"
        ) as number[];
        // Prendre une valeur existante pour créer une paire
        const randomIndex = Math.floor(Math.random() * numericValues.length);
        cardData = {
            value: numericValues[randomIndex],
            timeBonus:
                isFlashMode && Math.random() < 0.4
                    ? [2, 5, 10][Math.floor(Math.random() * 3)]
                    : undefined,
        };
    }

    return cardData;
}

export interface BaseGameState {
    cards: Card[];
    score: number;
    highScoreMessage: string;
    lose: boolean;
    showAllConfirm: boolean;
    showOne: any;
    info: { show: boolean; content?: string };
    textShare: string;
    toast: { open: boolean; msg: string };
    gridSize: number;
    gameStarted: boolean;
}

export interface BaseGameActions {
    handleCardClick: (index: number) => void;
    onShowAll: (isSure: boolean) => void;
    onToggleShowOne: () => void;
    onShare: () => void;
    onTryAgain: () => void;
    setToast: (toast: { open: boolean; msg: string }) => void;
    setInfo: (info: { show: boolean; content?: string }) => void;
    setShowAllConfirm: (show: boolean) => void;
}

export function useBaseGameLogic({
    difficulty = "medium",
    isFlashMode = false,
    setShowWatchAdModal,
    setTypeAd
}: PlayPageProps & { isFlashMode?: boolean }) {
    const gridSize = difficulty ? FlipConstants.difficulty[difficulty] : 4;
    const {
        diamonds,
        decrementDiamondByKey,
        bestScoreFlash,
        bestScoreSimple,
        setBestScoreSimpleData,
        setBestScoreFlashData,
    } = usePlayData();
    const [timeLeft, setTimeLeft] = useState<number>(60); // 60 seconds timer
    const [hearts, setHearts] = useState<number>(FlipConstants.init.hearts);

    const [cards, setCards] = useState<Card[]>([]);
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [highScoreMessage, setHighScoreMessage] = useState<string>("");
    const [lose, setLose] = useState<boolean>(false);
    const [showAllConfirm, setShowAllConfirm] = useState<boolean>(false);
    const [showOne, setShowOne] = useState<any>(null);
    const [info, setInfo] = useState<{ show: boolean; content?: string }>({
        show: false,
    });
    const [textShare, setTextShare] = useState<string>("Share your score");
    const [toast, setToast] = useState<{ open: boolean; msg: string }>({
        open: false,
        msg: "",
    });

    const openedRef = useRef<number>(-1);
    const triggerEventRef = useRef<boolean>(true);
    const noClickRef = useRef<boolean>(true);
    const maxRef = useRef<number>(1);

    // Build initial deck with staggered reveal then hide
    useEffect(() => {
        const deck = makeDeck(gridSize);
        setCards([...deck]);

        // stagger reveal is visually simulated by initial "show" + final hide
        const t = setTimeout(() => {
            setCards((prev) => {
                const next = prev.map((c) => ({ ...c }));
                hideAll(next);
                return next;
            });
            setGameStarted(true);
        }, FlipConstants.delay.firstHideAll + gridSize * gridSize * FlipConstants.delay.firstShowDelay);

        return () => clearTimeout(t);
    }, [gridSize]);

    // Game Logic Functions
    const handleCardClick = (index: number): void => {
        playSound("click");
        if (triggerEventRef.current && noClickRef.current) {
            const cardsNow = [...cards];
            const clicked = cardsNow[index];

            if (clicked.value === "X") {
                wildcardFlow(index, cardsNow);
                return;
            }

            if (showOne) {
                showOneCard(index, cardsNow);
                return;
            }
            showOneFunction(cardsNow, index);

            if (openedRef.current === -1) {
                openedRef.current = index;
                setCards(cardsNow);
                return;
            }

            if (openedRef.current !== index) {
                triggerEventRef.current = false;
                secondCardClicked(openedRef.current, index, cardsNow);
                return;
            }
        } else if (noClickRef.current) {
            // // Reset then re-click
            // setCards((prev) => {
            //     const next = prev.map((c) => ({ ...c }));
            //     hideAll(next);
            //     return next;
            // });
            // triggerEventRef.current = true;
            // openedRef.current = -1;
            // setTimeout(() => handleCardClick(index), 0);
        }
    };

    function showOneCard(index: number, cardsNow: Card[]): void {
        showOneFunction(cardsNow, index);
        setShowOne(false);
        noClickRef.current = false;
        setShowAllConfirm(false);
        setInfo({ show: false });
        decrementDiamondByKey("showOne");

        setCards(cardsNow);
        // Hide it back after showAllDiamonds delay (re-using same duration)
        setTimeout(() => {
            hideOne(cardsNow, index);
            noClickRef.current = true;
            setCards([...cardsNow]);
        }, FlipConstants.delay.showAllDiamonds);
    }

    function wildcardFlow(index: number, cardsNow: Card[]): void {
        noClickRef.current = false;
        triggerEventRef.current = false;

        let delay =
            FlipConstants.delay.removeCardOnsuccess +
            FlipConstants.delay.showAllShuffle;

        showAll(cardsNow);
        setCards([...cardsNow]);

        let newIndex = index;
        setTimeout(() => {
            newIndex = shuffleExceptIndex(cardsNow, index);
            setCards([...cardsNow]);
        }, delay);

        delay += FlipConstants.delay.removeCardOnsuccess;
        setTimeout(() => {
            // Mimic remove one (temporary load state)
            cardsNow[newIndex].state = "moving";
            setCards([...cardsNow]);
        }, delay);

        delay += FlipConstants.delay.generateCardOnsuccess;
        setTimeout(() => {
            const cardData = generateNewCardWithSolution(
                maxRef.current,
                cardsNow,
                newIndex,
                isFlashMode
            );
            cardsNow[newIndex] = {
                value: cardData.value,
                state: "show",
                timeBonus: cardData.timeBonus,
            };
            setCards([...cardsNow]);
        }, delay);

        delay += FlipConstants.delay.hideAllShuffle;
        setTimeout(() => {
            hideAll(cardsNow);
            noClickRef.current = true;
            triggerEventRef.current = true;
            openedRef.current = -1;
            setCards([...cardsNow]);
        }, delay + 500);
    }

    function secondCardClicked(
        index1: number,
        index2: number,
        cardsNow: Card[]
    ): void {
        const newValue = compareTwoCards(
            cardsNow[index1],
            cardsNow[index2],
            maxRef.current
        );
        if (newValue !== -1) {
            cardsNow[index1].state = "load";
            if (
                isFlashMode &&
                (cardsNow[index1].timeBonus || cardsNow[index2].timeBonus)
            ) {
                setTimeLeft(
                    (prev) =>
                        prev +
                        (cardsNow[index1].timeBonus || 0) +
                        (cardsNow[index2].timeBonus || 0)
                );
            }
            // Success path
            playSound("correct");
            setScore((s) => {
                const next = s + newValue;
                const bestScore = isFlashMode
                    ? bestScoreFlash
                    : bestScoreSimple;
                if (next > bestScore) {
                    if (isFlashMode) {
                        setBestScoreFlashData(next);
                    } else {
                        setBestScoreSimpleData(next);
                    }
                    setHighScoreMessage("A new High score!");
                    playSound("unlocked");
                }
                return next;
            });
            // Ne pas changer la valeur immédiatement, laisser la carte afficher sa valeur originale
            setCards([...cardsNow]);
            if (newValue > maxRef.current) maxRef.current = newValue;

            // Ajouter un délai pour montrer la valeur originale avant de la changer
            setTimeout(() => {
                cardsNow[index2].value = newValue;
                cardsNow[index1].state = "moving";
                cardsNow[index2].timeBonus = undefined;
                setCards([...cardsNow]);
            }, FlipConstants.delay.removeCardOnsuccess);

            setTimeout(() => {
                // Load a fresh card at index1
                const max = maxRef.current;
                const cardData = generateNewCardWithSolution(
                    max,
                    cardsNow,
                    index1,
                    isFlashMode
                );
                cardsNow[index1] = {
                    value: cardData.value,
                    state: "show",
                    timeBonus: cardData.timeBonus,
                };
                setCards([...cardsNow]);
            }, FlipConstants.delay.removeCardOnsuccess + FlipConstants.delay.generateCardOnsuccess);

            const totalDelay =
                FlipConstants.delay.hideOnsuccess +
                FlipConstants.delay.removeCardOnsuccess +
                FlipConstants.delay.generateCardOnsuccess;

            setTimeout(() => {
                hideOne(cardsNow, index2);
                hideOne(cardsNow, index1);
                if (openedRef.current === index1) openedRef.current = -1;
                triggerEventRef.current = true;
                setCards([...cardsNow]);
            }, totalDelay + 500);
        } else {
            // Error path - this will be overridden by specific modes
            handleError(index1, index2, cardsNow);
        }
    }

    // This function will be overridden by specific modes
    const handleError = (
        index1: number,
        index2: number,
        cardsNow: Card[]
    ): void => {
        playSound("mistake");
        if (!isFlashMode) {
            setHearts((h) => h - 1);
            if (hearts - 1 <= 0) {
                // Lose state
                setLose(true);
                // Show all briefly & prep share text
                setTimeout(() => {
                    showAll(cardsNow);
                    setGameStarted(false);
                    if (score > bestScoreSimple) {
                        // Mettre à jour le best score simple dans Redux
                        setTextShare("Share your new high score");
                    }
                }, 100);
            } else {
                setTimeout(() => {
                    hideAll(cardsNow);
                    setCards([...cardsNow]);
                    if (openedRef?.current === index1) openedRef.current = -1;
                    triggerEventRef.current = true;
                }, FlipConstants.delay.hideOnError + 500);
            }
        } else {
            setTimeout(() => {
                hideAll(cardsNow);
                setCards([...cardsNow]);
                if (openedRef?.current === index1) openedRef.current = -1;
                triggerEventRef.current = true;
            }, FlipConstants.delay.hideOnError - 50);
        }
    };

    const onShowAll = (isSure: boolean): void => {
        if (diamonds.showAll <= 0) {
            if (admobService.getIsRewardedLoaded()) {
                if(setShowWatchAdModal){
                    setShowWatchAdModal(true);
                }
                if(setTypeAd)
                    setTypeAd("showAll");
            } else {
                setInfo({
                    show: true,
                    content: 'No "Show All Diamonds" enough :(',
                });
                setTimeout(() => setInfo({ show: false }), 2000);
            }
            return;
        }

        if (!isSure) {
            setShowAllConfirm(true);
            return;
        }

        // Confirmed
        setShowAllConfirm(false);
        setCards((prev) => {
            const next = prev.map((c) => ({ ...c }));
            showAll(next);
            return next;
        });
        noClickRef.current = false;
        decrementDiamondByKey("showAll");

        setTimeout(() => {
            setCards((prev) => {
                const next = prev.map((c) => ({ ...c }));
                hideAll(next);
                return next;
            });
            noClickRef.current = true;
        }, FlipConstants.delay.showAllDiamonds);
    };

    const onToggleShowOne = (): void => {
        if (diamonds.showOne <= 0) {
            if (admobService.getIsRewardedLoaded()) {
                if(setShowWatchAdModal)
                    setShowWatchAdModal(true);
                if(setTypeAd)
                    setTypeAd("showOne");
            } else {
                setInfo({
                    show: true,
                    content: 'No "Show One Diamonds" enough :(',
                });
                setTimeout(() => setInfo({ show: false }), 2000);
            }

            return;
        }
        const next = !showOne;
        setShowOne(next);
        setInfo(
            next
                ? {
                      show: true,
                      content: "Choose the card or tap again to deactivate",
                  }
                : { show: false }
        );
    };

    const onShare = (): void => {
        const msg = `${score} – my score in 2xFlip!`;
        if (navigator.share) {
            navigator
                .share({
                    title: "2xFlip",
                    text: msg,
                    url: window.location.href,
                })
                .catch(() => {
                    setToast({ open: true, msg: "Share canceled" });
                });
        } else {
            navigator.clipboard
                .writeText(msg)
                .then(() =>
                    setToast({ open: true, msg: "Copied to clipboard" })
                );
        }
    };

    const onTryAgain = (): void => {
        // Reset game state
        openedRef.current = -1;
        triggerEventRef.current = true;
        noClickRef.current = true;
        maxRef.current = 1;

        setScore(0);
        setLose(false);
        setShowAllConfirm(false);
        setShowOne(false);
        setHighScoreMessage("");

        const deck = makeDeck(gridSize);
        setCards(deck);
        setTimeout(() => {
            setCards((prev) => {
                const next = prev.map((c) => ({ ...c }));
                hideAll(next);
                return next;
            });
            setGameStarted(true);
        }, FlipConstants.delay.firstHideAll + gridSize * gridSize * FlipConstants.delay.firstShowDelay);
    };

    return {
        // State
        cards,
        score,
        highScoreMessage,
        lose,
        showAllConfirm,
        showAllDiamonds: diamonds.showAll,
        showOneDiamonds: diamonds.showOne,
        heartsDiamonds: diamonds.hearts,
        showOne,
        info,
        textShare,
        toast,
        gridSize,
        gameStarted,
        // Actions
        handleCardClick,
        onShowAll,
        onToggleShowOne,
        onShare,
        onTryAgain,
        setToast,
        setInfo,
        setShowAllConfirm,
        // Internal state setters for modes to use
        setLose,
        setGameStarted,
        setScore,
        setTextShare,
        // Internal refs for modes to use
        openedRef,
        triggerEventRef,
        // Error handling override
        handleError,
        setTimeLeft,
        timeLeft,
        setHearts,
        hearts,
    };
}
