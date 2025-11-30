import { motion } from "framer-motion";
import { Lock, Trophy, Check } from "lucide-react";
import { LEVELS } from "@/lib/levels";
import { cn } from "@/lib/utils";

interface LevelSelectorProps {
  onSelectLevel: (levelId: number) => void;
  completedLevels?: Set<number>;
}

export function LevelSelector({ onSelectLevel, completedLevels = new Set() }: LevelSelectorProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 p-4">
      {LEVELS.map((level, index) => {
        const isCompleted = completedLevels.has(level.id);
        const isLocked = false; // Could add unlock logic here

        return (
          <motion.button
            key={level.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => !isLocked && onSelectLevel(level.id)}
            disabled={isLocked}
            className={cn(
              "relative aspect-square rounded-xl p-2 flex flex-col items-center justify-center",
              "border-2 transition-all shadow-md",
              isLocked && "opacity-50 cursor-not-allowed",
              isCompleted && "bg-gradient-to-br from-celo-green to-celo-gold border-celo-green",
              !isCompleted && !isLocked && "bg-white border-gray-300 hover:border-celo-green",
              !isCompleted && !isLocked && "hover:shadow-lg"
            )}
          >
            {isLocked ? (
              <Lock className="w-6 h-6 text-gray-400" />
            ) : isCompleted ? (
              <>
                <Check className="w-4 h-4 text-white mb-1" />
                <span className="text-xs font-bold text-white">{level.id}</span>
              </>
            ) : (
              <>
                <span className="text-lg font-bold text-gray-700">{level.id}</span>
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: level.difficulty }).map((_, i) => (
                    <Trophy key={i} className="w-2 h-2 text-celo-gold fill-celo-gold" />
                  ))}
                </div>
              </>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
