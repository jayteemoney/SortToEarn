import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GameBoard } from "@/components/GameBoard";
import { LevelSelector } from "@/components/LevelSelector";
import { Button } from "@/components/ui/button";
import { ArrowLeft, List } from "lucide-react";
import { motion } from "framer-motion";

export function Game() {
  const navigate = useNavigate();
  const { levelId: urlLevelId } = useParams();
  const [currentLevel, setCurrentLevel] = useState<number | null>(
    urlLevelId ? parseInt(urlLevelId) : null
  );
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());

  const handleSelectLevel = (levelId: number) => {
    setCurrentLevel(levelId);
    navigate(`/play/${levelId}`);
  };

  const handleLevelComplete = (_moves: number) => {
    if (currentLevel) {
      setCompletedLevels((prev) => new Set(prev).add(currentLevel));
    }
  };

  const handleBackToSelection = () => {
    setCurrentLevel(null);
    navigate("/play");
  };

  if (currentLevel === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-celo-green/10 to-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
            <h1 className="text-3xl font-bold text-center flex-1">Select a Level</h1>
            <div className="w-24" /> {/* Spacer */}
          </div>

          <div className="bg-white rounded-xl shadow-lg">
            <LevelSelector
              onSelectLevel={handleSelectLevel}
              completedLevels={completedLevels}
            />
          </div>

          <div className="mt-8 text-center text-gray-500">
            <p>Select a level to start playing and earning cUSD!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-celo-green/10 to-white pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={handleBackToSelection}>
            <List className="w-4 h-4 mr-2" />
            Level Select
          </Button>
          <h1 className="text-2xl font-bold">Playing Level {currentLevel}</h1>
          <div className="w-32" /> {/* Spacer */}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GameBoard levelId={currentLevel} onComplete={handleLevelComplete} />
        </motion.div>

        {/* Next Level Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => handleSelectLevel(currentLevel + 1)}
            size="lg"
            variant="outline"
          >
            Next Level →
          </Button>
        </div>
      </div>
    </div>
  );
}
