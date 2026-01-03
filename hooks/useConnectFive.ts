/**
 * useConnectFive Hook
 * Game logic for Connect Five (Connect Four)
 * 7 columns × 6 rows grid
 */

import { useState, useCallback, useRef } from 'react';

// ========================================
// TYPES
// ========================================

export type Player = 1 | 2;
export type Cell = Player | null;
export type Board = Cell[][];
export type GameStatus = 'playing' | 'won' | 'draw';

export interface WinningLine {
  positions: [number, number][];
  player: Player;
}

export interface ConnectFiveState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  winningLine: WinningLine | null;
  moveCount: number;
}

// ========================================
// CONSTANTS
// ========================================

export const ROWS = 6;
export const COLS = 7;
export const WIN_LENGTH = 4;

// ========================================
// UTILITIES
// ========================================

/**
 * Create empty board
 */
function createEmptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

/**
 * Check if a column is full
 */
function isColumnFull(board: Board, col: number): boolean {
  return board[0][col] !== null;
}

/**
 * Get the row where a piece would land in a column
 */
function getDropRow(board: Board, col: number): number {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === null) {
      return row;
    }
  }
  return -1;
}

/**
 * Check for win starting from a position
 */
function checkWinFromPosition(
  board: Board,
  row: number,
  col: number,
  player: Player
): WinningLine | null {
  // Directions: horizontal, vertical, diagonal /, diagonal \
  const directions = [
    [0, 1],  // horizontal
    [1, 0],  // vertical
    [1, 1],  // diagonal \
    [1, -1], // diagonal /
  ];

  for (const [dx, dy] of directions) {
    let count = 1; // Start with the current piece
    const positions: [number, number][] = [[row, col]];

    // Check in positive direction
    for (let i = 1; i < WIN_LENGTH; i++) {
      const newRow = row + i * dx;
      const newCol = col + i * dy;

      if (
        newRow >= 0 &&
        newRow < ROWS &&
        newCol >= 0 &&
        newCol < COLS &&
        board[newRow][newCol] === player
      ) {
        count++;
        positions.push([newRow, newCol]);
      } else {
        break;
      }
    }

    // Check in negative direction
    for (let i = 1; i < WIN_LENGTH; i++) {
      const newRow = row - i * dx;
      const newCol = col - i * dy;

      if (
        newRow >= 0 &&
        newRow < ROWS &&
        newCol >= 0 &&
        newCol < COLS &&
        board[newRow][newCol] === player
      ) {
        count++;
        positions.unshift([newRow, newCol]);
      } else {
        break;
      }
    }

    // Check if we have a win
    if (count >= WIN_LENGTH) {
      // Sort positions and return only the first WIN_LENGTH positions
      return { positions: positions.slice(0, WIN_LENGTH), player };
    }
  }

  return null;
}

/**
 * Check if board is full (draw)
 */
function isBoardFull(board: Board): boolean {
  return board[0].every(cell => cell !== null);
}

// ========================================
// HOOK
// ========================================

export function useConnectFive() {
  const [state, setState] = useState<ConnectFiveState>({
    board: createEmptyBoard(),
    currentPlayer: 1,
    status: 'playing',
    winner: null,
    winningLine: null,
    moveCount: 0,
  });

  const dropSuccessRef = useRef(false);

  /**
   * Drop a piece in a column
   */
  const dropPiece = useCallback((col: number): boolean => {
    dropSuccessRef.current = false;

    setState(prevState => {
      // Can't play if game is over
      if (prevState.status !== 'playing') {
        return prevState;
      }

      // Check if column is valid and not full
      if (col < 0 || col >= COLS || isColumnFull(prevState.board, col)) {
        return prevState;
      }

      // Get the row where piece will land
      const row = getDropRow(prevState.board, col);
      if (row === -1) {
        return prevState;
      }

      // Create new board with the piece
      const newBoard = prevState.board.map(r => [...r]);
      newBoard[row][col] = prevState.currentPlayer;

      // Mark as successful
      dropSuccessRef.current = true;

      // Check for win
      const winningLine = checkWinFromPosition(newBoard, row, col, prevState.currentPlayer);

      if (winningLine) {
        return {
          board: newBoard,
          currentPlayer: prevState.currentPlayer,
          status: 'won' as GameStatus,
          winner: prevState.currentPlayer,
          winningLine,
          moveCount: prevState.moveCount + 1,
        };
      }

      // Check for draw
      if (isBoardFull(newBoard)) {
        return {
          board: newBoard,
          currentPlayer: prevState.currentPlayer,
          status: 'draw' as GameStatus,
          winner: null,
          winningLine: null,
          moveCount: prevState.moveCount + 1,
        };
      }

      // Continue game with next player
      return {
        board: newBoard,
        currentPlayer: (prevState.currentPlayer === 1 ? 2 : 1) as Player,
        status: 'playing' as GameStatus,
        winner: null,
        winningLine: null,
        moveCount: prevState.moveCount + 1,
      };
    });

    return dropSuccessRef.current;
  }, []);

  /**
   * Reset the game
   */
  const reset = useCallback(() => {
    setState({
      board: createEmptyBoard(),
      currentPlayer: 1,
      status: 'playing',
      winner: null,
      winningLine: null,
      moveCount: 0,
    });
  }, []);

  /**
   * Check if a column is playable
   */
  const isColumnPlayable = useCallback((col: number): boolean => {
    if (state.status !== 'playing') {
      return false;
    }
    if (col < 0 || col >= COLS) {
      return false;
    }
    return !isColumnFull(state.board, col);
  }, [state]);

  return {
    ...state,
    dropPiece,
    reset,
    isColumnPlayable,
  };
}

export type UseConnectFiveReturn = ReturnType<typeof useConnectFive>;
