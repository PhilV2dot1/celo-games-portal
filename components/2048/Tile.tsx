import { motion } from "framer-motion";
import { TileValue, TILE_COLORS } from "@/lib/games/2048-logic";

interface TileProps {
  value: TileValue;
  row: number;
  col: number;
}

export function Tile({ value, row, col }: TileProps) {
  const colors = TILE_COLORS[value];

  // Calculate font size based on value length
  const getFontSize = () => {
    if (value === 0) return 'text-2xl';
    const digits = value.toString().length;
    if (digits <= 2) return 'text-3xl sm:text-4xl';
    if (digits === 3) return 'text-2xl sm:text-3xl';
    return 'text-xl sm:text-2xl';
  };

  // Extract color values from Tailwind classes
  const bgColor = colors.bgColor || '#cdc1b4';
  const textColor = colors.textColor || '#776e65';

  return (
    <motion.div
      key={`${row}-${col}`}
      animate={{
        scale: 1,
        opacity: 1,
        backgroundColor: bgColor,
      }}
      initial={false}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.15,
      }}
      className={`
        rounded-xl sm:rounded-2xl
        flex items-center justify-center
        font-bold ${getFontSize()}
        aspect-square
        ${value >= 8 ? 'shadow-lg' : 'shadow-md'}
        transition-all duration-100
      `}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        backgroundImage: colors.gradient,
        boxShadow: colors.shadow,
      }}
    >
      {value > 0 ? value : ''}
    </motion.div>
  );
}
