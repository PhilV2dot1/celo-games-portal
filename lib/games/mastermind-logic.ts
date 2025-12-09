// Crypto Mastermind Game Logic - Pure TypeScript implementation

// Crypto symbols
export type Color = 'btc' | 'eth' | 'avax' | 'celo' | 'near' | 'link';
export const COLORS: Color[] = ['btc', 'eth', 'avax', 'celo', 'near', 'link'];

export const COLOR_CONFIG: Record<Color, {
  name: string;
  bg: string;
  border: string;
  shadow: string;
  logo: string;
}> = {
  btc: {
    name: 'BTC',
    bg: '#F7931A',
    border: '#E68A00',
    shadow: 'rgba(247, 147, 26, 0.5)',
    logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'
  },
  eth: {
    name: 'ETH',
    bg: '#6B7280',
    border: '#4B5563',
    shadow: 'rgba(107, 114, 128, 0.5)',
    logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
  },
  avax: {
    name: 'AVAX',
    bg: '#E84142',
    border: '#D43030',
    shadow: 'rgba(232, 65, 66, 0.5)',
    logo: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png'
  },
  celo: {
    name: 'CELO',
    bg: '#FBCC5C',
    border: '#F5B800',
    shadow: 'rgba(251, 204, 92, 0.5)',
    logo: 'https://assets.coingecko.com/coins/images/11090/small/InjXBNx9_400x400.jpg'
  },
  near: {
    name: 'NEAR',
    bg: '#00C08B',
    border: '#00A67D',
    shadow: 'rgba(0, 192, 139, 0.5)',
    logo: 'https://assets.coingecko.com/coins/images/10365/small/near.jpg'
  },
  link: {
    name: 'LINK',
    bg: '#2A5ADA',
    border: '#1E4BB8',
    shadow: 'rgba(42, 90, 218, 0.5)',
    logo: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png'
  },
};

// Game constants
export const CODE_LENGTH = 4;
export const MAX_ATTEMPTS = 10;

// Types
export type Code = [Color, Color, Color, Color];
export type Guess = [Color | null, Color | null, Color | null, Color | null];
export type Feedback = { blackPegs: number; whitePegs: number };

export interface GameHistory {
  guess: Code;
  feedback: Feedback;
}

// Generate random secret code
export function generateSecretCode(): Code {
  return Array.from(
    { length: CODE_LENGTH },
    () => COLORS[Math.floor(Math.random() * COLORS.length)]
  ) as Code;
}

// Evaluate guess against secret code
export function evaluateGuess(secret: Code, guess: Code): Feedback {
  let blackPegs = 0;
  let whitePegs = 0;

  const secretCopy: (Color | null)[] = [...secret];
  const guessCopy: (Color | null)[] = [...guess];

  // First pass: count black pegs (exact matches)
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guessCopy[i] === secretCopy[i]) {
      blackPegs++;
      secretCopy[i] = null; // Mark as used
      guessCopy[i] = null;
    }
  }

  // Second pass: count white pegs (color exists but wrong position)
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guessCopy[i] !== null) {
      const matchIndex = secretCopy.findIndex(c => c === guessCopy[i]);
      if (matchIndex !== -1) {
        whitePegs++;
        secretCopy[matchIndex] = null; // Mark as used
      }
    }
  }

  return { blackPegs, whitePegs };
}

// Check if guess is valid (all 4 colors selected)
export function isValidGuess(guess: Guess): guess is Code {
  return guess.every(color => color !== null);
}

// Check if player won
export function hasWon(feedback: Feedback): boolean {
  return feedback.blackPegs === CODE_LENGTH;
}

// Calculate score based on attempts used
export function calculateScore(won: boolean, attemptsUsed: number): number {
  if (!won) return 0;
  return Math.max(0, 100 - (attemptsUsed * 10));
}
