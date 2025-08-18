import Phaser from "phaser";
import { getLevelById, unlockNextLevel } from "../game";
import { LevelData } from "../game/types";

interface Cell {
    x: number;
    y: number;
    letter: string;
    textObj: Phaser.GameObjects.Text;
    bg: Phaser.GameObjects.Rectangle;
}

export class WordGameScene extends Phaser.Scene {
    private levelData: LevelData | undefined = undefined;
    private grid: Cell[][] = [];
    private selectedCell: Cell | null = null;
    private levelNumber: number = 1;
    private timerText!: Phaser.GameObjects.Text;
    private timeRemaining!: number;
    private cellSize!: number; // taille calculée dynamiquement
    private offsetX!: number;
    private offsetY!: number;
    private gameEnded: boolean = false;
    
    // Variables pour le système de swipe
    private isDragging: boolean = false;
    private dragStartX: number = 0;
    private dragStartY: number = 0;
    private dragCell: Cell | null = null;

    // Variables pour le système de hint
    private currentHintIndex: number = 0;

    constructor() {
        super("WordGameScene");
    }

    init(data: { level: number }) {
        this.levelNumber = data.level || 1;
        const levelData = getLevelById(this.levelNumber);
        if (!levelData) {
            throw new Error(`Level ${this.levelNumber} not found`);
        }
        this.levelData = levelData;
    }

