import { useState, useCallback, useEffect, useRef } from "react";
import {
  type Card,
  type Difficulty,
  DIFFICULTY_CONFIG,
  generateBoard,
  checkMatch,
  isBoardComplete,
  calculateScore,
} from "@/lib/games/memory-logic";

// ========================================
// TYPES
// ========================================

export type GameMode = "free" | "onchain";
export type GameStatus = "idle" | "playing" | "processing" | "finished";
export type GameResult = "win" | null;

export interface PlayerStats {
  games: number;
  wins: number;
  bestTimes: {
    easy: number | null;
    medium: number | null;
    hard: number | null;
  };
  bestMoves: {
    easy: number | null;
    medium: number | null;
    hard: number | null;
  };
}

// ========================================
// CONSTANTS
// ========================================

const STATS_KEY = "memory_stats";
const FLIP_DELAY = 800; // ms before unmatched cards flip back

const DEFAULT_STATS: PlayerStats = {
  games: 0,
  wins: 0,
  bestTimes: { easy: null, medium: null, hard: null },
  bestMoves: { easy: null, medium: null, hard: null },
};

// ========================================
// HOOK
// ========================================

export function useMemory() {
  // Game state
  const [board, setBoard] = useState<Card[]>([]);
  const [mode, setMode] = useState<GameMode>("free");
  const [status, setStatus] = useState<GameStatus>("idle");
  const [result, setResult] = useState<GameResult>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [message, setMessage] = useState("Click Start to begin!");

  // Game tracking
  const [moves, setMoves] = useState(0);
  const [pairsFound, setPairsFound] = useState(0);
  const [timer, setTimer] = useState(0);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  // Stats
  const [stats, setStats] = useState<PlayerStats>(DEFAULT_STATS);

  // Timer ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Load stats from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STATS_KEY);
      if (saved) setStats(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // Save stats to localStorage
  const saveStats = useCallback((newStats: PlayerStats) => {
    setStats(newStats);
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    } catch { /* ignore */ }
  }, []);

  // Timer management
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  // Start a new game
  const startGame = useCallback(() => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const newBoard = generateBoard(config.pairs);
    setBoard(newBoard);
    setStatus("playing");
    setResult(null);
    setMoves(0);
    setPairsFound(0);
    setTimer(0);
    setSelectedCards([]);
    setIsChecking(false);
    setMessage("");
    startTimer();
  }, [difficulty, startTimer]);

  // Handle card flip
  const flipCard = useCallback((cardIndex: number) => {
    if (status !== "playing" || isChecking) return;

    const card = board[cardIndex];
    if (!card || card.isFlipped || card.isMatched) return;
    if (selectedCards.length >= 2) return;

    // Flip the card
    const newBoard = [...board];
    newBoard[cardIndex] = { ...card, isFlipped: true };
    setBoard(newBoard);

    const newSelected = [...selectedCards, cardIndex];
    setSelectedCards(newSelected);

    // If this is the second card, check for match
    if (newSelected.length === 2) {
      setIsChecking(true);
      setMoves((prev) => prev + 1);

      const card1 = newBoard[newSelected[0]];
      const card2 = newBoard[newSelected[1]];

      if (checkMatch(card1, card2)) {
        // Match found!
        const matchedBoard = [...newBoard];
        matchedBoard[newSelected[0]] = { ...card1, isMatched: true };
        matchedBoard[newSelected[1]] = { ...card2, isMatched: true };
        setBoard(matchedBoard);
        setPairsFound((prev) => prev + 1);
        setSelectedCards([]);
        setIsChecking(false);

        // Check if game is complete
        if (isBoardComplete(matchedBoard)) {
          stopTimer();
          const finalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const finalMoves = moves + 1;
          setStatus("finished");
          setResult("win");
          const score = calculateScore(DIFFICULTY_CONFIG[difficulty].pairs, finalMoves, finalTime);
          setMessage(`🎉 Congratulations! Score: ${score}`);

          // Update stats
          const newStats = { ...stats };
          newStats.games += 1;
          newStats.wins += 1;
          if (!newStats.bestTimes[difficulty] || finalTime < newStats.bestTimes[difficulty]!) {
            newStats.bestTimes[difficulty] = finalTime;
          }
          if (!newStats.bestMoves[difficulty] || finalMoves < newStats.bestMoves[difficulty]!) {
            newStats.bestMoves[difficulty] = finalMoves;
          }
          saveStats(newStats);
        }
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          const resetBoard = [...newBoard];
          resetBoard[newSelected[0]] = { ...resetBoard[newSelected[0]], isFlipped: false };
          resetBoard[newSelected[1]] = { ...resetBoard[newSelected[1]], isFlipped: false };
          setBoard(resetBoard);
          setSelectedCards([]);
          setIsChecking(false);
        }, FLIP_DELAY);
      }
    }
  }, [status, isChecking, board, selectedCards, moves, difficulty, stats, stopTimer, saveStats]);

  // Reset game
  const resetGame = useCallback(() => {
    stopTimer();
    setBoard([]);
    setStatus("idle");
    setResult(null);
    setMoves(0);
    setPairsFound(0);
    setTimer(0);
    setSelectedCards([]);
    setIsChecking(false);
    setMessage("Click Start to begin!");
  }, [stopTimer]);

  // Switch mode
  const switchMode = useCallback((newMode: GameMode) => {
    if (status === "playing") return;
    setMode(newMode);
  }, [status]);

  // Change difficulty
  const changeDifficulty = useCallback((newDifficulty: Difficulty) => {
    if (status === "playing") return;
    setDifficulty(newDifficulty);
  }, [status]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    // State
    board,
    mode,
    status,
    result,
    difficulty,
    message,
    moves,
    pairsFound,
    timer,
    stats,
    isChecking,
    totalPairs: DIFFICULTY_CONFIG[difficulty].pairs,

    // Actions
    startGame,
    flipCard,
    resetGame,
    switchMode,
    changeDifficulty,
    formatTime,
  };
}

export { DIFFICULTY_CONFIG, type Difficulty } from "@/lib/games/memory-logic";
