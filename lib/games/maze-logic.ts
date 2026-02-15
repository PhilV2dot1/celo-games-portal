// ========================================
// MAZE GAME LOGIC
// ========================================

// Cell types
export const WALL = 0;
export const PATH = 1;
export const PLAYER = 2;
export const START = 3;
export const EXIT = 4;

export type CellType = typeof WALL | typeof PATH | typeof PLAYER | typeof START | typeof EXIT;
export type Difficulty = "easy" | "medium" | "hard";
export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export interface Position {
  row: number;
  col: number;
}

export interface DifficultyConfig {
  gridSize: number;
  label: string;
  timeLimit: number;    // seconds (0 = unlimited)
  fogRadius: number;    // cells visible around player (0 = full visibility)
  movingWalls: boolean; // walls shift periodically
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy:   { gridSize: 21, label: "Easy (10×10)",   timeLimit: 120, fogRadius: 0, movingWalls: false },
  medium: { gridSize: 35, label: "Medium (17×17)", timeLimit: 180, fogRadius: 5, movingWalls: false },
  hard:   { gridSize: 51, label: "Hard (25×25)",   timeLimit: 300, fogRadius: 3, movingWalls: true },
};

/** Interval in seconds between wall shifts (Hard mode) */
export const WALL_SHIFT_INTERVAL = 8;

export type MazeGrid = CellType[][];

/**
 * Generate a maze using iterative DFS (Recursive Backtracking)
 * Odd grid sizes ensure clean wall/path pattern
 */
export function generateMaze(gridSize: number): MazeGrid {
  // Fill with walls
  const grid: MazeGrid = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(WALL)
  );

  // Start carving from (1,1)
  grid[1][1] = PATH;
  const stack: Position[] = [{ row: 1, col: 1 }];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(grid, current, gridSize);

    if (neighbors.length > 0) {
      // Pick random neighbor
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];

      // Carve wall between current and neighbor
      const wallRow = current.row + (next.row - current.row) / 2;
      const wallCol = current.col + (next.col - current.col) / 2;
      grid[wallRow][wallCol] = PATH;
      grid[next.row][next.col] = PATH;

      stack.push(next);
    } else {
      stack.pop();
    }
  }

  // Set start and exit
  grid[1][1] = START;
  grid[gridSize - 2][gridSize - 2] = EXIT;

  return grid;
}

/**
 * Get unvisited neighbors 2 cells away (for maze generation)
 */
function getUnvisitedNeighbors(
  grid: MazeGrid,
  pos: Position,
  gridSize: number
): Position[] {
  const directions = [
    { row: -2, col: 0 },
    { row: 2, col: 0 },
    { row: 0, col: -2 },
    { row: 0, col: 2 },
  ];

  return directions
    .map((d) => ({ row: pos.row + d.row, col: pos.col + d.col }))
    .filter(
      (p) =>
        p.row > 0 &&
        p.row < gridSize - 1 &&
        p.col > 0 &&
        p.col < gridSize - 1 &&
        grid[p.row][p.col] === WALL
    );
}

/**
 * Move player in a direction. Returns new state only if move is valid.
 */
export function movePlayer(
  grid: MazeGrid,
  playerPos: Position,
  direction: Direction
): { grid: MazeGrid; newPos: Position; moved: boolean } {
  const deltas: Record<Direction, Position> = {
    UP: { row: -1, col: 0 },
    DOWN: { row: 1, col: 0 },
    LEFT: { row: 0, col: -1 },
    RIGHT: { row: 0, col: 1 },
  };

  const delta = deltas[direction];
  const newRow = playerPos.row + delta.row;
  const newCol = playerPos.col + delta.col;

  // Check bounds
  if (newRow < 0 || newRow >= grid.length || newCol < 0 || newCol >= grid[0].length) {
    return { grid, newPos: playerPos, moved: false };
  }

  // Check if target cell is walkable
  const targetCell = grid[newRow][newCol];
  if (targetCell === WALL) {
    return { grid, newPos: playerPos, moved: false };
  }

  // Move player
  const newGrid = grid.map((row) => [...row]);

  // Restore old cell (START or PATH)
  newGrid[playerPos.row][playerPos.col] =
    playerPos.row === 1 && playerPos.col === 1 ? START : PATH;

  // Place player at new position (unless it's EXIT — keep EXIT visible)
  if (targetCell !== EXIT) {
    newGrid[newRow][newCol] = PLAYER;
  }

  return { grid: newGrid, newPos: { row: newRow, col: newCol }, moved: true };
}

/**
 * Check if player reached the exit
 */
export function checkWin(playerPos: Position, gridSize: number): boolean {
  return playerPos.row === gridSize - 2 && playerPos.col === gridSize - 2;
}

/**
 * Calculate score based on difficulty, moves, time remaining, and difficulty multiplier
 */
