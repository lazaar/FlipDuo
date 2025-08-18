import Phaser from 'phaser';
import { WordGameScene } from '../scenes/WordGameScene';

export class GameManager {
  private game: Phaser.Game | null = null;
  private currentLevel: number = 1;
  private resizeHandler: (() => void) | null = null;

  constructor() {
    this.currentLevel = 1;
  }

  createGame(container: HTMLElement, level: number = 1): Phaser.Game {
    // Destroy any existing game first
    this.destroy();
    
    this.currentLevel = level;

    // Configuration de Phaser avec corrections pour WebGL
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight, // Utiliser toute la hauteur disponible
      parent: container,
      backgroundColor: '#ebebeb',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: [],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight
      },
      render: {
        pixelArt: false,
        antialias: true,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false,
        desynchronized: false,
        preserveDrawingBuffer: false,
        premultipliedAlpha: true,
        roundPixels: false,
        batchSize: 512,
        maxTextures: 0,
        mipmapFilter: 'LINEAR'
      },
      callbacks: {
        preBoot: () => {
          console.log('Phaser preBoot');
        },
        postBoot: () => {
          console.log('Phaser postBoot');
        }
      }
    };

    try {
      // Créer l'instance du jeu
      this.game = new Phaser.Game(config);

      // Gestion des erreurs
      this.game.events.on('error', (error: unknown) => {
        console.error('Phaser error:', error);
      });

      // Attendre que le jeu soit prêt puis initialiser le niveau
      this.game.events.once('ready', () => {
        console.log('Phaser game ready');
        this.initializeLevel(level);
        
        // Écouter les événements de la scène et les transmettre au niveau du jeu
        const scene = this.game!.scene.getScene('WordGameScene') as WordGameScene;
        if (scene) {
          scene.events.on('levelChanged', (newLevel: number) => {
            this.currentLevel = newLevel;
            // Transmettre l'événement au niveau du jeu
            this.game!.events.emit('levelChanged', newLevel);
          });
        }
      });

      // Gestion du redimensionnement
      this.resizeHandler = () => {
        if (this.game) {
          this.game.scale.refresh();
        }
      };
      window.addEventListener('resize', this.resizeHandler);

    } catch (error) {
      console.error('Error creating Phaser game:', error);
      // Fallback vers Canvas si WebGL échoue
      this.createFallbackGame(container, level);
    }

    return this.game!;
  }

  private createFallbackGame(container: HTMLElement, level: number) {
    console.log('Creating fallback Canvas game');
    
    const fallbackConfig: Phaser.Types.Core.GameConfig = {
      type: Phaser.CANVAS,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: container,
      backgroundColor: '#ebebeb',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: [WordGameScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      render: {
        pixelArt: false,
        antialias: true
      }
    };

    this.game = new Phaser.Game(fallbackConfig);
    this.game.events.once('ready', () => {
      this.initializeLevel(level);
    });
  }

  private initializeLevel(level: number) {
    if (!this.game) return;

    try {
      const scene = this.game.scene.getScene('WordGameScene');
      if (scene && scene.scene.isActive()) {
        this.game.scene.remove('WordGameScene');
        this.game.scene.add('WordGameScene', WordGameScene, true, { level });
      } else {
        this.game.scene.add('WordGameScene', WordGameScene, true, { level });
      }
    } catch (error) {
      console.error('Error initializing level:', error);
    }
  }

  changeLevel(level: number) {
    this.currentLevel = level;
    
    if (this.game) {
      try {
        const scene = this.game.scene.getScene('WordGameScene') as WordGameScene;
        if (scene) {
          scene.changeLevel(level);
        }
      } catch (error) {
        console.error('Error changing level:', error);
      }
    }
  }

  restart() {
    if (this.game) {
      try {
        const scene = this.game.scene.getScene('WordGameScene') as WordGameScene;
        if (scene) {
          scene.restart();
        }
      } catch (error) {
        console.error('Error restarting game:', error);
      }
    }
  }

  pause() {
    if (this.game) {
      try {
        this.game.scene.pause('WordGameScene');
      } catch (error) {
        console.error('Error pausing game:', error);
      }
    }
  }

  resume() {
    if (this.game) {
      try {
        this.game.scene.resume('WordGameScene');
      } catch (error) {
        console.error('Error resuming game:', error);
      }
    }
  }

  destroy() {
    if (this.game) {
      try {
        // Pause and stop all scenes
        this.game.scene.pause('WordGameScene');
        this.game.scene.stop('WordGameScene');
        
        // Remove resize listener
        if (this.resizeHandler) {
          window.removeEventListener('resize', this.resizeHandler);
          this.resizeHandler = null;
        }
        
        // Destroy the game completely
        this.game.destroy(true, false);
        this.game = null;
        
        console.log('Game destroyed successfully');
      } catch (error) {
        console.error('Error destroying game:', error);
        // Force null even if destroy fails
        this.game = null;
      }
    }
  }

  getCurrentLevel(): number {
    return this.currentLevel;
  }

  isGameRunning(): boolean {
    return this.game !== null && this.game.isRunning;
  }

  showHint() {
    if (this.game) {
      try {
        const scene = this.game.scene.getScene('WordGameScene') as WordGameScene;
        if (scene) {
          scene.showHint();
        }
      } catch (error) {
        console.error('Error showing hint:', error);
      }
    }
  }
}

// Instance singleton du gestionnaire de jeu
export const gameManager = new GameManager(); 