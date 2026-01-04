import { useState, useCallback, useEffect, useRef } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";

// ========================================
// TYPES
// ========================================

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type Position = { x: number; y: number };
export type GameMode = "free" | "onchain";
export type GameStatus = "idle" | "playing" | "processing" | "gameover";

export interface PlayerStats {
  games: number;
  highScore: number;
  totalScore: number;
  totalFood: number;
}

// ========================================
// CONSTANTS
// ========================================

export const GRID_SIZE = 20; // 20x20 grid
export const INITIAL_SNAKE_LENGTH = 3;
export const INITIAL_SPEED = 150; // milliseconds
export const SPEED_INCREMENT = 5; // Speed increases every 5 food eaten
export const SPEED_DECREASE = 10; // Decrease delay by 10ms

// Contract configuration (will be set after deployment)
const SNAKE_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;
const SNAKE_CONTRACT_ABI = [
  {
    type: "function",
    name: "startGame",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "endGame",
    inputs: [
      { name: "score", type: "uint256" },
      { name: "foodEaten", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getPlayerStats",
    inputs: [{ name: "player", type: "address" }],
    outputs: [
      { name: "gamesPlayed", type: "uint256" },
      { name: "highScore", type: "uint256" },
      { name: "totalScore", type: "uint256" },
      { name: "totalFoodEaten", type: "uint256" },
    ],
    stateMutability: "view",
  },
] as const;

// ========================================
// UTILITIES
// ========================================

function createInitialSnake(): Position[] {
  const startX = Math.floor(GRID_SIZE / 2);
  const startY = Math.floor(GRID_SIZE / 2);
  return Array.from({ length: INITIAL_SNAKE_LENGTH }, (_, i) => ({
    x: startX - i,
    y: startY,
  }));
}

function generateFood(snake: Position[]): Position {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));
  return food;
}

function checkCollision(head: Position, snake: Position[]): boolean {
  // Check wall collision
  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    return true;
  }

  // Check self collision (skip the head itself)
  return snake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y);
}

function getNextPosition(head: Position, direction: Direction): Position {
  switch (direction) {
    case "UP":
      return { x: head.x, y: head.y - 1 };
    case "DOWN":
      return { x: head.x, y: head.y + 1 };
    case "LEFT":
      return { x: head.x - 1, y: head.y };
    case "RIGHT":
      return { x: head.x + 1, y: head.y };
  }
}

function isOppositeDirection(current: Direction, next: Direction): boolean {
  return (
    (current === "UP" && next === "DOWN") ||
    (current === "DOWN" && next === "UP") ||
    (current === "LEFT" && next === "RIGHT") ||
    (current === "RIGHT" && next === "LEFT")
  );
}

// ========================================
// HOOK
// ========================================

