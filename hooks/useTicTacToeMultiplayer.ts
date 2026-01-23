/**
 * useTicTacToeMultiplayer Hook
 * Wraps useMultiplayer with Tic-Tac-Toe specific logic
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useMultiplayer } from './useMultiplayer';
import type { TicTacToeState } from '@/lib/multiplayer/types';

type CellValue = 0 | 1 | 2; // 0 = empty, 1 = X (player 1), 2 = O (player 2)
type Board = CellValue[];
type GameResult = 'win' | 'lose' | 'draw' | null;

const INITIAL_BOARD: Board = [0, 0, 0, 0, 0, 0, 0, 0, 0];

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
];

interface UseTicTacToeMultiplayerReturn {
  // Game state
  board: Board;
  isMyTurn: boolean;
  mySymbol: 'X' | 'O' | null;
  opponentSymbol: 'X' | 'O' | null;
  result: GameResult;
  winningLine: number[] | null;

  // Multiplayer state (from useMultiplayer)
  status: string;
  room: ReturnType<typeof useMultiplayer>['room'];
  players: ReturnType<typeof useMultiplayer>['players'];
  myPlayerNumber: number | null;
  opponent: ReturnType<typeof useMultiplayer>['opponent'];
  error: string | null;
  isSearching: boolean;
  isConnected: boolean;
  myStats: ReturnType<typeof useMultiplayer>['myStats'];
  opponentStats: ReturnType<typeof useMultiplayer>['opponentStats'];

  // Actions
  handleMove: (position: number) => Promise<void>;
  findMatch: (mode: 'ranked' | 'casual') => Promise<void>;
  createPrivateRoom: () => Promise<string>;
  joinByCode: (code: string) => Promise<void>;
  setReady: (ready: boolean) => Promise<void>;
  leaveRoom: () => Promise<void>;
  cancelSearch: () => void;
  surrender: () => Promise<void>;
  playAgain: () => void;
}

export function useTicTacToeMultiplayer(): UseTicTacToeMultiplayerReturn {
  const [board, setBoard] = useState<Board>(INITIAL_BOARD);
  const [result, setResult] = useState<GameResult>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  // Initialize multiplayer hook
  const multiplayer = useMultiplayer({
    gameId: 'tictactoe',
    onGameStart: () => {
      console.log('[TTT Multiplayer] Game started');
      // Reset board when game starts
      setBoard(INITIAL_BOARD);
      setResult(null);
      setWinningLine(null);
    },
    onGameEnd: (winnerId, reason) => {
      console.log('[TTT Multiplayer] Game ended:', winnerId, reason);
      // Determine result
      if (reason === 'draw') {
        setResult('draw');
      } else if (winnerId === multiplayer.room?.created_by) {
        // Check if winner is me
        const myId = multiplayer.players.find(p => p.player_number === multiplayer.myPlayerNumber)?.user_id;
        setResult(winnerId === myId ? 'win' : 'lose');
      }
    },
    onOpponentAction: (action) => {
      console.log('[TTT Multiplayer] Opponent action:', action);
      // Opponent move is handled via game state update
    },
    onGameStateUpdate: (state) => {
      console.log('[TTT Multiplayer] Game state update:', state);
      if (state && 'board' in state) {
        const tttState = state as TicTacToeState;
        // Ensure board values are valid CellValues (0, 1, or 2)
        const validBoard = tttState.board.map(cell =>
          (cell === 0 || cell === 1 || cell === 2) ? cell : 0
        ) as Board;
        setBoard(validBoard);

        // Check for game end
        if (tttState.winner !== undefined) {
          if (tttState.winner === 0) {
            setResult('draw');
          } else {
            setResult(tttState.winner === multiplayer.myPlayerNumber ? 'win' : 'lose');
          }
          if (tttState.winningLine) {
            setWinningLine(tttState.winningLine);
          }
        }
      }
    },
  });

  // Computed values
  const mySymbol = multiplayer.myPlayerNumber === 1 ? 'X' : multiplayer.myPlayerNumber === 2 ? 'O' : null;
  const opponentSymbol = mySymbol === 'X' ? 'O' : mySymbol === 'O' ? 'X' : null;

  // Get isMyTurn from game state
  const gameState = multiplayer.gameState as TicTacToeState | null;
  const isMyTurn = gameState?.currentTurn === multiplayer.myPlayerNumber;

  // Check for winner
  const checkWin = useCallback((player: 1 | 2, currentBoard: Board): number[] | null => {
    for (const line of WIN_LINES) {
      if (line.every(i => currentBoard[i] === player)) {
        return line;
      }
    }
    return null;
  }, []);

  // Handle player move
  const handleMove = useCallback(async (position: number) => {
    if (!isMyTurn || board[position] !== 0 || multiplayer.status !== 'playing') {
      console.log('[TTT Multiplayer] Invalid move:', { isMyTurn, cell: board[position], status: multiplayer.status });
      return;
    }

    // Make the move locally first for responsiveness
    const newBoard = [...board] as Board;
    const myValue = multiplayer.myPlayerNumber as 1 | 2;
    newBoard[position] = myValue;
    setBoard(newBoard);

    // Check for win
    const winLine = checkWin(myValue, newBoard);
    const isFull = newBoard.every(c => c !== 0);

    // Determine new game state
    const newGameState: TicTacToeState = {
      board: newBoard,
      currentTurn: myValue === 1 ? 2 : 1, // Switch turns
      winner: winLine ? myValue : (isFull ? 0 : undefined),
      winningLine: winLine || undefined,
    };

    // Send action to server
    await multiplayer.sendAction('move', { position });

    // Update game state
    await multiplayer.updateGameState(newGameState);

    // Update local result if game ended
    if (winLine) {
      setResult('win');
      setWinningLine(winLine);
    } else if (isFull) {
      setResult('draw');
    }
  }, [isMyTurn, board, multiplayer, checkWin]);

  // Play again - reset local state and leave room
  const playAgain = useCallback(() => {
    setBoard(INITIAL_BOARD);
    setResult(null);
    setWinningLine(null);
  }, []);

  return {
    // Game state
    board,
    isMyTurn,
    mySymbol,
    opponentSymbol,
    result,
    winningLine,

    // Multiplayer state
    status: multiplayer.status,
    room: multiplayer.room,
    players: multiplayer.players,
    myPlayerNumber: multiplayer.myPlayerNumber,
    opponent: multiplayer.opponent,
    error: multiplayer.error,
    isSearching: multiplayer.isSearching,
    isConnected: multiplayer.isConnected,
    myStats: multiplayer.myStats,
    opponentStats: multiplayer.opponentStats,

    // Actions
    handleMove,
    findMatch: multiplayer.findMatch,
    createPrivateRoom: multiplayer.createPrivateRoom,
    joinByCode: multiplayer.joinByCode,
    setReady: multiplayer.setReady,
    leaveRoom: multiplayer.leaveRoom,
    cancelSearch: multiplayer.cancelSearch,
    surrender: multiplayer.surrender,
    playAgain,
  };
}

export default useTicTacToeMultiplayer;
