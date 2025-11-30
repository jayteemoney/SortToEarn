import { motion } from "framer-motion";
import { COLORS } from "@/lib/levels";

interface BallProps {
  color: number;
  index: number;
}

export function Ball({ color, index }: BallProps) {
  return (
    <motion.div
      initial={{ scale: 0, y: -50 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: index * 0.05,
      }}
      className="w-full aspect-square rounded-full shadow-lg"
      style={{
        backgroundColor: COLORS[color - 1],
        boxShadow: `0 4px 8px ${COLORS[color - 1]}40`,
      }}
    />
  );
}