    create() {
        // Reset du flag gameEnded au début de chaque partie
        this.gameEnded = false;
        
        // Reset de l'index des hints
        this.currentHintIndex = 0;

        // Set background gradient using the new color scheme
        this.cameras.main.setBackgroundColor("#600e7c");

        // Calcul taille de cellule et position de la grille
        if (!this.levelData) {
            throw new Error("Level data not found");
        }
        this.calculateCellSize();

        const { size } = this.levelData;
        const letters = this.shuffleLetters(
            this.levelData.words.join("").toUpperCase()
        );

        this.timeRemaining = this.levelData.timeLimit;

        let letterIndex = 0;

        for (let y = 0; y < size; y++) {
            this.grid[y] = [];
            for (let x = 0; x < size; x++) {
                const bg = this.add
                    .rectangle(
                        this.offsetX + x * this.cellSize,
                        this.offsetY + y * this.cellSize,
                        this.cellSize - 4,
                        this.cellSize - 4,
                        0x2c003c
                    )
                    .setOrigin(0);

                const letter = letters[letterIndex++] || " ";

                const text = this.add
                    .text(
                        bg.x + this.cellSize / 2,
                        bg.y + this.cellSize / 2,
                        letter,
                        {
                            fontSize: `${this.cellSize * 0.5}px`,
                            color: "#ffffff",
                            fontFamily: "Arial Black, sans-serif",
                            fontStyle: "bold",
                        }
                    )
                    .setOrigin(0.5);

                const cell: Cell = {
                    x,
                    y,
                    letter,
                    textObj: text,
                    bg,
                };

                this.grid[y][x] = cell;

                bg.setInteractive();
                bg.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.onCellPointerDown(cell, pointer));
            }
        }

        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                if (this.timeRemaining > 0 && !this.gameEnded) {
                    this.timeRemaining--;
                    this.updateTimer();
                    if (this.timeRemaining <= 0 && !this.gameEnded) {
                        this.gameEnded = true;
                        this.showGameOverPopup();
                    }
                }
            },
        });

        // Créer les éléments d'interface après la grille
        this.createUI();

        // Maintenant on peut mettre à jour le timer
        this.updateTimer();

        // Ajouter les événements globaux pour le swipe
        this.input.on('pointermove', this.onGlobalPointerMove, this);
        this.input.on('pointerup', this.onGlobalPointerUp, this);
    }

    private createUI() {
        // Calcul des positions basées sur la grille centrée
        const gridCenterY = this.offsetY + (this.levelData!.size * this.cellSize) / 2;
        const screenCenterY = this.cameras.main.centerY;
        const gridTopY = this.offsetY;
        const gridBottomY = this.offsetY + (this.levelData!.size * this.cellSize);

        // Category chip (au-dessus de la grille, plus proche)
        const categoryChipWidth = 200;
        const categoryChipHeight = 35; // Réduire la hauteur
        const categoryChipX = this.cameras.main.centerX;
        const categoryChipY = gridTopY - 50; // Réduire la distance (50px au lieu de 60px)

        // Background du chip catégorie
        this.add
            .rectangle(categoryChipX, categoryChipY, categoryChipWidth, categoryChipHeight, 0x8f20a2)
            .setStrokeStyle(2, 0x600e7c)
            .setDepth(10);

        // Texte de la catégorie
        this.add
            .text(categoryChipX, categoryChipY, this.levelData!.category, {
                fontSize: "16px", // Réduire légèrement la taille
                color: "#ffffff",
                fontFamily: "Arial Black, sans-serif",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(11);

        // Timer stylé (en dessous de la grille, plus proche)
        const timerX = this.cameras.main.centerX;
        const timerY = gridBottomY + 50; // Réduire la distance (50px au lieu de 60px)
        
        // Background du timer
        this.add
            .rectangle(timerX, timerY, 120, 30, 0xd6a02f) // Réduire la hauteur (30px au lieu de 35px)
            .setDepth(10);

        // Texte du timer
        this.timerText = this.add
            .text(timerX, timerY, "", {
                fontSize: "18px", // Réduire légèrement la taille
                color: "#ffffff",
                fontFamily: "Arial Black, sans-serif",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(11);
    }

    restart() {
        try {
            // Reset de l'index des hints lors du restart
            this.currentHintIndex = 0;
            this.scene.restart();
        } catch (error) {
            console.error("Error restarting scene:", error);
        }
    }

    private calculateCellSize() {
        if (!this.levelData) {
            throw new Error("Level data not found");
        }
        const padding = 15; // Réduire le padding
        const uiSpacing = 100; // Réduire l'espace UI (catégorie + timer + marges réduites)
        const availableWidth = this.cameras.main.width - padding * 2;
        const availableHeight = this.cameras.main.height - padding * 2 - uiSpacing;
        
        const sizeByWidth = Math.floor(availableWidth / this.levelData.size);
        const sizeByHeight = Math.floor(availableHeight / this.levelData.size);
        this.cellSize = Math.min(sizeByWidth, sizeByHeight);

        // Maximiser la taille en utilisant 98% de l'espace disponible
        this.cellSize = Math.floor(this.cellSize * 0.98);

        // Calcul du centrage optimisé
        const totalGridWidth = this.levelData.size * this.cellSize;
        const totalGridHeight = this.levelData.size * this.cellSize;
        
        // Centrer horizontalement
        this.offsetX = (this.cameras.main.width - totalGridWidth) / 2;
        
        // Positionner avec un espacement raisonnable du haut
        this.offsetY = 150; // Position fixe avec plus d'espace du haut
    }

    private onCellPointerDown(cell: Cell, pointer: Phaser.Input.Pointer) {
        this.isDragging = false;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
        this.dragCell = cell;
    }

    private onGlobalPointerMove(pointer: Phaser.Input.Pointer) {
        if (!this.dragCell) return;

        const dx = pointer.x - this.dragStartX;
        const dy = pointer.y - this.dragStartY;
        const dragDistance = Math.sqrt(dx * dx + dy * dy);

        // Détecter le swipe si la distance est suffisante
        if (dragDistance > 50 && !this.isDragging) {
            this.isDragging = true;
            // Afficher la couleur orange pendant le slide
            this.dragCell.bg.setFillStyle(0xffa500);
        }
    }

    private onGlobalPointerUp(pointer: Phaser.Input.Pointer) {
        if (!this.dragCell) return;

        if (this.isDragging) {
            // Gérer le swipe
            this.handleSwipe(this.dragCell, pointer);
        } else {
            // Gérer le clic normal
            this.handleCellClick(this.dragCell);
        }

        // Reset des variables de swipe
        this.isDragging = false;
        this.dragCell = null;
    }

    private handleSwipe(cell: Cell, pointer: Phaser.Input.Pointer) {
        const dx = pointer.x - this.dragStartX;
        const dy = pointer.y - this.dragStartY;
        
        // Déterminer la direction du swipe
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        
        let targetCell: Cell | null = null;
        
        if (absDx > absDy) {
            // Swipe horizontal
            if (dx > 0 && cell.x < this.levelData!.size - 1) {
                // Swipe vers la droite
                targetCell = this.grid[cell.y][cell.x + 1];
            } else if (dx < 0 && cell.x > 0) {
                // Swipe vers la gauche
                targetCell = this.grid[cell.y][cell.x - 1];
            }
        } else {
            // Swipe vertical
            if (dy > 0 && cell.y < this.levelData!.size - 1) {
                // Swipe vers le bas
                targetCell = this.grid[cell.y + 1][cell.x];
            } else if (dy < 0 && cell.y > 0) {
                // Swipe vers le haut
                targetCell = this.grid[cell.y - 1][cell.x];
            }
        }
        
        // Effectuer l'échange si une cellule cible est trouvée
        if (targetCell) {
            if (this.selectedCell) {
                this.unselectCell(this.selectedCell);
                this.selectedCell = null;
            }
            this.animateSwap(cell, targetCell);
        } else {
            // Remettre la couleur normale si pas de swap valide
            this.resetCellColor(cell);
        }
    }

    private handleCellClick(cell: Cell) {
        if (!this.selectedCell) {
            this.selectCell(cell);
        } else if (this.selectedCell === cell) {
            // Toggle: désélectionner la même cellule
            this.unselectCell(this.selectedCell);
            this.selectedCell = null;
        } else {
            if (this.isAdjacent(cell, this.selectedCell)) {
                this.animateSwap(this.selectedCell, cell);
                this.unselectCell(this.selectedCell);
                this.selectedCell = null;
            } else {
                this.unselectCell(this.selectedCell);
                this.selectCell(cell);
            }
        }
    }

    private disableCellInteractions() {
        for (const row of this.grid) {
            for (const cell of row) {
                cell.bg.disableInteractive();
            }
        }
    }

    private enableCellInteractions() {
        for (const row of this.grid) {
            for (const cell of row) {
                cell.bg.setInteractive();
            }
        }
    }

    private selectCell(cell: Cell) {
        cell.bg.setFillStyle(0xffa500);
        this.selectedCell = cell;
    }

    private unselectCell(cell: Cell) {
        this.resetCellColor(cell);
    }

    private resetCellColor(cell: Cell) {
        cell.bg.setFillStyle(0x2c003c);
    }

    private isAdjacent(c1: Cell, c2: Cell): boolean {
        const dx = Math.abs(c1.x - c2.x);
        const dy = Math.abs(c1.y - c2.y);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    private animateSwap(c1: Cell, c2: Cell) {
        const duration = 200;
        const c1Pos = {
            x: c1.bg.x + c1.bg.width / 2,
            y: c1.bg.y + c1.bg.height / 2,
        };
        const c2Pos = {
            x: c2.bg.x + c2.bg.width / 2,
            y: c2.bg.y + c2.bg.height / 2,
        };

        this.input.enabled = false;
        c1.textObj.setDepth(1);
        c2.textObj.setDepth(1);

        this.tweens.add({
            targets: c1.textObj,
            x: c2Pos.x,
            y: c2Pos.y,
            duration,
            ease: "Power2",
        });

        this.tweens.add({
            targets: c2.textObj,
            x: c1Pos.x,
            y: c1Pos.y,
            duration,
            ease: "Power2",
            onComplete: () => {
                const tempLetter = c1.letter;
                c1.letter = c2.letter;
                c2.letter = tempLetter;

                c1.textObj.setText(c1.letter);
                c2.textObj.setText(c2.letter);

                c1.textObj.setPosition(c1Pos.x, c1Pos.y);
                c2.textObj.setPosition(c2Pos.x, c2Pos.y);

                c1.textObj.setDepth(0);
                c2.textObj.setDepth(0);

                this.input.enabled = true;
                this.checkWords();
            },
        });
    }

    private updateTimer() {
        if (this.timerText) {
            this.timerText.setText(`⏳ ${this.timeRemaining}s`);
        }
    }

    private shuffleLetters(str: string): string[] {
        const arr = str.split("");
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    private checkWords() {
        if (!this.levelData) {
            throw new Error("Level data not found");
        }
        // D'abord, remettre toutes les cellules à leur couleur normale (gris)
        for (const row of this.grid) {
            for (const cell of row) {
                // Ne pas modifier la couleur de la cellule sélectionnée (orange)
                if (cell !== this.selectedCell) {
                    cell.bg.setFillStyle(0x2c003c);
                }
            }
        }

        // Ensuite, colorier en vert uniquement les mots valides
        const wordsToFind = this.levelData.words.map((w) => w.toUpperCase());
        let foundWords = 0;

        for (const row of this.grid) {
            const line = row.map((c) => c.letter).join("");
            wordsToFind.forEach((word) => {
                if (line.includes(word)) {
                    for (let i = 0; i <= line.length - word.length; i++) {
                        if (line.substring(i, i + word.length) === word) {
                            foundWords++;
                            for (let j = i; j < i + word.length; j++) {
                                row[j].bg.setFillStyle(0x2ecc71);
                            }
                        }
                    }
                }
            });
        }

        // Vérifier si tous les mots sont trouvés
        if (foundWords === wordsToFind.length && !this.gameEnded) {
            this.gameEnded = true;
            this.showVictoryPopup();
        }
    }

    // Method to change level
    changeLevel(level: number) {
        try {
            // Reset de l'index des hints lors du changement de niveau
            this.currentHintIndex = 0;
            this.scene.restart({ level });
        } catch (error) {
            console.error("Error changing level:", error);
        }
    }

    // Method to show hint
    showHint() {
        if (!this.levelData || this.gameEnded) {
            return;
        }

        // Vérifier s'il y a encore des mots à montrer
        if (this.currentHintIndex >= this.levelData.words.length) {
            // Tous les mots ont été montrés, revenir au premier
            this.currentHintIndex = 0;
        }

        // Récupérer le mot correspondant à l'index actuel
        const hintWord = this.levelData.words[this.currentHintIndex].toUpperCase();
        
        // Afficher le hint popup avec l'information du progrès
        this.showHintPopup(hintWord, this.currentHintIndex + 1, this.levelData.words.length);
        
        // Incrémenter l'index pour le prochain hint
        this.currentHintIndex++;
    }

    private showHintPopup(word: string, currentIndex: number, totalWords: number) {
        // Disable cell interactions during popup
        this.disableCellInteractions();
        // Keep input enabled for button clicks
        this.input.enabled = true;

        // Overlay background
        this.add
            .rectangle(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                this.cameras.main.width,
                this.cameras.main.height,
                0x000000,
                0.7
            )
            .setDepth(100);

        // Main popup background
        this.add
            .rectangle(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                350,
                200,
                0x2c003c
            )
            .setDepth(101);

        // Inner background for better layering
        this.add
            .rectangle(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                330,
                180,
                0xffffff
            )
            .setDepth(101.5);

        // Hint title with progress
        this.add
            .text(
                this.cameras.main.centerX,
                this.cameras.main.centerY - 50,
                `💡 Hint ${currentIndex}/${totalWords}`,
                {
                    fontSize: "24px",
                    color: "#2c3e50",
                    fontFamily: "DragonFruitDays, Arial Black, sans-serif",
                    fontStyle: "bold"
                }
            )
            .setOrigin(0.5)
            .setDepth(102);

        // Hint word
        this.add
            .text(
                this.cameras.main.centerX,
                this.cameras.main.centerY - 15,
                `Find: "${word}"`,
                {
                    fontSize: "22px",
                    color: "#8f20a2",
                    fontFamily: "DragonFruitDays, Arial Black, sans-serif",
                    fontStyle: "bold"
                }
            )
            .setOrigin(0.5)
            .setDepth(102);

        // Progress indicator
        this.add
            .text(
                this.cameras.main.centerX,
                this.cameras.main.centerY + 15,
                currentIndex < totalWords ? "Click hint again for next word" : "All words revealed! Cycle restarts.",
                {
                    fontSize: "14px",
                    color: "#666666",
                    fontFamily: "DragonFruitDays, Arial Black, sans-serif",
                    fontStyle: "italic"
                }
            )
            .setOrigin(0.5)
            .setDepth(102);

        // Close button
        const closeButton = this.add
            .rectangle(
                this.cameras.main.centerX,
                this.cameras.main.centerY + 50,
                120,
                40,
                0x600e7c
            )
            .setInteractive({ useHandCursor: true })
            .setDepth(103);

        this.add
            .text(
                this.cameras.main.centerX,
                this.cameras.main.centerY + 50,
                "Got it!",
                {
                    fontSize: "18px",
                    color: "#ffffff",
                    fontFamily: "DragonFruitDays, Arial Black, sans-serif",
                    fontStyle: "bold",
                }
            )
            .setOrigin(0.5)
            .setDepth(104);

        // Button hover effects
        closeButton.on("pointerover", () => {
            closeButton.setFillStyle(0x8f20a2);
        });

        closeButton.on("pointerout", () => {
            closeButton.setFillStyle(0x600e7c);
        });

        closeButton.on("pointerdown", () => {
            this.enableCellInteractions();
            // Remove all popup elements
            const children = this.children.list.slice();
            children.forEach((child: any) => {
                if (child.depth >= 100) {
                    child.destroy();
                }
            });
        });
    }

    private showGameOverPopup() {
        // Disable cell interactions during popup
        this.disableCellInteractions();
        // Keep input enabled for button clicks
        this.input.enabled = true;

        this.add
            .rectangle(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                this.cameras.main.width,
                this.cameras.main.height,
                0x000000,
                0.7
            )
            .setDepth(100);

        // Main popup background with gradient-like styling
        this.add
            .rectangle(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                380,
                220,
                0x2c003c
            )
            .setDepth(101);

        // Inner background for better layering
        this.add
            .rectangle(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                360,
                200,
                0xffffff
            )
            .setDepth(101.5);

        // Texte "Time's Up!" (depth 102)
        this.add
            .text(
                this.cameras.main.centerX,
                this.cameras.main.centerY - 30,
                "Time's Up!",
                {
                    fontSize: "36px",
                    color: "#2c3e50",
                    fontFamily: "DragonFruitDays, Arial Black, sans-serif",
                    fontStyle: "bold"
                }
            )
            .setOrigin(0.5)
            .setDepth(102);

        // Bouton Restart (depth 103)
        const restartButton = this.add
            .rectangle(
                this.cameras.main.centerX,
                this.cameras.main.centerY + 40,
                150,
                50,
                0x600e7c
            )
            .setInteractive({ useHandCursor: true })
            .setDepth(103);

        this.add
            .text(
                this.cameras.main.centerX,
                this.cameras.main.centerY + 40,
                "Try Again",
                {
                    fontSize: "20px",
                    color: "#ffffff",
                    fontFamily: "DragonFruitDays, Arial Black, sans-serif",
                    fontStyle: "bold",
                }
            )
            .setOrigin(0.5)
            .setDepth(104);

        // Effets de survol
        restartButton.on("pointerover", () => {
            restartButton.setFillStyle(0x8f20a2);
        });

        restartButton.on("pointerout", () => {
            restartButton.setFillStyle(0x600e7c);
        });

        restartButton.on("pointerdown", () => {
            this.enableCellInteractions();
            this.scene.restart();
        });
    }

    private showVictoryPopup() {
        // Unlock next level
        unlockNextLevel(this.levelNumber);

        // Emit level completed event
        this.events.emit("levelCompleted");
        // Disable cell interactions during popup
        this.disableCellInteractions();
        // Keep input enabled for button clicks
        this.input.enabled = true;
        
        // Vérifier s'il y a un niveau suivant
        const nextLevel = getLevelById(this.levelNumber + 1);
        
        this.add
            .rectangle(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                this.cameras.main.width,
                this.cameras.main.height,
                0x000000,
                0.7
            )
            .setDepth(100);

        // Inner background for better layering
        this.add
            .rectangle(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                360,
                !!nextLevel ? 200 : 250,
                0xffffff
            )
            .setDepth(101.5);

        this.add
            .text(
                this.cameras.main.centerX,
                this.cameras.main.centerY - 30,
                "Congratulations!",
                {
                    fontSize: "36px",
                    color: "#2c3e50",
                    fontFamily: "DragonFruitDays, Arial Black, sans-serif",
                    fontStyle: "bold"
                }
            )
            .setOrigin(0.5)
            .setDepth(102);

        if (!!nextLevel) {
            // Bouton Next Level (depth 103)
            const nextButton = this.add
                .rectangle(
                    this.cameras.main.centerX,
                    this.cameras.main.centerY + 40,
                    150,
                    50,
                    0x8f20a2
                )
                .setInteractive({ useHandCursor: true })
                .setDepth(103);

            this.add
                .text(
                    this.cameras.main.centerX,
                    this.cameras.main.centerY + 40,
                    "Next Level",
                    {
                        fontSize: "20px",
                        color: "#ffffff",
                        fontFamily: "DragonFruitDays, Arial Black, sans-serif",
                        fontStyle: "bold",
                    }
                )
                .setOrigin(0.5)
                .setDepth(104);

            // Effets de survol
            nextButton.on("pointerover", () => {
                nextButton.setFillStyle(0x600e7c);
            });

            nextButton.on("pointerout", () => {
                nextButton.setFillStyle(0x8f20a2);
            });

            nextButton.on("pointerdown", () => {
                this.enableCellInteractions();
                this.events.emit("levelChanged", this.levelNumber + 1);
                this.changeLevel(this.levelNumber + 1);
            });
        } else {
            // Message de fin de jeu (pas de niveau suivant)
            this.add
                .text(
                    this.cameras.main.centerX,
                    this.cameras.main.centerY + 20,
                    "You completed all levels!",
                    {
                        fontSize: "22px",
                        color: "#8f20a2",
                        fontFamily: "DragonFruitDays, Arial Black, sans-serif",
                        fontStyle: "bold",
                        stroke: "#ffffff",
                        strokeThickness: 1
                    }
                )
                .setOrigin(0.5)
                .setDepth(102);

            this.add
                .text(
                    this.cameras.main.centerX,
                    this.cameras.main.centerY + 50,
                    "Thank you for playing!",
                    {
                        fontSize: "18px",
                        color: "#600e7c",
                        fontFamily: "DragonFruitDays, Arial Black, sans-serif",
                        fontStyle: "italic",
                    }
                )
                .setOrigin(0.5)
                .setDepth(102);
        }
    }
}

