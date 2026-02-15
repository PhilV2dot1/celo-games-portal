"use client";

import { memo } from "react";
import {
  type Grid,
  type Piece,
  COLS,
  ROWS,
  PIECE_COLORS,
  GHOST_COLOR,
} from "@/lib/games/tetris-logic";

interface TetrisBoardProps {
  grid: Grid;
  currentPiece: Piece | null;
  ghostRow: number | null;
}

export const TetrisBoard = memo(function TetrisBoard({
  grid,
  currentPiece,
  ghostRow,
}: TetrisBoardProps) {
  // Build display grid: merge placed cells + ghost + current piece
  const displayGrid: string[][] = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => {
      const cell = grid[r][c];
      if (cell !== 0) return PIECE_COLORS[cell];
      return "";
    })
  );

  // Render ghost piece
  if (currentPiece && ghostRow !== null && ghostRow !== currentPiece.row) {
    const { shape } = currentPiece;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const gr = ghostRow + r;
        const gc = currentPiece.col + c;
        if (gr >= 0 && gr < ROWS && gc >= 0 && gc < COLS && !displayGrid[gr][gc]) {
          displayGrid[gr][gc] = GHOST_COLOR;
        }
      }
    }
  }

  // Render current piece
  if (currentPiece) {
    const { shape, type, row, col } = currentPiece;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const gr = row + r;
        const gc = col + c;
        if (gr >= 0 && gr < ROWS && gc >= 0 && gc < COLS) {
          displayGrid[gr][gc] = PIECE_COLORS[type];
        }
      }
    }
  }

  return (
    <div
      data-testid="tetris-board"
      className="bg-gray-900 dark:bg-gray-950 rounded-xl p-1 shadow-xl border-2 border-gray-700 dark:border-gray-600"
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: "1px",
        }}
      >
        {displayGrid.flatMap((row, rowIdx) =>
          row.map((cellColor, colIdx) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              className={`aspect-square rounded-[2px] ${
                cellColor || "bg-gray-800/50 dark:bg-gray-800/30"
              }`}
              style={{ minWidth: "16px" }}
            />
          ))
        )}
      </div>
    </div>
  );
});
