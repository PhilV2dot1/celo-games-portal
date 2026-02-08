/**
 * useYahtzeeMultiplayer Hook
 * Wraps useMultiplayer with Yahtzee-specific logic
 *
 * Yahtzee Multiplayer Flow:
 * 1. Players alternate full turns (roll dice up to 3 times, then score)
 * 2. Each player has their own scorecard (13 categories)
 * 3. After both players complete 13 turns, compare final scores
 * 4. Highest score wins
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useMultiplayer } from './useMultiplayer';
import type { YahtzeeState, YahtzeeScoreCard } from '@/lib/multiplayer/types';
import {
  type CategoryName,
  calculateCategoryScore,
  getFinalScore,
  isGameComplete,
  type ScoreCard,
} from './useYahtzee';

type MatchResult = 'win' | 'lose' | 'draw' | null;

const EMPTY_SCORECARD: YahtzeeScoreCard = {
  ones: null,
  twos: null,
  threes: null,
  fours: null,
  fives: null,
  sixes: null,
  threeOfKind: null,
  fourOfKind: null,
  fullHouse: null,
  smallStraight: null,
  largeStraight: null,
  yahtzee: null,
  chance: null,
};

const INITIAL_STATE: YahtzeeState = {
  currentTurn: 1,
  turnNumber: 1,
  dice: [1, 1, 1, 1, 1],
  heldDice: [false, false, false, false, false],
  rollsRemaining: 3,
  player1ScoreCard: { ...EMPTY_SCORECARD },
  player2ScoreCard: { ...EMPTY_SCORECARD },
  player1FinalScore: null,
  player2FinalScore: null,
  winner: null,
  phase: 'rolling',
};

interface UseYahtzeeMultiplayerReturn {
  // Game state
  dice: number[];
  heldDice: boolean[];
  rollsRemaining: number;
  turnNumber: number;
  isMyTurn: boolean;
  myScoreCard: YahtzeeScoreCard;
  opponentScoreCard: YahtzeeScoreCard;
  myFinalScore: number | null;
  opponentFinalScore: number | null;
  matchResult: MatchResult;
  phase: 'rolling' | 'scoring' | 'finished';

  // Multiplayer state
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
  rollDice: () => Promise<void>;
  toggleHold: (index: number) => void;
  selectCategory: (category: CategoryName) => Promise<void>;
  getPotentialScore: (category: CategoryName) => number;
  findMatch: (mode: 'ranked' | 'casual') => Promise<void>;
  createPrivateRoom: () => Promise<string>;
  joinByCode: (code: string) => Promise<void>;
  setReady: (ready: boolean) => Promise<void>;
  leaveRoom: () => Promise<void>;
  cancelSearch: () => void;
  surrender: () => Promise<void>;
  playAgain: () => void;
}

export function useYahtzeeMultiplayer(): UseYahtzeeMultiplayerReturn {
  const [gameState, setGameState] = useState<YahtzeeState>(INITIAL_STATE);
  const [matchResult, setMatchResult] = useState<MatchResult>(null);

  const multiplayer = useMultiplayer({
    gameId: 'yahtzee',
    onGameStart: () => {
      console.log('[Yahtzee Multiplayer] Game started');
      setGameState(INITIAL_STATE);
      setMatchResult(null);
    },
    onGameEnd: (winnerId, reason) => {
      console.log('[Yahtzee Multiplayer] Game ended:', winnerId, reason);
      if (reason === 'draw') {
        setMatchResult('draw');
      } else if (winnerId) {
        const myId = multiplayer.players.find(p => p.player_number === multiplayer.myPlayerNumber)?.user_id;
        setMatchResult(winnerId === myId ? 'win' : 'lose');
      }
    },
    onOpponentAction: (action) => {
      console.log('[Yahtzee Multiplayer] Opponent action:', action);
    },
    onGameStateUpdate: (state) => {
      console.log('[Yahtzee Multiplayer] Game state update:', state);
      if (state && 'player1ScoreCard' in state) {
        const yState = state as YahtzeeState;

        // Only apply server state when it's NOT our turn (avoid overwriting
        // our local state which is always more up-to-date during our turn)
        setGameState(prev => {
          const isMyTurnNow = prev.currentTurn === multiplayer.myPlayerNumber;
          if (isMyTurnNow && yState.currentTurn === multiplayer.myPlayerNumber) {
            // It's our turn and the server echoed our own update - skip
            return prev;
          }
          return yState;
        });

        if (yState.winner !== null) {
          if (yState.winner === 'draw') {
            setMatchResult('draw');
          } else if (yState.winner === multiplayer.myPlayerNumber) {
            setMatchResult('win');
          } else {
            setMatchResult('lose');
          }
        }
      }
    },
  });

  // Computed values
  const myPlayerNumber = multiplayer.myPlayerNumber;
  const isMyTurn = gameState.currentTurn === myPlayerNumber;
  const myScoreCard = myPlayerNumber === 1 ? gameState.player1ScoreCard : gameState.player2ScoreCard;
  const opponentScoreCard = myPlayerNumber === 1 ? gameState.player2ScoreCard : gameState.player1ScoreCard;
  const myFinalScore = myPlayerNumber === 1 ? gameState.player1FinalScore : gameState.player2FinalScore;
  const opponentFinalScore = myPlayerNumber === 1 ? gameState.player2FinalScore : gameState.player1FinalScore;

  // Roll dice
  const rollDice = useCallback(async () => {
    if (!isMyTurn || multiplayer.status !== 'playing') return;
    if (gameState.rollsRemaining <= 0) return;

    const newDice = gameState.dice.map((die, index) =>
      gameState.heldDice[index] ? die : Math.floor(Math.random() * 6) + 1
    );

    const newState: YahtzeeState = {
      ...gameState,
      dice: newDice,
      rollsRemaining: gameState.rollsRemaining - 1,
      phase: 'rolling',
    };

    setGameState(newState);

    await multiplayer.sendAction('move', {
      type: 'roll',
      dice: newDice,
      rollsRemaining: newState.rollsRemaining,
    });
    await multiplayer.updateGameState(newState);
  }, [isMyTurn, gameState, multiplayer]);

  // Toggle hold on a die
  const toggleHold = useCallback((index: number) => {
    if (!isMyTurn || multiplayer.status !== 'playing') return;
    if (gameState.rollsRemaining === 3) return; // Can't hold before first roll

    const newHeldDice = [...gameState.heldDice];
    newHeldDice[index] = !newHeldDice[index];

    const newState: YahtzeeState = {
      ...gameState,
      heldDice: newHeldDice,
    };

    setGameState(newState);

    // Send hold state to server (non-blocking, no await needed)
    multiplayer.updateGameState(newState);
  }, [isMyTurn, gameState, multiplayer]);

  // Select a scoring category
  const selectCategory = useCallback(async (category: CategoryName) => {
    if (!isMyTurn || multiplayer.status !== 'playing') return;
    if (gameState.rollsRemaining === 3) return; // Must roll at least once

    const currentScoreCard = myPlayerNumber === 1 ? gameState.player1ScoreCard : gameState.player2ScoreCard;
    if (currentScoreCard[category] !== null) return; // Already used

    const score = calculateCategoryScore(category, gameState.dice);

    // Update score card
    const updatedScoreCard: YahtzeeScoreCard = { ...currentScoreCard, [category]: score };

    const newState: YahtzeeState = { ...gameState };

    if (myPlayerNumber === 1) {
      newState.player1ScoreCard = updatedScoreCard;
    } else {
      newState.player2ScoreCard = updatedScoreCard;
    }

    // Check if both players have completed all 13 categories
    const p1Complete = isGameComplete(
      myPlayerNumber === 1 ? updatedScoreCard as ScoreCard : newState.player1ScoreCard as ScoreCard
    );
    const p2Complete = isGameComplete(
      myPlayerNumber === 2 ? updatedScoreCard as ScoreCard : newState.player2ScoreCard as ScoreCard
    );

    if (p1Complete && p2Complete) {
      // Game over - calculate final scores
      const p1Final = getFinalScore(newState.player1ScoreCard as ScoreCard);
      const p2Final = getFinalScore(newState.player2ScoreCard as ScoreCard);

      newState.player1FinalScore = p1Final;
      newState.player2FinalScore = p2Final;
      newState.phase = 'finished';

      if (p1Final > p2Final) {
        newState.winner = 1;
        setMatchResult(myPlayerNumber === 1 ? 'win' : 'lose');
      } else if (p2Final > p1Final) {
        newState.winner = 2;
        setMatchResult(myPlayerNumber === 2 ? 'win' : 'lose');
      } else {
        newState.winner = 'draw';
        setMatchResult('draw');
      }

      // End the room so both clients transition to finished
      // Find winner's user_id for the room record
      const winnerPlayerNumber = newState.winner === 'draw' ? null : newState.winner;
      const winnerPlayer = winnerPlayerNumber
        ? multiplayer.players.find(p => p.player_number === winnerPlayerNumber)
        : null;
      multiplayer.endGame(winnerPlayer?.user_id || null);
    } else {
      // Switch to other player's turn
      newState.currentTurn = gameState.currentTurn === 1 ? 2 : 1;

      // If switching player, increment turn number when player 2 finishes
      // (both players play one turn per "round")
      if (gameState.currentTurn === 2) {
        newState.turnNumber = gameState.turnNumber + 1;
      }

      // Reset dice for next player
      newState.dice = [1, 1, 1, 1, 1];
      newState.heldDice = [false, false, false, false, false];
      newState.rollsRemaining = 3;
      newState.phase = 'rolling';
    }

    setGameState(newState);

    await multiplayer.sendAction('move', {
      type: 'score',
      category,
      score,
    });
    await multiplayer.updateGameState(newState);
  }, [isMyTurn, gameState, myPlayerNumber, multiplayer]);

  // Get potential score for a category (preview)
  const getPotentialScore = useCallback((category: CategoryName): number => {
    if (myScoreCard[category] !== null) {
      return myScoreCard[category]!;
    }
    if (gameState.rollsRemaining === 3) return 0; // Haven't rolled yet
    return calculateCategoryScore(category, gameState.dice);
  }, [myScoreCard, gameState.dice, gameState.rollsRemaining]);

  // Play again
  const playAgain = useCallback(() => {
    setGameState(INITIAL_STATE);
    setMatchResult(null);
  }, []);

  return {
    // Game state
    dice: gameState.dice,
    heldDice: gameState.heldDice,
    rollsRemaining: gameState.rollsRemaining,
    turnNumber: gameState.turnNumber,
    isMyTurn,
    myScoreCard,
    opponentScoreCard,
    myFinalScore,
    opponentFinalScore,
    matchResult,
    phase: gameState.phase,

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
    rollDice,
    toggleHold,
    selectCategory,
    getPotentialScore,
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

export default useYahtzeeMultiplayer;
