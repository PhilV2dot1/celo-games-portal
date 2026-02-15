/**
 * Tetris Smart Contract ABI
 * Deployed on Celo, Base & MegaETH
 */

export const TETRIS_CONTRACT_ABI = [
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
      { name: "lines", type: "uint256" },
      { name: "level", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "abandonGame",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getPlayerStats",
    inputs: [{ name: "player", type: "address" }],
    outputs: [
      { name: "gamesPlayed", type: "uint256" },
      { name: "wins", type: "uint256" },
      { name: "highScore", type: "uint256" },
      { name: "totalScore", type: "uint256" },
      { name: "totalLines", type: "uint256" },
      { name: "highestLevel", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isGameActive",
    inputs: [{ name: "player", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalGames",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getGlobalHighScore",
    inputs: [],
    outputs: [
      { name: "score", type: "uint256" },
      { name: "holder", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "GameStarted",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "GameEnded",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "score", type: "uint256", indexed: false },
      { name: "lines", type: "uint256", indexed: false },
      { name: "level", type: "uint256", indexed: false },
      { name: "newHighScore", type: "bool", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "GameAbandoned",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "NewGlobalHighScore",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "score", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;
