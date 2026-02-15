// ========================================
// TETRIS GAME LOGIC
// ========================================

// Grid dimensions
export const COLS = 10;
export const ROWS = 20;

// Cell value: 0 = empty, or tetromino type letter
export type CellColor = 0 | 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type Grid = CellColor[][];
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Piece {
  shape: boolean[][];
  type: TetrominoType;
  row: number;
  col: number;
}

// ========================================
// TETROMINOES — Standard shapes
// ========================================

const SHAPES: Record<TetrominoType, boolean[][]> = {
  I: [
    [false, false, false, false],
    [true,  true,  true,  true],
    [false, false, false, false],
    [false, false, false, false],
  ],
  O: [
    [true, true],
    [true, true],
  ],
  T: [
    [false, true, false],
    [true,  true, true],
    [false, false, false],
  ],
  S: [
    [false, true, true],
    [true,  true, false],
    [false, false, false],
  ],
  Z: [
    [true, true,  false],
    [false, true, true],
    [false, false, false],
  ],
  J: [
    [true,  false, false],
    [true,  true,  true],
    [false, false, false],
  ],
  L: [
    [false, false, true],
    [true,  true,  true],
    [false, false, false],
  ],
};

// Piece colors for rendering (Tailwind classes)
export const PIECE_COLORS: Record<TetrominoType, string> = {
  I: 'bg-cyan-400',
  O: 'bg-yellow-400',
  T: 'bg-purple-500',
  S: 'bg-green-500',
  Z: 'bg-red-500',
  J: 'bg-blue-600',
  L: 'bg-orange-500',
};

// Ghost piece color
export const GHOST_COLOR = 'bg-gray-400/30 dark:bg-gray-500/30';

const TETROMINO_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// ========================================
// GRID
// ========================================

export function createEmptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// ========================================
// PIECE CREATION & BAG RANDOMIZER
// ========================================

export function createPiece(type: TetrominoType): Piece {
  const shape = SHAPES[type].map(row => [...row]);
  // Center piece horizontally
  const col = Math.floor((COLS - shape[0].length) / 2);
  return { shape, type, row: 0, col };
}

/**
 * 7-bag randomizer: shuffle all 7 types, deal one at a time.
 * When bag is empty, refill and reshuffle.
 */
let bag: TetrominoType[] = [];

export function getRandomPiece(): Piece {
  if (bag.length === 0) {
    bag = [...TETROMINO_TYPES];
    // Fisher-Yates shuffle
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  }
  return createPiece(bag.pop()!);
}

export function resetBag(): void {
  bag = [];
}

// ========================================
// ROTATION
// ========================================

/** Rotate piece clockwise: transpose then reverse each row */
export function rotateCW(piece: Piece): Piece {
  const { shape } = piece;
  const n = shape.length;
  const rotated: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      rotated[c][n - 1 - r] = shape[r][c];
    }
  }
  return { ...piece, shape: rotated };
}

// ========================================
// COLLISION DETECTION
// ========================================

export function isValidPosition(grid: Grid, piece: Piece): boolean {
  const { shape, row, col } = piece;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const newRow = row + r;
      const newCol = col + c;
      // Out of bounds
      if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) return false;
      // Collision with placed cells
      if (grid[newRow][newCol] !== 0) return false;
    }
  }
  return true;
}

// ========================================
// PLACE PIECE
// ========================================

export function placePiece(grid: Grid, piece: Piece): Grid {
  const newGrid = grid.map(row => [...row]);
  const { shape, type, row, col } = piece;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const gr = row + r;
      const gc = col + c;
      if (gr >= 0 && gr < ROWS && gc >= 0 && gc < COLS) {
        newGrid[gr][gc] = type;
      }
    }
  }
  return newGrid;
}

// ========================================
// LINE CLEARING
// ========================================

export function clearLines(grid: Grid): { grid: Grid; linesCleared: number } {
  const newGrid = grid.filter(row => row.some(cell => cell === 0));
  const linesCleared = ROWS - newGrid.length;
  // Add empty rows at top
  while (newGrid.length < ROWS) {
    newGrid.unshift(Array(COLS).fill(0));
  }
  return { grid: newGrid, linesCleared };
}

// ========================================
// GHOST PIECE (drop preview)
// ========================================

/** Returns the row where the piece would land if hard-dropped */
export function getGhostRow(grid: Grid, piece: Piece): number {
  let testRow = piece.row;
  while (isValidPosition(grid, { ...piece, row: testRow + 1 })) {
    testRow++;
  }
  return testRow;
}

// ========================================
// SCORING
// ========================================

/** Standard Tetris scoring:
 * 1 line = 100 × level
 * 2 lines = 300 × level
 * 3 lines = 500 × level
 * 4 lines (Tetris) = 800 × level
 */
const LINE_SCORES = [0, 100, 300, 500, 800];

export function calculateLineScore(linesCleared: number, level: number): number {
  if (linesCleared < 1 || linesCleared > 4) return 0;
  return LINE_SCORES[linesCleared] * level;
}

// ========================================
// LEVEL & SPEED
// ========================================

export function getLevel(totalLines: number): number {
  return Math.floor(totalLines / 10) + 1;
}

/** Drop interval in ms. Starts at 1000ms, decreases by 80ms per level, min 100ms */
export function getSpeed(level: number): number {
  return Math.max(100, 1000 - (level - 1) * 80);
}

// ========================================
// GAME OVER CHECK
// ========================================

/** Game is over if a new piece can't be placed at spawn */
export function isGameOver(grid: Grid, piece: Piece): boolean {
  return !isValidPosition(grid, piece);
}
