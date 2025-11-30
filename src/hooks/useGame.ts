import { useState, useCallback } from "react";
import {
  Level,
  isLevelComplete,
  isValidMove,
  performMove,
  getLevel,
} from "../lib/levels";
import { vibrate } from "../lib/utils";

export interface GameState {
  level: Level | null;
  tubes: number[][];
  moves: number;
  history: number[][][];
  isComplete: boolean;
  selectedTube: number | null;
  hintsUsed: number;
  undosUsed: number;
  freeUndosRemaining: number;
}

const initialState: GameState = {
  level: null,
  tubes: [],
  moves: 0,
  history: [],
  isComplete: false,
  selectedTube: null,
  hintsUsed: 0,
  undosUsed: 0,
  freeUndosRemaining: 1,
};

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(initialState);

  // Load level
  const loadLevel = useCallback((levelId: number) => {
    const level = getLevel(levelId);
    if (!level) return;

    setGameState({
      ...initialState,
      level,
      tubes: level.tubes.map((tube) => [...tube]),
      history: [level.tubes.map((tube) => [...tube])],
    });
  }, []);

  // Reset current level
  const resetLevel = useCallback(() => {
    if (!gameState.level) return;
    loadLevel(gameState.level.id);
  }, [gameState.level, loadLevel]);

  // Select tube
  const selectTube = useCallback(
    (tubeIndex: number) => {
      if (gameState.isComplete) return;

      setGameState((prev) => {
        // If no tube selected, select this one
        if (prev.selectedTube === null) {
          if (prev.tubes[tubeIndex].length === 0) return prev; // Can't select empty tube
          vibrate(10);
          return { ...prev, selectedTube: tubeIndex };
        }

        // If same tube clicked, deselect
        if (prev.selectedTube === tubeIndex) {
          vibrate(10);
          return { ...prev, selectedTube: null };
        }

        // Try to perform move
        const newTubes = performMove(prev.tubes, prev.selectedTube, tubeIndex);

        if (!newTubes) {
          // Invalid move
          vibrate([50, 50, 50]);
          return { ...prev, selectedTube: null };
        }

        // Valid move
        vibrate([20, 10, 20]);
        const newHistory = [...prev.history, newTubes];
        const isComplete = isLevelComplete(newTubes);

        if (isComplete) {
          vibrate([100, 50, 100, 50, 200]); // Victory vibration
        }

        return {
          ...prev,
          tubes: newTubes,
          moves: prev.moves + 1,
          history: newHistory,
          isComplete,
          selectedTube: null,
        };
      });
    },
    [gameState.isComplete]
  );

  // Undo move
  const undoMove = useCallback((useFree: boolean = false) => {
    setGameState((prev) => {
      if (prev.history.length <= 1) return prev; // Can't undo initial state

      const newHistory = prev.history.slice(0, -1);
      const previousTubes = newHistory[newHistory.length - 1];

      vibrate(30);

      return {
        ...prev,
        tubes: previousTubes.map((tube) => [...tube]),
        moves: Math.max(0, prev.moves - 1),
        history: newHistory,
        isComplete: false,
        selectedTube: null,
        undosUsed: useFree ? prev.undosUsed : prev.undosUsed + 1,
        freeUndosRemaining: useFree
          ? prev.freeUndosRemaining - 1
          : prev.freeUndosRemaining,
      };
    });
  }, []);

  // Get hint
  const getHint = useCallback(() => {
    setGameState((prev) => {
      vibrate([50, 30, 50]);
      return {
        ...prev,
        hintsUsed: prev.hintsUsed + 1,
      };
    });

    // Simple hint: find a valid move
    const { tubes } = gameState;
    for (let from = 0; from < tubes.length; from++) {
      if (tubes[from].length === 0) continue;

      for (let to = 0; to < tubes.length; to++) {
        if (from === to) continue;
        if (isValidMove(tubes, from, to)) {
          // Flash the tubes as hint
          return { fromTube: from, toTube: to };
        }
      }
    }

    return null;
  }, [gameState.tubes]);

  return {
    gameState,
    loadLevel,
    resetLevel,
    selectTube,
    undoMove,
    getHint,
  };
}
