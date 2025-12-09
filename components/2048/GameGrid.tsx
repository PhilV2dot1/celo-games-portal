import { Grid } from "@/lib/games/2048-logic";
import { Tile } from "./Tile";

interface GameGridProps {
  grid: Grid;
}

export function GameGrid({ grid }: GameGridProps) {
  return (
    <div
      className="bg-gradient-to-br from-gray-100 via-gray-50 to-yellow-50/20 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl relative overflow-hidden"
      style={{
        boxShadow: "0 0 0 3px #FCFF52, 0 10px 15px -3px rgba(0, 0, 0, 0.2)"
      }}
    >
      {/* Glassmorphic overlay with dot pattern */}
      <div
        className="absolute inset-0 bg-white/40 backdrop-blur-sm"
        style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(252, 255, 82, 0.08) 2%, transparent 0%),
                           radial-gradient(circle at 75px 75px, rgba(252, 255, 82, 0.08) 2%, transparent 0%)`,
          backgroundSize: "100px 100px"
        }}
      />

      {/* 4x4 Grid */}
      <div className="relative z-10 grid grid-cols-4 gap-2 sm:gap-3 aspect-square max-w-md mx-auto">
        {grid.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <Tile
              key={`${rowIndex}-${colIndex}`}
              value={value}
            />
          ))
        )}
      </div>
    </div>
  );
}
