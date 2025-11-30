import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Tube } from "./Tube";
import { Button } from "./ui/button";
import { Undo, RotateCcw, Lightbulb, Trophy, Coins } from "lucide-react";
import { useGame } from "@/hooks/useGame";
import { useSortToEarn } from "@/hooks/useContract";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";

interface GameBoardProps {
  levelId: number;
  onComplete?: (moves: number) => void;
}

export function GameBoard({ levelId, onComplete }: GameBoardProps) {
  const { gameState, loadLevel, resetLevel, selectTube, undoMove, getHint } = useGame();
  const { claimReward, purchaseHint, purchaseUndo, hintCost, undoCost } = useSortToEarn();
  const { isConnected } = useAccount();

  // Load level on mount
  useEffect(() => {
    loadLevel(levelId);
  }, [levelId, loadLevel]);

  // Handle level completion
  useEffect(() => {
    if (gameState.isComplete && gameState.level) {
      // Show congratulations message (with ID to prevent duplicates)
      toast.success("Congratulations! Level complete!", {
        id: "level-complete",
        duration: 3000,
      });

      // Call completion callback
      if (onComplete) {
        onComplete(gameState.moves);
      }
    }
  }, [gameState.isComplete, gameState.level, gameState.moves, onComplete]);

  const handleUndo = async () => {
    if (gameState.freeUndosRemaining > 0) {
      undoMove(true);
      toast.success("Free undo used!");
    } else {
      if (!isConnected) {
        toast.error("Connect wallet to purchase undo");
        return;
      }

      try {
        toast.loading("Purchasing undo...", { id: "undo" });
        await purchaseUndo();
        undoMove(false);
        toast.success("Undo purchased!", { id: "undo" });
      } catch (error: any) {
        toast.error(error.message || "Failed to purchase undo", { id: "undo" });
      }
    }
  };

  const handleHint = async () => {
    if (!isConnected) {
      toast.error("Connect wallet to purchase hint");
      return;
    }

    try {
      toast.loading("Purchasing hint...", { id: "hint" });
      await purchaseHint();
      const hint = getHint();
      if (hint) {
        toast.success(`Try moving from tube ${hint.fromTube + 1} to tube ${hint.toTube + 1}!`, {
          id: "hint",
          duration: 5000,
        });
      } else {
        toast.success("Hint purchased, but no obvious move found!", { id: "hint" });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to purchase hint", { id: "hint" });
    }
  };

  const handleClaimReward = async () => {
    if (!isConnected) {
      toast.error("Connect wallet to claim reward");
      return;
    }

    if (!gameState.level || !gameState.isComplete) return;

    try {
      toast.loading("Claiming reward...", { id: "claim" });
      await claimReward(gameState.level.id, gameState.moves);
      toast.success("Reward claimed successfully!", { id: "claim" });
    } catch (error: any) {
      toast.error(error.message || "Failed to claim reward", { id: "claim" });
    }
  };

  if (!gameState.level) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celo-green"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Header */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">Level</div>
              <div className="text-2xl font-bold text-celo-green">
                {gameState.level.id}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Moves</div>
              <div className="text-2xl font-bold">{gameState.moves}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Optimal</div>
              <div className="text-2xl font-bold text-gray-400">
                {gameState.level.optimalMoves}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={resetLevel} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Difficulty */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-gray-500">Difficulty:</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Trophy
                key={i}
                className={`w-4 h-4 ${
                  i < (gameState.level?.difficulty || 1)
                    ? "text-celo-gold fill-celo-gold"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex flex-wrap gap-3 justify-center max-w-4xl">
        <AnimatePresence>
          {gameState.tubes.map((balls, index) => (
            <Tube
              key={index}
              balls={balls}
              isSelected={gameState.selectedTube === index}
              onClick={() => selectTube(index)}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <Button onClick={handleUndo} variant="outline" disabled={gameState.history.length <= 1}>
            <Undo className="w-4 h-4 mr-2" />
            Undo
            {gameState.freeUndosRemaining > 0 ? (
              <span className="ml-1 text-xs">(Free)</span>
            ) : (
              <span className="ml-1 text-xs">
                ({formatCurrency(undoCost as bigint)} cUSD)
              </span>
            )}
          </Button>

          <Button onClick={handleHint} variant="outline">
            <Lightbulb className="w-4 h-4 mr-2" />
            Hint ({formatCurrency(hintCost as bigint)} cUSD)
          </Button>

          {gameState.isComplete && (
            <Button onClick={handleClaimReward}>
              <Coins className="w-4 h-4 mr-2" />
              Claim Reward
            </Button>
          )}
        </div>
      </div>

    </div>
  );
}