export function calculateScore(
  gridSize: number,
  moves: number,
  timeSeconds: number,
  difficulty: Difficulty = 'easy'
): number {
  const navigable = Math.floor(gridSize / 2);
  const optimalMoves = navigable * 2;
  const config = DIFFICULTY_CONFIG[difficulty];

  // Move efficiency: how close to optimal path (40%)
  const moveRatio = Math.max(0, 1 - Math.max(0, moves - optimalMoves) / (optimalMoves * 3));
  const moveScore = moveRatio * 100;

  // Time bonus: based on time remaining vs time limit (40%)
  const timeRemaining = Math.max(0, config.timeLimit - timeSeconds);
  const timeScore = (timeRemaining / config.timeLimit) * 100;

  // Difficulty multiplier (20%)
  const diffMultiplier = difficulty === 'hard' ? 2.0 : difficulty === 'medium' ? 1.5 : 1.0;
  const diffBonus = diffMultiplier * 50;

  return Math.round((moveScore * 0.4) + (timeScore * 0.4) + (diffBonus * 0.2));
}

// ========================================
// FOG OF WAR
// ========================================

/**
 * Get visible cells around the player using BFS limited to fogRadius.
 * Visibility does NOT pass through walls (line-of-sight blocking).
 * Returns a Set of "row,col" strings for fast lookup.
 * If fogRadius is 0, returns null (full visibility).
 */
export function getVisibleCells(
  playerPos: Position,
  grid: MazeGrid,
  fogRadius: number
): Set<string> | null {
  if (fogRadius <= 0) return null; // full visibility

  const visible = new Set<string>();
  const gridSize = grid.length;

  // BFS from player position, limited by fogRadius (Manhattan distance)
  const queue: Array<{ pos: Position; dist: number }> = [{ pos: playerPos, dist: 0 }];
  const visited = new Set<string>();
  visited.add(`${playerPos.row},${playerPos.col}`);
  visible.add(`${playerPos.row},${playerPos.col}`);

  while (queue.length > 0) {
    const { pos, dist } = queue.shift()!;

    if (dist >= fogRadius) continue;

    const neighbors = [
      { row: pos.row - 1, col: pos.col },
      { row: pos.row + 1, col: pos.col },
      { row: pos.row, col: pos.col - 1 },
      { row: pos.row, col: pos.col + 1 },
    ];

    for (const n of neighbors) {
      const key = `${n.row},${n.col}`;
      if (visited.has(key)) continue;
      if (n.row < 0 || n.row >= gridSize || n.col < 0 || n.col >= gridSize) continue;

      visited.add(key);
      visible.add(key); // walls are visible (you can see them) but block further vision

      // Only continue BFS through non-wall cells
      if (grid[n.row][n.col] !== WALL) {
        queue.push({ pos: n, dist: dist + 1 });
      }
    }
  }

  return visible;
}

// ========================================
// MOVING WALLS (Hard mode)
// ========================================

/**
 * BFS to check if a path exists from START to EXIT
 */
function hasPath(grid: MazeGrid): boolean {
  const gridSize = grid.length;
  const start: Position = { row: 1, col: 1 };
  const target: Position = { row: gridSize - 2, col: gridSize - 2 };

  const visited = new Set<string>();
  const queue: Position[] = [start];
  visited.add(`${start.row},${start.col}`);

  while (queue.length > 0) {
    const pos = queue.shift()!;
    if (pos.row === target.row && pos.col === target.col) return true;

    const neighbors = [
      { row: pos.row - 1, col: pos.col },
      { row: pos.row + 1, col: pos.col },
      { row: pos.row, col: pos.col - 1 },
      { row: pos.row, col: pos.col + 1 },
    ];

    for (const n of neighbors) {
      const key = `${n.row},${n.col}`;
      if (visited.has(key)) continue;
      if (n.row < 0 || n.row >= gridSize || n.col < 0 || n.col >= gridSize) continue;
      const cell = grid[n.row][n.col];
      if (cell === WALL) continue;
      visited.add(key);
      queue.push(n);
    }
  }

  return false;
}

/**
 * Shift some walls in the maze. Swaps a few PATH↔WALL cells randomly.
 * Never touches player, START, EXIT, or cells within safeRadius of player.
 * Guarantees the maze remains solvable after mutation.
 */
export function shiftWalls(
  grid: MazeGrid,
  playerPos: Position,
  safeRadius: number = 3
): MazeGrid {
  const gridSize = grid.length;
  const newGrid = grid.map((row) => [...row]);

  // Collect candidate cells for shifting (not on border, not protected)
  const candidates: Position[] = [];
  for (let r = 1; r < gridSize - 1; r++) {
    for (let c = 1; c < gridSize - 1; c++) {
      // Skip player, start, exit
      const cell = newGrid[r][c];
      if (cell === PLAYER || cell === START || cell === EXIT) continue;

      // Skip cells near player
      const dist = Math.abs(r - playerPos.row) + Math.abs(c - playerPos.col);
      if (dist <= safeRadius) continue;

      // Only consider PATH or WALL cells on odd positions (junction cells)
      if (r % 2 === 1 && c % 2 === 1 && (cell === PATH || cell === WALL)) {
        candidates.push({ row: r, col: c });
      }
    }
  }

  // Shuffle and pick a few cells to toggle (3-6 cells)
  const numToShift = Math.min(candidates.length, 3 + Math.floor(Math.random() * 4));
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const toToggle = candidates.slice(0, numToShift);

  for (const pos of toToggle) {
    newGrid[pos.row][pos.col] = newGrid[pos.row][pos.col] === WALL ? PATH : WALL;
  }

  // Verify maze is still solvable; if not, return original grid unchanged
  if (!hasPath(newGrid)) {
    return grid;
  }

  return newGrid;
}
