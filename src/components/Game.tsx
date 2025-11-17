import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '../types/gameTypes';
import { GameEngine } from '../game/core/GameEngine';
import { InputManager } from '../game/core/InputManager';
import { IndexedDBManager } from '../storage/IndexedDBManager';
import { SaveSystem } from '../storage/SaveSystem';
import { GAME_CONFIG } from '../constants/gameConfig';
import { RECIPES } from '../constants/recipes';
import { HUD } from './UI/HUD';
import { Inventory } from './UI/Inventory';
import { CraftingMenu } from './UI/CraftingMenu';
import { PauseMenu } from './UI/PauseMenu';
import { GameOver } from './UI/GameOver';
import { Victory } from './UI/Victory';
import { Minimap } from './UI/Minimap';
import { TutorialHint } from './UI/TutorialHint';
import { AchievementToast } from './UI/AchievementToast';
import { Achievement } from '../game/systems/AchievementSystem';

const dbManager = new IndexedDBManager();

export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showCrafting, setShowCrafting] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [lastUnlockedAchievement, setLastUnlockedAchievement] = useState<Achievement | null>(null);
  const [currentTutorialHint, setCurrentTutorialHint] = useState<string | null>(null);

  const gameEngineRef = useRef<GameEngine | null>(null);
  const inputManagerRef = useRef<InputManager | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    initGame();
    return () => cleanup();
  }, []);

  const initGame = async () => {
    await dbManager.init();

    const saveSystem = new SaveSystem(dbManager);
    const latestSave = await saveSystem.loadLatestSave();

    const initialState = latestSave || saveSystem.createNewGame();

    if (canvasRef.current) {
      inputManagerRef.current = new InputManager(canvasRef.current);
    }

    gameEngineRef.current = new GameEngine(
      initialState,
      inputManagerRef.current!
    );

    setGameState(initialState);
    startGameLoop();
  };

  const startGameLoop = () => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (!isPaused && gameEngineRef.current) {
        gameEngineRef.current.update(deltaTime);

        const updatedState = gameEngineRef.current.getState();
        setGameState(updatedState);

        checkGameConditions(updatedState);

        // Check for tutorial hints
        const hint = gameEngineRef.current.getTutorialHint();
        if (hint && hint !== currentTutorialHint) {
          setCurrentTutorialHint(hint);
        }

        // Check for new achievements
        const achievementSystem = gameEngineRef.current.getAchievementSystem();
        const achievements = achievementSystem.getAchievements();
        const newlyUnlocked = achievements.find(a => a.unlocked && a.unlockedAt && Date.now() - a.unlockedAt < 100);
        if (newlyUnlocked && (!lastUnlockedAchievement || newlyUnlocked.id !== lastUnlockedAchievement.id)) {
          setLastUnlockedAchievement(newlyUnlocked);
        }

        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d')!;
          gameEngineRef.current.render(ctx);
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  };

  const checkGameConditions = (state: GameState) => {
    if (state.player.health <= 0 && !gameOver) {
      setGameOver(true);
      setIsPaused(true);
    }

    const allChildrenRescued = state.world.childrenRescued.every((r) => r);
    if (state.dayNightCycle.currentDay >= 99 && allChildrenRescued && !victory) {
      setVictory(true);
      setIsPaused(true);
    }
  };

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (inputManagerRef.current) {
      inputManagerRef.current.cleanup();
    }
  };

  const handleSaveGame = async () => {
    if (gameState) {
      const saveSystem = new SaveSystem(dbManager);
      await saveSystem.saveGame(gameState);
      alert('Game saved!');
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'escape') {
        e.preventDefault();
        if (!showInventory && !showCrafting) {
          handlePause();
        }
      }
      if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setShowInventory(!showInventory);
        setIsPaused(!showInventory);
      }
      if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setShowCrafting(!showCrafting);
        setIsPaused(!showCrafting);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPaused, showInventory, showCrafting]);

  if (!gameState) {
    return (
      <div className="loading-screen">
        <h1>99 Nights: Forest Survival</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.RENDERING.CANVAS_WIDTH}
        height={GAME_CONFIG.RENDERING.CANVAS_HEIGHT}
        className="game-canvas"
      />

      <HUD
        player={gameState.player}
        dayNightCycle={gameState.dayNightCycle}
        inventory={gameState.inventory}
        childrenRescued={gameState.world.childrenRescued.filter((r) => r).length}
        dashCooldown={gameEngineRef.current?.getPlayer().getDashCooldownProgress() || 0}
      />

      <Minimap
        world={gameState.world}
        player={gameState.player}
        children={gameState.world.childrenPositions}
      />

      {currentTutorialHint && (
        <TutorialHint
          hint={currentTutorialHint}
          onDismiss={() => {
            gameEngineRef.current?.dismissTutorialHint();
            setCurrentTutorialHint(null);
          }}
        />
      )}

      {lastUnlockedAchievement && (
        <AchievementToast
          achievement={lastUnlockedAchievement}
          onDismiss={() => setLastUnlockedAchievement(null)}
        />
      )}

      {showInventory && (
        <Inventory
          inventory={gameState.inventory}
          onClose={() => {
            setShowInventory(false);
            setIsPaused(false);
          }}
          onUseItem={(item) => gameEngineRef.current?.handleUseItem(item)}
          onEquipWeapon={(weapon) => gameEngineRef.current?.handleEquipWeapon(weapon)}
        />
      )}

      {showCrafting && (
        <CraftingMenu
          recipes={RECIPES}
          inventory={gameState.inventory}
          onCraft={(recipeId) => gameEngineRef.current?.handleCraft(recipeId)}
          onClose={() => {
            setShowCrafting(false);
            setIsPaused(false);
          }}
        />
      )}

      {isPaused && !showInventory && !showCrafting && !gameOver && !victory && (
        <PauseMenu
          onResume={handlePause}
          onSave={handleSaveGame}
          onMainMenu={() => window.location.reload()}
        />
      )}

      {gameOver && (
        <GameOver
          statistics={gameState.statistics}
          daysLasted={gameState.dayNightCycle.currentDay}
          onRestart={() => window.location.reload()}
        />
      )}

      {victory && (
        <Victory
          statistics={gameState.statistics}
          onMainMenu={() => window.location.reload()}
        />
      )}
    </div>
  );
};
