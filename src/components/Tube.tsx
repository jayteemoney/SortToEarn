import { motion } from "framer-motion";
import { Ball } from "./Ball";
import { cn } from "@/lib/utils";

interface TubeProps {
  balls: number[];
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

export function Tube({ balls, isSelected, onClick, index }: TubeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative flex flex-col-reverse items-center justify-start p-2 pb-4 gap-1",
        "rounded-2xl border-4 transition-all cursor-pointer",
        "bg-gradient-to-b from-gray-50 to-gray-100",
        "min-h-[200px] w-[60px] sm:w-[70px]",
        isSelected
          ? "border-celo-green shadow-xl shadow-celo-green/50 scale-105"
          : "border-gray-300 hover:border-gray-400 shadow-md"
      )}
      style={{
        perspective: "1000px",
      }}
    >
      {/* Tube lip */}
      <div className="absolute -top-2 left-0 right-0 h-3 bg-gradient-to-b from-gray-300 to-gray-200 rounded-t-lg border-x-4 border-t-4 border-gray-300" />

      {/* Balls */}
      <div className="flex flex-col-reverse gap-1 w-full px-1">
        {balls.map((color, idx) => (
          <Ball key={`${index}-${idx}-${color}`} color={color} index={idx} />
        ))}
      </div>

      {/* Empty slots indicator */}
      {balls.length < 4 && (
        <div className="absolute inset-0 flex flex-col-reverse items-center justify-start p-2 pb-4 gap-1 pointer-events-none opacity-20">
          {Array.from({ length: 4 - balls.length }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="w-full aspect-square rounded-full border-2 border-dashed border-gray-400"
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