export function useSnake() {
  const [snake, setSnake] = useState<Position[]>(createInitialSnake());
  const [food, setFood] = useState<Position>(() => generateFood(createInitialSnake()));
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [nextDirection, setNextDirection] = useState<Direction>("RIGHT");
  const [mode, setMode] = useState<GameMode>("free");
  const [status, setStatus] = useState<GameStatus>("idle");
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [stats, setStats] = useState<PlayerStats>({
    games: 0,
    highScore: 0,
    totalScore: 0,
    totalFood: 0,
  });
  const [gameStartedOnChain, setGameStartedOnChain] = useState(false);
  const [message, setMessage] = useState("Press Start to begin!");

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Load stats from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("snake_celo_stats");
    if (saved) {
      try {
        setStats(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load stats:", e);
      }
    }
  }, []);

  // Load on-chain stats when connected
  const { data: onChainStats, refetch: refetchStats } = useReadContract({
    address: SNAKE_CONTRACT_ADDRESS,
    abi: SNAKE_CONTRACT_ABI,
    functionName: "getPlayerStats",
    args: address ? [address] : undefined,
    query: {
      enabled: mode === "onchain" && isConnected && !!address,
    },
  });

  // Update stats when on-chain data changes
  useEffect(() => {
    if (mode === "onchain" && onChainStats) {
      const [gamesPlayed, highScore, totalScore, totalFoodEaten] =
        onChainStats as readonly bigint[];
      setStats({
        games: Number(gamesPlayed),
        highScore: Number(highScore),
        totalScore: Number(totalScore),
        totalFood: Number(totalFoodEaten),
      });
    }
  }, [onChainStats, mode]);

  // Game loop
  const moveSnake = useCallback(() => {
    setSnake((currentSnake) => {
      const head = currentSnake[0];
      const newHead = getNextPosition(head, nextDirection);

      // Check collision
      if (checkCollision(newHead, currentSnake)) {
        setStatus("gameover");
        setMessage("Game Over! You crashed!");
        return currentSnake;
      }

      // Check if food is eaten
      const ateFood = newHead.x === food.x && newHead.y === food.y;

      let newSnake: Position[];
      if (ateFood) {
        // Grow snake
        newSnake = [newHead, ...currentSnake];
        setScore((s) => s + 10);
        setFood(generateFood([newHead, ...currentSnake]));

        // Increase speed every SPEED_INCREMENT food
        const newScore = score + 10;
        if ((newScore / 10) % SPEED_INCREMENT === 0) {
          setSpeed((s) => Math.max(50, s - SPEED_DECREASE));
        }
      } else {
        // Move snake (remove tail)
        newSnake = [newHead, ...currentSnake.slice(0, -1)];
      }

      setDirection(nextDirection);
      return newSnake;
    });
  }, [nextDirection, food, score]);

  // Game loop effect
  useEffect(() => {
    if (status === "playing") {
      gameLoopRef.current = setInterval(moveSnake, speed);
      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      };
    }
  }, [status, speed, moveSnake]);

  // Handle game over
  useEffect(() => {
    const handleGameOver = async () => {
      const foodEaten = score / 10;

      if (mode === "free") {
        // Free play: update local stats
        const newStats = {
          ...stats,
          games: stats.games + 1,
          highScore: Math.max(stats.highScore, score),
          totalScore: stats.totalScore + score,
          totalFood: stats.totalFood + foodEaten,
        };
        setStats(newStats);
        localStorage.setItem("snake_celo_stats", JSON.stringify(newStats));

        if (score > stats.highScore) {
          setMessage(`🎉 New High Score: ${score}!`);
        }
      } else {
        // On-chain: record result
        if (!gameStartedOnChain) {
          setMessage(`Game Over! Score: ${score}`);
          return;
        }

        try {
          setStatus("processing");
          setMessage("Recording score on blockchain...");

          await writeContractAsync({
            address: SNAKE_CONTRACT_ADDRESS,
            abi: SNAKE_CONTRACT_ABI,
            functionName: "endGame",
            args: [BigInt(score), BigInt(foodEaten)],
          });

          setGameStartedOnChain(false);
          await refetchStats();

          setMessage(`✅ Score recorded on blockchain: ${score}`);
          setStatus("gameover");
        } catch (error) {
          console.error("Failed to record score:", error);
          setMessage("⚠️ Game finished but not recorded on-chain");
          setGameStartedOnChain(false);
          setStatus("gameover");
        }
      }
    };

    if (status === "gameover") {
      handleGameOver();
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle direction changes
  const changeDirection = useCallback(
    (newDirection: Direction) => {
      if (status !== "playing") return;
      if (isOppositeDirection(direction, newDirection)) return;
      setNextDirection(newDirection);
    },
    [status, direction]
  );

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (status !== "playing") return;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          changeDirection("UP");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          changeDirection("DOWN");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          changeDirection("LEFT");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          changeDirection("RIGHT");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [status, changeDirection]);

  // Start game
  const startGame = useCallback(async () => {
    const initialSnake = createInitialSnake();
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection("RIGHT");
    setNextDirection("RIGHT");
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setMessage("Use arrow keys or WASD to move!");

    if (mode === "onchain") {
      if (!isConnected || !address) {
        setMessage("⚠️ Please connect wallet first");
        return;
      }

      try {
        setStatus("processing");
        setMessage("Starting game on blockchain...");

        await writeContractAsync({
          address: SNAKE_CONTRACT_ADDRESS,
          abi: SNAKE_CONTRACT_ABI,
          functionName: "startGame",
        });

        setGameStartedOnChain(true);
        setStatus("playing");
        setMessage("Game started! Use arrow keys or WASD to move");
      } catch (error) {
        console.error("Failed to start on-chain game:", error);
        setMessage("⚠️ Failed to start on-chain game");
        setStatus("idle");
      }
    } else {
      setStatus("playing");
    }
  }, [mode, isConnected, address, writeContractAsync]);

  // Reset game
  const resetGame = useCallback(() => {
    const initialSnake = createInitialSnake();
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection("RIGHT");
    setNextDirection("RIGHT");
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setStatus("idle");
    setMessage("Press Start to begin!");
    setGameStartedOnChain(false);

    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
  }, []);

  // Switch mode
  const switchMode = useCallback(
    (newMode: GameMode) => {
      setMode(newMode);
      resetGame();
    },
    [resetGame]
  );

  return {
    snake,
    food,
    direction,
    mode,
    status,
    score,
    stats,
    message,
    isConnected,
    gridSize: GRID_SIZE,
    startGame,
    resetGame,
    switchMode,
    changeDirection,
  };
}
