type Coord = { x: number; y: number };
type Arrow = Coord & { direction: "up" | "down" | "left" | "right" };

function internalGenerate(gridSize: number): {
    id: number;
    gameConfig: {
        gridSize: number;
        cube1Start: Coord;
        cube2Start: Coord;
        goals: Coord[];
        walls: Coord[];
        portals: Coord[];
        arrows: Arrow[];
        maxMoves: number;
    };
} {
    const directions = ["up", "down", "left", "right"] as const;

    const occupied = new Set<string>();
    const taken = (x: number, y: number) => occupied.has(`${x},${y}`);
    const mark = (pos: Coord) => occupied.add(`${pos.x},${pos.y}`);

    const getRandomCoord = (): Coord => ({
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
    });

    const getFreeCoord = (): Coord => {
        let coord: Coord;
        let tries = 0;
        do {
            coord = getRandomCoord();
            tries++;
            if (tries > 1000) throw new Error("Unable to find free coord");
        } while (taken(coord.x, coord.y));
        mark(coord);
        return coord;
    };

    const generateWalls = (count: number): Coord[] => {
        const walls: Coord[] = [];
        let tries = 0;
        while (walls.length < count && tries++ < 1000) {
            const coord = getRandomCoord();
            if (!taken(coord.x, coord.y)) {
                mark(coord);
                walls.push(coord);
            }
        }
        return walls;
    };

    const generatePortals = (): Coord[] => {
        const pairCount = [0, 1][Math.floor(Math.random() * 2)];
        const portals: Coord[] = [];
        for (let i = 0; i < pairCount * 2; i++) {
            portals.push(getFreeCoord());
        }
        return portals;
    };

    const generateArrows = (max: number): Arrow[] => {
        const count = Math.floor(Math.random() * (max + 1));
        const arrows: Arrow[] = [];
        for (let i = 0; i < count; i++) {
            const coord = getFreeCoord();
            const direction =
                directions[Math.floor(Math.random() * directions.length)];
            arrows.push({ ...coord, direction });
        }
        return arrows;
    };

    const id = Math.floor(Math.random() * 1000);

    const cube1Start = getFreeCoord();
    const cube2Start = getFreeCoord();

    const goals = [getFreeCoord(), getFreeCoord()];

    const wallCount = Math.floor(Math.random() * (gridSize * 2 - 3 + 1)) + 3;
    const walls = generateWalls(wallCount);

    const portals = generatePortals();
    const arrows = generateArrows(gridSize);

    const manhattan = (a: Coord, b: Coord) =>
        Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    const minDist =
        Math.min(
            manhattan(cube1Start, goals[0]),
            manhattan(cube1Start, goals[1])
        ) +
        Math.min(
            manhattan(cube2Start, goals[0]),
            manhattan(cube2Start, goals[1])
        );

    const maxMoves = Math.max(Math.ceil(minDist * 1.5), gridSize * 2);
    const cappedMaxMoves = Math.min(maxMoves, gridSize * 4);

    return {
        id,
        gameConfig: {
            gridSize,
            cube1Start,
            cube2Start,
            goals,
            walls,
            portals,
            arrows,
            maxMoves: cappedMaxMoves,
        },
    };
}

function isSolvable(
    start: Coord,
    goals: Coord[],
    walls: Coord[],
    portals: Coord[],
    arrows: Arrow[],
    gridSize: number
): boolean {
    const wallSet = new Set(walls.map((w) => `${w.x},${w.y}`));
    const arrowMap = new Map<string, string>();
    const portalMap = new Map<string, string>();

    for (const a of arrows) {
        arrowMap.set(`${a.x},${a.y}`, a.direction);
    }

    // Pair portals by order: [0,1], [2,3], etc.
    for (let i = 0; i < portals.length; i += 2) {
        if (portals[i + 1]) {
            portalMap.set(
                `${portals[i].x},${portals[i].y}`,
                `${portals[i + 1].x},${portals[i + 1].y}`
            );
            portalMap.set(
                `${portals[i + 1].x},${portals[i + 1].y}`,
                `${portals[i].x},${portals[i].y}`
            );
        }
    }

    const visited = new Set<string>();
    const queue: Coord[] = [start];

    const inBounds = (x: number, y: number) =>
        x >= 0 && y >= 0 && x < gridSize && y < gridSize;

    const deltas: Record<string, [number, number]> = {
        up: [0, -1],
        down: [0, 1],
        left: [-1, 0],
        right: [1, 0],
    };

    while (queue.length > 0) {
        const current = queue.shift()!;
        const key = `${current.x},${current.y}`;

        if (visited.has(key)) continue;
        visited.add(key);

        // Reached a goal
        if (goals.some((g) => g.x === current.x && g.y === current.y))
            return true;

        // Portal ?
        const portalTarget = portalMap.get(key);
        if (portalTarget) {
            const [px, py] = portalTarget.split(",").map(Number);
            queue.push({ x: px, y: py });
            continue;
        }

        // Arrow ?
        const arrow = arrowMap.get(key);
        if (arrow) {
            const [dx, dy] = deltas[arrow];
            const nx = current.x + dx;
            const ny = current.y + dy;
            const nKey = `${nx},${ny}`;
            if (inBounds(nx, ny) && !wallSet.has(nKey) && !visited.has(nKey)) {
                queue.push({ x: nx, y: ny });
            }
            continue;
        }

        // Standard movement
        for (const [dx, dy] of Object.values(deltas)) {
            const nx = current.x + dx;
            const ny = current.y + dy;
            const nKey = `${nx},${ny}`;
            if (inBounds(nx, ny) && !wallSet.has(nKey) && !visited.has(nKey)) {
                queue.push({ x: nx, y: ny });
            }
        }
    }

    return false;
}

function generateRandomLevel(gridSize: number) {
    let level;
    do {
        level = internalGenerate(gridSize); // ancienne logique déplacée dans internalGenerate()
    } while (
        !isSolvable(
            level.gameConfig.cube1Start,
            level.gameConfig.goals,
            level.gameConfig.walls,
            level.gameConfig.portals,
            level.gameConfig.arrows,
            gridSize
        ) ||
        !isSolvable(
            level.gameConfig.cube2Start,
            level.gameConfig.goals,
            level.gameConfig.walls,
            level.gameConfig.portals,
            level.gameConfig.arrows,
            gridSize
        )
    );
    return level;
}

export default generateRandomLevel;