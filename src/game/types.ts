// Types pour les niveaux
export interface LevelData {
  id: number;
  category: string;
  size: number;
  words: string[];
  timeLimit: number;
  unlocked?: boolean;
  completed?: boolean;
  bestScore?: number;
  targetScore?: number;
  gameConfig?: TwinCubeLevel; // Pour la compatibilité avec l'ancien format
}

// Types pour les éléments de jeu
export interface GameElement {
  id: string;
  type: 'cube' | 'platform' | 'collectible' | 'obstacle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  properties?: Record<string, unknown>;
}

// Types pour les événements de jeu
export interface GameEvent {
  type: 'level_start' | 'level_complete' | 'level_fail' | 'score_update' | 'pause' | 'resume';
  data?: unknown;
  timestamp: number;
}

// Types pour les scores
export interface ScoreData {
  levelId: number;
  score: number;
  time: number;
  stars: number;
  date: string;
}

// Types pour les paramètres de jeu
export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
}

// Types pour les sauvegardes
export interface GameSave {
  currentLevel: number;
  unlockedLevels: number[];
  completedLevels: number[];
  scores: ScoreData[];
  settings: GameSettings;
  totalPlayTime: number;
  lastPlayed: string;
}

// Types spécifiques pour TwinCube (ancien format)
export interface TwinCubeLevel {
  gridSize: number;
  cube1Start: { x: number; y: number };
  cube2Start: { x: number; y: number };
  goals: Array<{ x: number; y: number }>;
  walls: Array<{ x: number; y: number }>;
  portals: Array<{ x: number; y: number }>;
  arrows: Array<{ x: number; y: number; direction: 'up' | 'down' | 'left' | 'right' }>;
  maxMoves: number;
}

// Types pour le nouveau jeu de mots
export interface WordGameLevel {
  id: number;
  category: string;
  size: number;
  words: string[];
  timeLimit: number;
}

export interface GameSprite extends Phaser.GameObjects.Image {
  gridPosition: { x: number; y: number };
} 