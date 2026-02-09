"use client";

import { Position } from "@/hooks/useSnake";
import { cn } from "@/lib/utils";

interface SnakeBoardProps {
  snake: Position[];
  food: Position;
  gridSize: number;
}

export function SnakeBoard({ snake, food, gridSize }: SnakeBoardProps) {
  const isSnakeSegment = (x: number, y: number) => {
    return snake.some((segment) => segment.x === x && segment.y === y);
  };

  const isSnakeHead = (x: number, y: number) => {
    return snake[0].x === x && snake[0].y === y;
  };

  const isFood = (x: number, y: number) => {
    return food.x === x && food.y === y;
  };

  const getCellClass = (x: number, y: number) => {
    if (isSnakeHead(x, y)) {
      return "bg-gradient-to-br from-green-600 to-green-700 border-green-800 shadow-lg";
    }
    if (isSnakeSegment(x, y)) {
      return "bg-gradient-to-br from-green-400 to-green-500 border-green-600";
    }
    if (isFood(x, y)) {
      return "bg-gradient-to-br from-red-500 to-red-600 border-red-700 shadow-lg animate-pulse";
    }
    return "bg-gray-100 border-gray-200";
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-4 shadow-2xl border-4 border-chain">
      <div
        className="grid gap-0.5 bg-gray-300 p-0.5 rounded-lg"
        data-testid="snake-board"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          aspectRatio: "1/1",
        }}
      >
        {Array.from({ length: gridSize }).map((_, y) =>
          Array.from({ length: gridSize }).map((_, x) => (
            <div
              key={`${x}-${y}`}
              className={cn(
                "aspect-square rounded-sm border transition-all duration-100",
                getCellClass(x, y)
              )}
            />
          ))
        )}
      </div>
    </div>
  );
}
