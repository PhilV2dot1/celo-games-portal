"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { getContractAddress } from "@/lib/contracts/addresses";
import { TETRIS_CONTRACT_ABI } from "@/lib/contracts/tetris-abi";
import {
  type Grid,
  type Piece,
  COLS,
  ROWS,
  createEmptyGrid,
  getRandomPiece,
  resetBag,
  rotateCW,
  isValidPosition,
  placePiece,
  clearLines,
  getGhostRow,
  calculateLineScore,
  getLevel,
  getSpeed,
  isGameOver,
} from "@/lib/games/tetris-logic";

// ========================================
// TYPES
// ========================================

export type GameMode = "free" | "onchain";
export type GameStatus = "idle" | "playing" | "processing" | "finished";
export type GameResult = "win" | "lose" | null;

export interface PlayerStats {
  games: number;
  wins: number;
  bestScore: number;
  totalLines: number;
  highestLevel: number;
}

const DEFAULT_STATS: PlayerStats = {
  games: 0,
  wins: 0,
  bestScore: 0,
  totalLines: 0,
  highestLevel: 0,
};

const STATS_KEY = "tetris_stats";
const WIN_THRESHOLD = 10000;

// ========================================
// HOOK
// ========================================

export function useTetris() {
  // Game state
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<Piece | null>(null);
  const [holdPiece, setHoldPiece] = useState<Piece | null>(null);
  const [canHold, setCanHold] = useState(true);

  // Score state
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);

  // Game status
  const [mode, setMode] = useState<GameMode>("free");
  const [status, setStatus] = useState<GameStatus>("idle");
  const [result, setResult] = useState<GameResult>(null);
  const [message, setMessage] = useState("Click Start to begin!");
  const [gameStartedOnChain, setGameStartedOnChain] = useState(false);

  // Timer
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Game loop ref
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs to avoid stale closures in game loop
  const gridRef = useRef(grid);
  const currentPieceRef = useRef(currentPiece);
  const scoreRef = useRef(score);
  const linesRef = useRef(lines);
  const levelRef = useRef(level);
  const statusRef = useRef(status);

  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { currentPieceRef.current = currentPiece; }, [currentPiece]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { linesRef.current = lines; }, [lines]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { statusRef.current = status; }, [status]);

  // Stats
  const [stats, setStats] = useState<PlayerStats>(DEFAULT_STATS);

  // Wagmi hooks
  const { address, isConnected, chain } = useAccount();
  const contractAddress = getContractAddress("tetris", chain?.id);

  const { writeContractAsync, isPending } = useWriteContract();
  const { refetch: refetchStats } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TETRIS_CONTRACT_ABI,
    functionName: "getPlayerStats",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!contractAddress },
  });

  // Load stats from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STATS_KEY);
      if (saved) setStats(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const saveStats = useCallback((newStats: PlayerStats) => {
    setStats(newStats);
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    } catch { /* ignore */ }
  }, []);

  // Format time
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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

  // Stop game loop
  const stopGameLoop = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      stopGameLoop();
    };
  }, [stopTimer, stopGameLoop]);

  // End game logic
  const endGame = useCallback(async (finalScore: number, finalLines: number, finalLevel: number, won: boolean) => {
    if (mode === "free") {
      const newStats = { ...stats };
      newStats.games += 1;
      if (won) newStats.wins += 1;
      if (finalScore > newStats.bestScore) newStats.bestScore = finalScore;
      newStats.totalLines += finalLines;
      if (finalLevel > newStats.highestLevel) newStats.highestLevel = finalLevel;
      saveStats(newStats);
      setMessage(won ? `Congratulations! Score: ${finalScore}` : `Game Over! Score: ${finalScore}`);
    } else {
      if (!gameStartedOnChain) {
        setMessage(won ? `Congratulations! Score: ${finalScore}` : `Game Over! Score: ${finalScore}`);
        return;
      }
      try {
        setStatus("processing");
        setMessage("Recording score on blockchain...");
        await writeContractAsync({
          address: contractAddress!,
          abi: TETRIS_CONTRACT_ABI,
          functionName: "endGame",
          args: [BigInt(finalScore), BigInt(finalLines), BigInt(finalLevel)],
        });
        setGameStartedOnChain(false);
        await refetchStats();
        setMessage(`Score: ${finalScore} - recorded on blockchain!`);
        setStatus("finished");
      } catch (error) {
        console.error("Failed to record result:", error);
        setMessage("Game finished but not recorded on-chain");
        setGameStartedOnChain(false);
        setStatus("finished");
      }
    }
  }, [mode, stats, saveStats, gameStartedOnChain, writeContractAsync, contractAddress, refetchStats]);

  // Spawn next piece — returns false if game over
  const spawnPiece = useCallback(() => {
    const next = nextPiece || getRandomPiece();
    const newNext = getRandomPiece();

    if (isGameOver(gridRef.current, next)) {
      // Game over
      stopGameLoop();
      stopTimer();
      const finalScore = scoreRef.current;
      const finalLines = linesRef.current;
      const finalLevel = levelRef.current;
      const won = finalScore >= WIN_THRESHOLD;
      setStatus("finished");
      setResult(won ? "win" : "lose");
      endGame(finalScore, finalLines, finalLevel, won);
      return false;
    }

    setCurrentPiece(next);
    setNextPiece(newNext);
    setCanHold(true);
    return true;
  }, [nextPiece, stopGameLoop, stopTimer, endGame]);

  // Lock piece and process line clears
  const lockPiece = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece) return;

    const newGrid = placePiece(gridRef.current, piece);
    const { grid: clearedGrid, linesCleared } = clearLines(newGrid);

    setGrid(clearedGrid);

    if (linesCleared > 0) {
      const newLines = linesRef.current + linesCleared;
      const newLevel = getLevel(newLines);
      const lineScore = calculateLineScore(linesCleared, levelRef.current);

      setLines(newLines);
      setLevel(newLevel);
      setScore(prev => prev + lineScore);

      // Restart game loop with new speed if level changed
      if (newLevel !== levelRef.current) {
        stopGameLoop();
        const newSpeed = getSpeed(newLevel);
        gameLoopRef.current = setInterval(() => {
          tick();
        }, newSpeed);
      }
    }

    // Spawn next piece
    setCurrentPiece(null); // Clear briefly
    // Use setTimeout to allow state to settle
    setTimeout(() => spawnPiece(), 0);
  }, [spawnPiece, stopGameLoop]);

  // Game tick — move piece down
  const tick = useCallback(() => {
    if (statusRef.current !== "playing") return;
    const piece = currentPieceRef.current;
    if (!piece) return;

    const moved = { ...piece, row: piece.row + 1 };
    if (isValidPosition(gridRef.current, moved)) {
      setCurrentPiece(moved);
    } else {
      // Can't move down — lock piece
      lockPiece();
    }
  }, [lockPiece]);

  // Start game loop
  const startGameLoop = useCallback((speed: number) => {
    stopGameLoop();
    gameLoopRef.current = setInterval(() => {
      tick();
    }, speed);
  }, [stopGameLoop, tick]);

  // Restart game loop when level changes
  useEffect(() => {
    if (status === "playing" && currentPiece) {
      stopGameLoop();
      const speed = getSpeed(level);
      gameLoopRef.current = setInterval(() => {
        tick();
      }, speed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  // Start game
  const startGame = useCallback(async () => {
    resetBag();
    const newGrid = createEmptyGrid();
    const first = getRandomPiece();
    const next = getRandomPiece();

    if (mode === "onchain") {
      if (!isConnected || !address) {
        setMessage("Please connect wallet first");
        return;
      }
      try {
        setStatus("processing");
        setMessage("Starting game on blockchain...");
        await writeContractAsync({
          address: contractAddress!,
          abi: TETRIS_CONTRACT_ABI,
          functionName: "startGame",
        });
        setGameStartedOnChain(true);
      } catch (error) {
        console.error("Failed to start on-chain game:", error);
        setMessage("Failed to start on-chain game");
        setStatus("idle");
        return;
      }
    }

    setGrid(newGrid);
    setCurrentPiece(first);
    setNextPiece(next);
    setHoldPiece(null);
    setCanHold(true);
    setScore(0);
    setLines(0);
    setLevel(1);
    setStatus("playing");
    setResult(null);
    setMessage("");
    setTimer(0);

    startTimer();
    startGameLoop(getSpeed(1));
  }, [mode, isConnected, address, writeContractAsync, contractAddress, startTimer, startGameLoop]);

  // Player actions
  const moveLeft = useCallback(() => {
    if (status !== "playing" || !currentPiece) return;
    const moved = { ...currentPiece, col: currentPiece.col - 1 };
    if (isValidPosition(grid, moved)) {
      setCurrentPiece(moved);
    }
  }, [status, currentPiece, grid]);

  const moveRight = useCallback(() => {
    if (status !== "playing" || !currentPiece) return;
    const moved = { ...currentPiece, col: currentPiece.col + 1 };
    if (isValidPosition(grid, moved)) {
      setCurrentPiece(moved);
    }
  }, [status, currentPiece, grid]);

  const moveDown = useCallback(() => {
    if (status !== "playing" || !currentPiece) return;
    const moved = { ...currentPiece, row: currentPiece.row + 1 };
    if (isValidPosition(grid, moved)) {
      setCurrentPiece(moved);
      setScore(prev => prev + 1); // Soft drop score
    }
  }, [status, currentPiece, grid]);

  const rotate = useCallback(() => {
    if (status !== "playing" || !currentPiece) return;
    const rotated = rotateCW(currentPiece);
    // Try normal rotation
    if (isValidPosition(grid, rotated)) {
      setCurrentPiece(rotated);
      return;
    }
    // Wall kick: try 1 cell left, then 1 cell right
    const kickLeft = { ...rotated, col: rotated.col - 1 };
    if (isValidPosition(grid, kickLeft)) {
      setCurrentPiece(kickLeft);
      return;
    }
    const kickRight = { ...rotated, col: rotated.col + 1 };
    if (isValidPosition(grid, kickRight)) {
      setCurrentPiece(kickRight);
      return;
    }
  }, [status, currentPiece, grid]);

  const hardDrop = useCallback(() => {
    if (status !== "playing" || !currentPiece) return;
    const ghostRow = getGhostRow(grid, currentPiece);
    const dropDistance = ghostRow - currentPiece.row;
    setScore(prev => prev + dropDistance * 2); // Hard drop score
    setCurrentPiece({ ...currentPiece, row: ghostRow });
    // Lock immediately
    setTimeout(() => lockPiece(), 0);
  }, [status, currentPiece, grid, lockPiece]);

  const hold = useCallback(() => {
    if (status !== "playing" || !currentPiece || !canHold) return;
    setCanHold(false);

    if (holdPiece) {
      // Swap current with hold
      const held = { ...holdPiece, row: 0, col: Math.floor((COLS - holdPiece.shape[0].length) / 2) };
      setHoldPiece({ ...currentPiece, row: 0, col: 0 });
      if (isValidPosition(grid, held)) {
        setCurrentPiece(held);
      } else {
        // Can't place held piece — keep current
        setCanHold(true);
        setHoldPiece(holdPiece);
      }
    } else {
      // First hold — store current, spawn next
      setHoldPiece({ ...currentPiece, row: 0, col: 0 });
      spawnPiece();
    }
  }, [status, currentPiece, canHold, holdPiece, grid, spawnPiece]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== "playing") return;

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          moveLeft();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          moveRight();
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          moveDown();
          break;
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          rotate();
          break;
        case " ":
          e.preventDefault();
          hardDrop();
          break;
        case "c":
        case "C":
        case "Shift":
          e.preventDefault();
          hold();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, moveLeft, moveRight, moveDown, rotate, hardDrop, hold]);

  // Reset game
  const resetGame = useCallback(() => {
    stopGameLoop();
    stopTimer();
    resetBag();
    setGrid(createEmptyGrid());
    setCurrentPiece(null);
    setNextPiece(null);
    setHoldPiece(null);
    setCanHold(true);
    setScore(0);
    setLines(0);
    setLevel(1);
    setStatus("idle");
    setResult(null);
    setTimer(0);
    setMessage("Click Start to begin!");
    setGameStartedOnChain(false);
  }, [stopGameLoop, stopTimer]);

  // Switch mode
  const switchMode = useCallback(
    (newMode: GameMode) => {
      if (status === "playing") return;
      setMode(newMode);
      resetGame();
    },
    [status, resetGame]
  );

  // Ghost row for current piece
  const ghostRow = currentPiece ? getGhostRow(grid, currentPiece) : null;

  return {
    // State
    grid,
    currentPiece,
    nextPiece,
    holdPiece,
    canHold,
    ghostRow,
    score,
    lines,
    level,
    mode,
    status,
    result,
    message,
    timer,
    stats,
    isConnected,
    isProcessing: isPending,

    // Actions
    startGame,
    resetGame,
    switchMode,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    hardDrop,
    hold,
    formatTime,
  };
}
