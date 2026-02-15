"use client";

import { memo } from "react";
import { WALL, PATH, PLAYER, START, EXIT } from "@/lib/games/maze-logic";
import type { MazeGrid } from "@/lib/games/maze-logic";

interface MazeBoardProps {
  grid: MazeGrid;
  gridSize: number;
  visibleCells?: Set<string> | null;
}

const CELL_COLORS: Record<number, string> = {
  [WALL]: "bg-gray-800 dark:bg-gray-900",
  [PATH]: "bg-gray-100 dark:bg-gray-600",
  [PLAYER]: "bg-chain shadow-inner",
  [START]: "bg-green-300 dark:bg-green-700",
  [EXIT]: "bg-yellow-400 dark:bg-yellow-500 animate-pulse",
};

const FOG_CELL = "bg-gray-950";

export const MazeBoard = memo(function MazeBoard({
  grid,
  gridSize,
  visibleCells,
}: MazeBoardProps) {
  if (grid.length === 0) return null;

  const hasFog = visibleCells != null;
  // Adjust cell sizing for larger grids
  const cellMin = gridSize > 35 ? "6px" : gridSize > 21 ? "8px" : "12px";
  const cellGap = gridSize > 21 ? "0px" : "1px";

  return (
    <div
      data-testid="maze-board"
      className="bg-gray-800 dark:bg-gray-900 rounded-xl p-1 shadow-xl border-2 border-gray-700 dark:border-gray-600 mx-auto overflow-auto"
      style={{ maxWidth: "100%" }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gap: cellGap,
        }}
      >
        {grid.flatMap((row, rowIdx) =>
          row.map((cell, colIdx) => {
            const isVisible = !hasFog || visibleCells.has(`${rowIdx},${colIdx}`);

            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                data-testid={`maze-cell-${rowIdx}-${colIdx}`}
                className={`aspect-square ${
                  isVisible
                    ? `${CELL_COLORS[cell] || CELL_COLORS[PATH]} ${cell === PLAYER ? "rounded-full" : ""}`
                    : FOG_CELL
                } transition-colors duration-150`}
                style={{ minWidth: cellMin }}
              />
            );
          })
        )}
      </div>
    </div>
  );
});
