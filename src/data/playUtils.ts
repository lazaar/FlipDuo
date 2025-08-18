import { Card } from './playTypes';
import { FlipConstants } from './playConstants';

// CSS class mapping for numbers up to 2048 (similar to 2048 game)
export function getNumberClass(value: number | "X" | "J"): string {
    const classMap: Record<number | "X" | "J", string> = {
        2: 'card-number-2',
        4: 'card-number-4',
        8: 'card-number-8',
        16: 'card-number-16',
        32: 'card-number-32',
        64: 'card-number-64',
        128: 'card-number-128',
        256: 'card-number-256',
        512: 'card-number-512',
        1024: 'card-number-1024',
        2048: 'card-number-2048',
        "X": 'card-number-x',
        "J": 'card-number-j',
    };

    return classMap[value] || 'card-number-default';
}

// Card utilities
export function makeDeck(size: number): Card[] {
    const total = size * size;
    const deck: Card[] = [];
    for (let i = 0; i < total; i++) {
        deck.push({ value: FlipConstants.init.initValue, state: "show" });
    }
    return deck;
}

export function hideAll(cards: Card[]): void {
    for (const c of cards) if (c.state !== "load") c.state = "hide";
}

export function showAll(cards: Card[]): void {
    for (const c of cards) if (c.state !== "load") c.state = "show";
}

export function showOneFunction(cards: Card[], index: number): void {
    const c = cards[index];
    if (c && c.state !== "load") c.state = "show";
}

export function hideOne(cards: Card[], index: number): void {
    const c = cards[index];
    if (c && c.state !== "load") c.state = "hide";
}

export function shuffleExceptIndex<T>(arr: T[], protectedIndex: number): number {
    // Returns the new index of the protected item after shuffle
    const temp = arr.map((x, i) => ({ x, i }));
    const prot = temp.splice(protectedIndex, 1)[0];
    for (let i = temp.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [temp[i], temp[j]] = [temp[j], temp[i]];
    }
    // Reinsert protected at random position
    const newPos = Math.floor(Math.random() * (temp.length + 1));
    temp.splice(newPos, 0, prot);
    // Write back
    for (let k = 0; k < temp.length; k++) arr[k] = temp[k].x;
    // Find where protected ended up
    return temp.findIndex((t) => t.i === prot.i);
}

export function compareTwoCards(a: Card, b: Card, max: number): number {
    if (typeof b.value === "number" && a.value === "J") {
        return b.value * 2;
    }
    if (typeof a.value === "number" && b.value === "J") {
        return a.value * 2;
    }
    if ((a.value === "J" && b.value === "J") || (a.value === "J" && b.value === "X") || (a.value === "X" && b.value === "J")) {
        return max * 2;
    }
    if (typeof a.value === "number" && a.value === b.value) {
        return a.value * 2; // sum per original rule
    }
    return -1;
}
