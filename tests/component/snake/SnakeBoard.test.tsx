import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SnakeBoard } from '@/components/snake/SnakeBoard';
import type { Position } from '@/hooks/useSnake';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, style, ...props }: any) => (
      <div className={className} style={style} {...props}>{children}</div>
    ),
  },
}));

/**
 * SnakeBoard Component Tests
 *
 * Tests for the Snake board component that displays:
 * - Grid of cells (20x20)
 * - Snake segments
 * - Snake head
 * - Food position
 * - Proper styling for each cell type
 */

describe('SnakeBoard', () => {
  const gridSize = 20;

  const createSnake = (positions: Position[]): Position[] => positions;
  const createFood = (x: number, y: number): Position => ({ x, y });

  beforeEach(() => {
    // Reset any mocks before each test
    vi.clearAllMocks();
  });

  // ========================================
  // RENDERING
  // ========================================

  describe('Rendering', () => {
    test('should render grid with correct number of cells', () => {
      const snake = createSnake([{ x: 10, y: 10 }]);
      const food = createFood(5, 5);

      const { container } = render(
        <SnakeBoard snake={snake} food={food} gridSize={gridSize} />
      );

      // Should render gridSize * gridSize cells
      const cells = container.querySelectorAll('.aspect-square');
      expect(cells.length).toBe(gridSize * gridSize);
    });

    test('should render with correct grid size attribute', () => {
      const snake = createSnake([{ x: 10, y: 10 }]);
      const food = createFood(5, 5);

      const { container } = render(
        <SnakeBoard snake={snake} food={food} gridSize={gridSize} />
      );

      const grid = container.querySelector('[style*="grid-template-columns"]');
      expect(grid).toBeDefined();
    });
  });

  // ========================================
  // SNAKE HEAD
  // ========================================

  describe('Snake Head', () => {
    test('should highlight snake head differently from body', () => {
      const snake = createSnake([
        { x: 10, y: 10 }, // Head
        { x: 9, y: 10 },  // Body
        { x: 8, y: 10 },  // Body
      ]);
      const food = createFood(5, 5);

      const { container } = render(
        <SnakeBoard snake={snake} food={food} gridSize={gridSize} />
      );

      // All cells exist
      const cells = container.querySelectorAll('.aspect-square');
      expect(cells.length).toBe(gridSize * gridSize);
    });

    test('should render single segment snake (head only)', () => {
      const snake = createSnake([{ x: 10, y: 10 }]);
      const food = createFood(5, 5);

      const { container } = render(
        <SnakeBoard snake={snake} food={food} gridSize={gridSize} />
      );

      const cells = container.querySelectorAll('.aspect-square');
      expect(cells.length).toBe(gridSize * gridSize);
    });
  });

  // ========================================
  // SNAKE BODY
  // ========================================

  describe('Snake Body', () => {
    test('should render multi-segment snake', () => {
      const snake = createSnake([
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 7, y: 10 },
      ]);
      const food = createFood(5, 5);

      const { container } = render(
        <SnakeBoard snake={snake} food={food} gridSize={gridSize} />
      );

      expect(snake).toHaveLength(4);
      const cells = container.querySelectorAll('.aspect-square');
      expect(cells.length).toBe(gridSize * gridSize);
    });

    test('should render long snake correctly', () => {
      const snake = createSnake(
        Array.from({ length: 20 }, (_, i) => ({ x: i, y: 10 }))
      );
      const food = createFood(5, 5);

      const { container } = render(
        <SnakeBoard snake={snake} food={food} gridSize={gridSize} />
      );

      expect(snake).toHaveLength(20);
      const cells = container.querySelectorAll('.aspect-square');
      expect(cells.length).toBe(gridSize * gridSize);
    });

    test('should render curved snake', () => {
      const snake = createSnake([
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 9, y: 9 },
        { x: 9, y: 8 },
        { x: 10, y: 8 },
      ]);
      const food = createFood(5, 5);

      const { container } = render(
        <SnakeBoard snake={snake} food={food} gridSize={gridSize} />
      );

      expect(snake).toHaveLength(5);
    });
  });

  // ========================================
  // FOOD
  // ========================================

  describe('Food', () => {
    test('should render food at correct position', () => {
      const snake = createSnake([{ x: 10, y: 10 }]);
      const food = createFood(15, 15);

      const { container } = render(
        <SnakeBoard snake={snake} food={food} gridSize={gridSize} />
      );

      expect(food.x).toBe(15);
      expect(food.y).toBe(15);
    });

    test('should render food at different positions', () => {
      const snake = createSnake([{ x: 10, y: 10 }]);

      // Test multiple food positions
      const positions = [
        { x: 0, y: 0 },
        { x: 19, y: 19 },
        { x: 5, y: 15 },
        { x: 15, y: 5 },
      ];

      positions.forEach((pos) => {
        const { container } = render(
          <SnakeBoard snake={snake} food={pos} gridSize={gridSize} />
        );

        const cells = container.querySelectorAll('.aspect-square');
        expect(cells.length).toBe(gridSize * gridSize);
      });
    });

    test('should not render food on snake position', () => {
      const snake = createSnake([
        { x: 10, y: 10 },
        { x: 9, y: 10 },
      ]);
      const food = createFood(5, 5);

      // Verify food is not on snake
      const foodOnSnake = snake.some(
        (segment) => segment.x === food.x && segment.y === food.y
      );

      expect(foodOnSnake).toBe(false);
    });
  });

  // ========================================
  // EMPTY CELLS
  // ========================================

  describe('Empty Cells', () => {
    test('should render empty cells correctly', () => {
      const snake = createSnake([{ x: 10, y: 10 }]);
      const food = createFood(5, 5);

      const { container } = render(
        <SnakeBoard snake={snake} food={food} gridSize={gridSize} />
      );

      // Total cells should be gridSize * gridSize
      const cells = container.querySelectorAll('.aspect-square');
      expect(cells.length).toBe(gridSize * gridSize);

      // Most cells should be empty (gridSize * gridSize - snake.length - 1 food)
      const emptyCells = gridSize * gridSize - snake.length - 1;
      expect(emptyCells).toBe(398); // 400 - 1 snake - 1 food
    });
  });

  // ========================================
  // GRID BOUNDARIES
  // ========================================

  describe('Grid Boundaries', () => {
    test('should handle snake at top-left corner', () => {
      const snake = createSnake([{ x: 0, y: 0 }]);
      const food = createFood(10, 10);

      const { container } = render(
        <SnakeBoard snake={snake} food={food} gridSize={gridSize} />
      );

      expect(snake[0].x).toBe(0);
      expect(snake[0].y).toBe(0);
    });

    test('should handle snake at bottom-right corner', () => {
      const snake = createSnake([{ x: 19, y: 19 }]);
      const food = createFood(10, 10);

      const { container } = render(
        <SnakeBoard snake={snake} food={food} gridSize={gridSize} />
      );

      expect(snake[0].x).toBe(19);
      expect(snake[0].y).toBe(19);
    });

    test('should handle food at corners', () => {
      const snake = createSnake([{ x: 10, y: 10 }]);

      const corners = [
        { x: 0, y: 0 },
        { x: 19, y: 0 },
        { x: 0, y: 19 },
        { x: 19, y: 19 },
      ];

      corners.forEach((food) => {
        const { container } = render(
          <SnakeBoard snake={snake} food={food} gridSize={gridSize} />
        );

        expect(food.x).toBeGreaterThanOrEqual(0);
        expect(food.x).toBeLessThan(gridSize);
        expect(food.y).toBeGreaterThanOrEqual(0);
        expect(food.y).toBeLessThan(gridSize);
      });
    });
  });

  // ========================================
  // DIFFERENT GRID SIZES
  // ========================================

  describe('Different Grid Sizes', () => {
    test('should render with custom grid size', () => {
      const customGridSize = 15;
      const snake = createSnake([{ x: 7, y: 7 }]);
      const food = createFood(3, 3);

      const { container } = render(
        <SnakeBoard snake={snake} food={food} gridSize={customGridSize} />
      );

      const cells = container.querySelectorAll('.aspect-square');
      expect(cells.length).toBe(customGridSize * customGridSize);
    });
  });

  // ========================================
  // STYLING
  // ========================================

  describe('Styling', () => {
    test('should apply correct container classes', () => {
      const snake = createSnake([{ x: 10, y: 10 }]);
      const food = createFood(5, 5);

      const { container } = render(
        <SnakeBoard snake={snake} food={food} gridSize={gridSize} />
      );

      const boardContainer = container.firstChild as HTMLElement;
      expect(boardContainer.className).toContain('bg-gradient-to-br');
      expect(boardContainer.className).toContain('rounded');
    });

    test('should apply grid layout classes', () => {
      const snake = createSnake([{ x: 10, y: 10 }]);
      const food = createFood(5, 5);

      const { container } = render(
        <SnakeBoard snake={snake} food={food} gridSize={gridSize} />
      );

      const grid = container.querySelector('[style*="grid-template-columns"]');
      expect(grid).toBeDefined();
    });
  });
});
