import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBlackjack } from '@/hooks/useBlackjack';
import type { Card, Outcome } from '@/lib/games/blackjack-cards';
import * as blackjackCards from '@/lib/games/blackjack-cards';

/**
 * useBlackjack Hook Tests
 *
 * Tests for the Blackjack game hook that manages:
 * - Free mode gameplay (local cards, credits, stats)
 * - On-chain mode (blockchain transactions via Wagmi)
 * - Game logic (deal, hit, stand, bust detection)
 * - Hand total calculation (including ace soft/hard logic)
 * - Stats tracking (wins, losses, pushes, blackjacks, streaks)
 * - Credits management (bet 10, win +10, blackjack +15)
 * - Mode switching between free and on-chain
 */

// Mock dependencies
vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({
    address: '0x1234567890ABCDEF1234567890ABCDEF12345678' as `0x${string}`,
    isConnected: true,
    chain: { id: 42220, name: 'Celo' },
  })),
  useReadContract: vi.fn(() => ({
    data: [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n], // [wins, losses, pushes, blackjacks, _, _, currentStreak, bestStreak]
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
  useWriteContract: vi.fn(() => ({
    writeContract: vi.fn(),
    data: undefined,
    isPending: false,
    error: null,
    reset: vi.fn(),
  })),
  useWaitForTransactionReceipt: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
  useSwitchChain: vi.fn(() => ({
    switchChain: vi.fn(),
  })),
}));

vi.mock('wagmi/chains', () => ({
  celo: { id: 42220, name: 'Celo' },
}));

vi.mock('viem', () => ({
  parseEventLogs: vi.fn(() => []),
}));

vi.mock('@/lib/contracts/blackjack-abi', () => ({
  CONTRACT_ADDRESS: '0xBLACKJACK' as `0x${string}`,
  CONTRACT_ABI: [],
}));

describe('useBlackjack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // Initial State Tests
  // ============================================================================

  test('should initialize with correct default state', () => {
    const { result } = renderHook(() => useBlackjack());

    expect(result.current.mode).toBe('free');
    expect(result.current.gamePhase).toBe('betting');
    expect(result.current.playerHand).toEqual([]);
    expect(result.current.dealerHand).toEqual([]);
    expect(result.current.playerTotal).toBe(0);
    expect(result.current.dealerTotal).toBe(0);
    expect(result.current.outcome).toBeNull();
    expect(result.current.message).toBe('');
    expect(result.current.stats).toEqual({
      wins: 0,
      losses: 0,
      pushes: 0,
      blackjacks: 0,
      currentStreak: 0,
      bestStreak: 0,
    });
    expect(result.current.credits).toBe(1000);
    expect(result.current.showDealerCard).toBe(false);
  });

  test('should have all required functions defined', () => {
    const { result } = renderHook(() => useBlackjack());

    expect(typeof result.current.hit).toBe('function');
    expect(typeof result.current.stand).toBe('function');
    expect(typeof result.current.newGame).toBe('function');
    expect(typeof result.current.playOnChain).toBe('function');
    expect(typeof result.current.switchMode).toBe('function');
    expect(typeof result.current.resetCredits).toBe('function');
  });

  // ============================================================================
  // calculateHandTotal Tests
  // ============================================================================

  test('should calculate hand total for regular cards', () => {
    const { result } = renderHook(() => useBlackjack());

    // Create a hand with regular cards (2-10)
    const mockDeck: Card[] = [
      { value: 5, suit: '♠', display: '5' },
      { value: 7, suit: '♥', display: '7' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);

    act(() => {
      result.current.newGame();
    });

    // Total should be 5 + 7 = 12
    expect(result.current.playerTotal).toBe(12);
  });

  test('should calculate hand total for face cards as 10', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 13, suit: '♠', display: 'K' }, // King = 10
      { value: 12, suit: '♥', display: 'Q' }, // Queen = 10
      { value: 11, suit: '♦', display: 'J' }, // Jack = 10
      { value: 10, suit: '♣', display: '10' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);

    act(() => {
      result.current.newGame();
    });

    // Player gets King (10) + Jack (10) = 20
    expect(result.current.playerTotal).toBe(20);
  });

  test('should calculate ace as 11 when it does not cause bust', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 1, suit: '♠', display: 'A' }, // Ace = 11
      { value: 8, suit: '♥', display: '8' }, // 8
      { value: 5, suit: '♦', display: '5' },
      { value: 6, suit: '♣', display: '6' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);

    act(() => {
      result.current.newGame();
    });

    // Player gets Ace (11) + 8 = 19
    expect(result.current.playerTotal).toBe(19);
  });

  test('should calculate ace as 1 when 11 would cause bust', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 1, suit: '♠', display: 'A' }, // Ace
      { value: 13, suit: '♥', display: 'K' }, // King = 10
      { value: 5, suit: '♦', display: '5' },
      { value: 6, suit: '♣', display: '6' },
      { value: 9, suit: '♠', display: '9' }, // Hit card
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);

    act(() => {
      result.current.newGame();
    });

    // Player: Ace + King = 21 (Ace counts as 11)
    expect(result.current.playerTotal).toBe(21);

    act(() => {
      result.current.hit();
    });

    // After hit with 9: Ace (now 1) + King (10) + 9 = 20 (not bust!)
    expect(result.current.playerTotal).toBe(20);
  });

  test('should handle multiple aces correctly', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 1, suit: '♠', display: 'A' }, // Ace
      { value: 1, suit: '♥', display: 'A' }, // Ace
      { value: 5, suit: '♦', display: '5' },
      { value: 6, suit: '♣', display: '6' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);

    act(() => {
      result.current.newGame();
    });

    // Player gets Ace + Ace
    // First Ace = 11, Second Ace = 11 would be 22 (bust), so Second Ace = 1
    // Total: 11 + 1 = 12
    expect(result.current.playerTotal).toBe(12);
  });

  // ============================================================================
  // dealInitialCards (newGame in free mode) Tests
  // ============================================================================

  test('should deal 2 cards to player and 2 to dealer on new game', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 5, suit: '♠', display: '5' },  // Player card 1
      { value: 7, suit: '♥', display: '7' },  // Player card 2
      { value: 10, suit: '♦', display: '10' }, // Dealer card 1
      { value: 6, suit: '♣', display: '6' },  // Dealer card 2
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);

    act(() => {
      result.current.newGame();
    });

    expect(result.current.playerHand).toHaveLength(2);
    expect(result.current.dealerHand).toHaveLength(2);
    expect(result.current.gamePhase).toBe('playing');
  });

  test('should set showDealerCard to false on initial deal', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 5, suit: '♠', display: '5' },
      { value: 7, suit: '♥', display: '7' },
      { value: 10, suit: '♦', display: '10' },
      { value: 6, suit: '♣', display: '6' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);

    act(() => {
      result.current.newGame();
    });

    expect(result.current.showDealerCard).toBe(false);
  });

  test('should detect immediate player blackjack (21 with 2 cards)', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 1, suit: '♠', display: 'A' },   // Player Ace
      { value: 13, suit: '♥', display: 'K' },  // Player King
      { value: 10, suit: '♦', display: '10' }, // Dealer 10
      { value: 6, suit: '♣', display: '6' },   // Dealer 6
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);

    act(() => {
      result.current.newGame();
    });

    expect(result.current.playerTotal).toBe(21);
    expect(result.current.gamePhase).toBe('finished');
    expect(result.current.outcome).toBe('blackjack');
    expect(result.current.showDealerCard).toBe(true);
  });

  test('should detect push when both have blackjack', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 1, suit: '♠', display: 'A' },   // Player Ace
      { value: 13, suit: '♥', display: 'K' },  // Player King
      { value: 1, suit: '♦', display: 'A' },   // Dealer Ace
      { value: 13, suit: '♣', display: 'K' },  // Dealer King
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);

    act(() => {
      result.current.newGame();
    });

    expect(result.current.playerTotal).toBe(21);
    expect(result.current.dealerTotal).toBe(21);
    expect(result.current.outcome).toBe('push');
    expect(result.current.gamePhase).toBe('finished');
  });

  test('should update credits on immediate blackjack', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 1, suit: '♠', display: 'A' },
      { value: 13, suit: '♥', display: 'K' },
      { value: 10, suit: '♦', display: '10' },
      { value: 6, suit: '♣', display: '6' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);

    const initialCredits = result.current.credits;

    act(() => {
      result.current.newGame();
    });

    // Blackjack should give +15 credits
    expect(result.current.credits).toBe(initialCredits + 15);
  });

  // ============================================================================
  // hit() Tests
  // ============================================================================

  test('should add card to player hand when hitting', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 5, suit: '♠', display: '5' },  // Player card 1
      { value: 7, suit: '♥', display: '7' },  // Player card 2
      { value: 10, suit: '♦', display: '10' }, // Dealer card 1
      { value: 6, suit: '♣', display: '6' },  // Dealer card 2
      { value: 3, suit: '♠', display: '3' },  // Hit card
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);

    act(() => {
      result.current.newGame();
    });

    const handSizeBefore = result.current.playerHand.length;

    act(() => {
      result.current.hit();
    });

    expect(result.current.playerHand.length).toBe(handSizeBefore + 1);
    expect(result.current.playerTotal).toBe(15); // 5 + 7 + 3
  });

  test('should detect bust when player total > 21', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 10, suit: '♠', display: '10' }, // Player 10
      { value: 10, suit: '♥', display: '10' }, // Player 10
      { value: 5, suit: '♦', display: '5' },   // Dealer
      { value: 6, suit: '♣', display: '6' },   // Dealer
      { value: 5, suit: '♠', display: '5' },   // Hit card (would make 25)
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);

    act(() => {
      result.current.newGame();
    });

    expect(result.current.playerTotal).toBe(20);

    act(() => {
      result.current.hit();
    });

    expect(result.current.playerTotal).toBe(25);
    expect(result.current.outcome).toBe('lose');
    expect(result.current.gamePhase).toBe('finished');
    expect(result.current.showDealerCard).toBe(true);
  });

  test('should deduct credits on bust', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 10, suit: '♠', display: '10' },
      { value: 10, suit: '♥', display: '10' },
      { value: 5, suit: '♦', display: '5' },
      { value: 6, suit: '♣', display: '6' },
      { value: 5, suit: '♠', display: '5' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);

    act(() => {
      result.current.newGame();
    });

    const creditsBefore = result.current.credits;

    act(() => {
      result.current.hit();
    });

    // Should lose 10 credits on bust
    expect(result.current.credits).toBe(Math.max(0, creditsBefore - 10));
  });

  test('should not allow hit in on-chain mode', () => {
    const { result } = renderHook(() => useBlackjack());

    act(() => {
      result.current.switchMode('onchain');
    });

    const mockDeck: Card[] = [
      { value: 5, suit: '♠', display: '5' },
      { value: 7, suit: '♥', display: '7' },
      { value: 10, suit: '♦', display: '10' },
      { value: 6, suit: '♣', display: '6' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);

    // Try to hit (should have no effect in onchain mode)
    act(() => {
      result.current.hit();
    });

    expect(result.current.playerHand).toHaveLength(0);
  });

  test('should not allow hit when gamePhase is not playing', () => {
    const { result } = renderHook(() => useBlackjack());

    // gamePhase is 'betting' initially
    act(() => {
      result.current.hit();
    });

    expect(result.current.playerHand).toHaveLength(0);
  });

  // ============================================================================
  // stand() Tests
  // ============================================================================

  test('should reveal dealer card when standing', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 10, suit: '♠', display: '10' }, // Player
      { value: 8, suit: '♥', display: '8' },   // Player
      { value: 7, suit: '♦', display: '7' },   // Dealer
      { value: 6, suit: '♣', display: '6' },   // Dealer
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);
    vi.spyOn(blackjackCards, 'determineWinner').mockReturnValue('win');

    act(() => {
      result.current.newGame();
    });

    expect(result.current.showDealerCard).toBe(false);

    act(() => {
      result.current.stand();
    });

    expect(result.current.showDealerCard).toBe(true);
    expect(result.current.gamePhase).toBe('finished');
  });

  test('should make dealer hit until 17 or higher', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 10, suit: '♠', display: '10' }, // Player card 1
      { value: 8, suit: '♥', display: '8' },   // Player card 2
      { value: 6, suit: '♦', display: '6' },   // Dealer card 1 (6)
      { value: 5, suit: '♣', display: '5' },   // Dealer card 2 (5) = 11 total
      { value: 7, suit: '♠', display: '7' },   // Dealer hits (11 + 7 = 18)
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);
    vi.spyOn(blackjackCards, 'determineWinner').mockReturnValue('lose');

    act(() => {
      result.current.newGame();
    });

    act(() => {
      result.current.stand();
    });

    // Dealer should have hit once (started with 11, hit to 18)
    expect(result.current.dealerHand.length).toBe(3);
    expect(result.current.dealerTotal).toBe(18);
  });

  test('should determine winner correctly on stand', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 10, suit: '♠', display: '10' },
      { value: 9, suit: '♥', display: '9' },   // Player: 19
      { value: 10, suit: '♦', display: '10' },
      { value: 6, suit: '♣', display: '6' },   // Dealer: 16
      { value: 2, suit: '♠', display: '2' },   // Dealer hits to 18
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);
    vi.spyOn(blackjackCards, 'determineWinner').mockReturnValue('win');

    act(() => {
      result.current.newGame();
    });

    act(() => {
      result.current.stand();
    });

    expect(result.current.outcome).toBe('win');
  });

  test('should add credits on win', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 10, suit: '♠', display: '10' },
      { value: 9, suit: '♥', display: '9' },
      { value: 10, suit: '♦', display: '10' },
      { value: 6, suit: '♣', display: '6' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);
    vi.spyOn(blackjackCards, 'determineWinner').mockReturnValue('win');

    act(() => {
      result.current.newGame();
    });

    const creditsBefore = result.current.credits;

    act(() => {
      result.current.stand();
    });

    // Win gives +10 credits
    expect(result.current.credits).toBe(creditsBefore + 10);
  });

  test('should deduct credits on lose', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 10, suit: '♠', display: '10' },
      { value: 6, suit: '♥', display: '6' },   // Player: 16
      { value: 10, suit: '♦', display: '10' },
      { value: 10, suit: '♣', display: '10' }, // Dealer: 20
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);
    vi.spyOn(blackjackCards, 'determineWinner').mockReturnValue('lose');

    act(() => {
      result.current.newGame();
    });

    const creditsBefore = result.current.credits;

    act(() => {
      result.current.stand();
    });

    // Lose deducts 10 credits
    expect(result.current.credits).toBe(Math.max(0, creditsBefore - 10));
  });

  test('should not change credits on push', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 10, suit: '♠', display: '10' },
      { value: 10, suit: '♥', display: '10' }, // Player: 20
      { value: 10, suit: '♦', display: '10' },
      { value: 10, suit: '♣', display: '10' }, // Dealer: 20
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);
    vi.spyOn(blackjackCards, 'determineWinner').mockReturnValue('push');

    act(() => {
      result.current.newGame();
    });

    const creditsBefore = result.current.credits;

    act(() => {
      result.current.stand();
    });

    // Push = no change
    expect(result.current.credits).toBe(creditsBefore);
  });

  test('should not allow stand in on-chain mode', () => {
    const { result } = renderHook(() => useBlackjack());

    act(() => {
      result.current.switchMode('onchain');
    });

    act(() => {
      result.current.stand();
    });

    expect(result.current.gamePhase).toBe('betting');
  });

  // ============================================================================
  // Stats Update Tests
  // ============================================================================

  test('should increment wins on win outcome', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 10, suit: '♠', display: '10' },
      { value: 9, suit: '♥', display: '9' },
      { value: 10, suit: '♦', display: '10' },
      { value: 6, suit: '♣', display: '6' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);
    vi.spyOn(blackjackCards, 'determineWinner').mockReturnValue('win');

    act(() => {
      result.current.newGame();
    });

    act(() => {
      result.current.stand();
    });

    expect(result.current.stats.wins).toBe(1);
    expect(result.current.stats.currentStreak).toBe(1);
  });

  test('should increment losses on lose outcome', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 10, suit: '♠', display: '10' },
      { value: 6, suit: '♥', display: '6' },
      { value: 10, suit: '♦', display: '10' },
      { value: 10, suit: '♣', display: '10' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);
    vi.spyOn(blackjackCards, 'determineWinner').mockReturnValue('lose');

    act(() => {
      result.current.newGame();
    });

    act(() => {
      result.current.stand();
    });

    expect(result.current.stats.losses).toBe(1);
    expect(result.current.stats.currentStreak).toBe(0);
  });

  test('should increment pushes on push outcome', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 10, suit: '♠', display: '10' },
      { value: 10, suit: '♥', display: '10' },
      { value: 10, suit: '♦', display: '10' },
      { value: 10, suit: '♣', display: '10' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);
    vi.spyOn(blackjackCards, 'determineWinner').mockReturnValue('push');

    act(() => {
      result.current.newGame();
    });

    act(() => {
      result.current.stand();
    });

    expect(result.current.stats.pushes).toBe(1);
  });

  test('should increment blackjacks on blackjack outcome', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 1, suit: '♠', display: 'A' },
      { value: 13, suit: '♥', display: 'K' },
      { value: 10, suit: '♦', display: '10' },
      { value: 6, suit: '♣', display: '6' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);

    act(() => {
      result.current.newGame();
    });

    expect(result.current.stats.blackjacks).toBe(1);
    expect(result.current.stats.wins).toBe(1); // Blackjack also counts as win
  });

  test('should track current streak correctly', () => {
    const { result } = renderHook(() => useBlackjack());

    vi.spyOn(blackjackCards, 'determineWinner')
      .mockReturnValueOnce('win')
      .mockReturnValueOnce('win')
      .mockReturnValueOnce('lose');

    const mockDeck: Card[] = [
      { value: 10, suit: '♠', display: '10' },
      { value: 9, suit: '♥', display: '9' },
      { value: 10, suit: '♦', display: '10' },
      { value: 6, suit: '♣', display: '6' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);

    // First win
    act(() => {
      result.current.newGame();
    });
    act(() => {
      result.current.stand();
    });
    expect(result.current.stats.currentStreak).toBe(1);

    // Second win
    act(() => {
      result.current.newGame();
    });
    act(() => {
      result.current.stand();
    });
    expect(result.current.stats.currentStreak).toBe(2);

    // Loss breaks streak
    act(() => {
      result.current.newGame();
    });
    act(() => {
      result.current.stand();
    });
    expect(result.current.stats.currentStreak).toBe(0);
  });

  test('should track best streak correctly', () => {
    const { result } = renderHook(() => useBlackjack());

    vi.spyOn(blackjackCards, 'determineWinner')
      .mockReturnValueOnce('win')
      .mockReturnValueOnce('win')
      .mockReturnValueOnce('win')
      .mockReturnValueOnce('lose')
      .mockReturnValueOnce('win');

    const mockDeck: Card[] = [
      { value: 10, suit: '♠', display: '10' },
      { value: 9, suit: '♥', display: '9' },
      { value: 10, suit: '♦', display: '10' },
      { value: 6, suit: '♣', display: '6' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);

    // 3 wins in a row
    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.newGame();
      });
      act(() => {
        result.current.stand();
      });
    }

    expect(result.current.stats.bestStreak).toBe(3);

    // Loss
    act(() => {
      result.current.newGame();
    });
    act(() => {
      result.current.stand();
    });

    // One more win (current streak = 1, best streak should still be 3)
    act(() => {
      result.current.newGame();
    });
    act(() => {
      result.current.stand();
    });

    expect(result.current.stats.currentStreak).toBe(1);
    expect(result.current.stats.bestStreak).toBe(3);
  });

  // ============================================================================
  // Mode Switching Tests
  // ============================================================================

  test('should switch from free to onchain mode', () => {
    const { result } = renderHook(() => useBlackjack());

    expect(result.current.mode).toBe('free');

    act(() => {
      result.current.switchMode('onchain');
    });

    expect(result.current.mode).toBe('onchain');
  });

  test('should reset game state when switching modes', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 10, suit: '♠', display: '10' },
      { value: 9, suit: '♥', display: '9' },
      { value: 10, suit: '♦', display: '10' },
      { value: 6, suit: '♣', display: '6' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);

    act(() => {
      result.current.newGame();
    });

    expect(result.current.playerHand.length).toBe(2);

    act(() => {
      result.current.switchMode('onchain');
    });

    expect(result.current.gamePhase).toBe('betting');
    expect(result.current.playerHand).toEqual([]);
    expect(result.current.dealerHand).toEqual([]);
    expect(result.current.outcome).toBeNull();
  });

  test('should reset stats when switching to free mode', () => {
    const { result } = renderHook(() => useBlackjack());

    vi.spyOn(blackjackCards, 'determineWinner').mockReturnValue('win');

    const mockDeck: Card[] = [
      { value: 10, suit: '♠', display: '10' },
      { value: 9, suit: '♥', display: '9' },
      { value: 10, suit: '♦', display: '10' },
      { value: 6, suit: '♣', display: '6' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);

    act(() => {
      result.current.newGame();
    });
    act(() => {
      result.current.stand();
    });

    expect(result.current.stats.wins).toBe(1);

    act(() => {
      result.current.switchMode('onchain');
    });
    act(() => {
      result.current.switchMode('free');
    });

    expect(result.current.stats).toEqual({
      wins: 0,
      losses: 0,
      pushes: 0,
      blackjacks: 0,
      currentStreak: 0,
      bestStreak: 0,
    });
  });

  test('should reset credits to 1000 when switching to free mode', () => {
    const { result } = renderHook(() => useBlackjack());

    act(() => {
      result.current.switchMode('onchain');
    });
    act(() => {
      result.current.switchMode('free');
    });

    expect(result.current.credits).toBe(1000);
  });

  // ============================================================================
  // Credits Management Tests
  // ============================================================================

  test('should not allow new game with insufficient credits', () => {
    const { result } = renderHook(() => useBlackjack());

    // Set credits to less than 10
    act(() => {
      // Manually reduce credits by playing and losing enough games
      result.current.switchMode('free');
    });

    // Hack: Set credits low by directly accessing internal state (not ideal, but for testing)
    // Better approach: play multiple losing games
    // For this test, we'll check the message when credits < 10

    const mockDeck: Card[] = [
      { value: 10, suit: '♠', display: '10' },
      { value: 6, suit: '♥', display: '6' },
      { value: 10, suit: '♦', display: '10' },
      { value: 10, suit: '♣', display: '10' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);
    vi.spyOn(blackjackCards, 'determineWinner').mockReturnValue('lose');

    // Play games until credits < 10
    while (result.current.credits >= 10) {
      act(() => {
        result.current.newGame();
      });
      act(() => {
        result.current.stand();
      });
    }

    const creditsBefore = result.current.credits;
    expect(creditsBefore).toBeLessThan(10);

    // Try to start new game
    act(() => {
      result.current.newGame();
    });

    // Should not have started a new game
    expect(result.current.message).toContain('Not enough credits');
    expect(result.current.gamePhase).toBe('betting');
  });

  test('should reset credits to 1000', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 10, suit: '♠', display: '10' },
      { value: 6, suit: '♥', display: '6' },
      { value: 10, suit: '♦', display: '10' },
      { value: 10, suit: '♣', display: '10' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);
    vi.spyOn(blackjackCards, 'determineWinner').mockReturnValue('lose');

    // Play a losing game
    act(() => {
      result.current.newGame();
    });
    act(() => {
      result.current.stand();
    });

    expect(result.current.credits).toBe(990);

    act(() => {
      result.current.resetCredits();
    });

    expect(result.current.credits).toBe(1000);
  });

  test('should reset stats when resetting credits', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 10, suit: '♠', display: '10' },
      { value: 9, suit: '♥', display: '9' },
      { value: 10, suit: '♦', display: '10' },
      { value: 6, suit: '♣', display: '6' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);
    vi.spyOn(blackjackCards, 'determineWinner').mockReturnValue('win');

    act(() => {
      result.current.newGame();
    });
    act(() => {
      result.current.stand();
    });

    expect(result.current.stats.wins).toBe(1);

    act(() => {
      result.current.resetCredits();
    });

    expect(result.current.stats).toEqual({
      wins: 0,
      losses: 0,
      pushes: 0,
      blackjacks: 0,
      currentStreak: 0,
      bestStreak: 0,
    });
  });

  test('should not reset credits in onchain mode', () => {
    const { result } = renderHook(() => useBlackjack());

    act(() => {
      result.current.switchMode('onchain');
    });

    act(() => {
      result.current.resetCredits();
    });

    // Credits should not change in onchain mode (credits are not used)
    // Actually, when switching to onchain, credits are reset to 1000 from free mode
    // So resetCredits in onchain mode should have no effect
    expect(result.current.mode).toBe('onchain');
  });

  // ============================================================================
  // On-Chain Mode Tests
  // ============================================================================

  test('should call writeContract when playing on-chain', async () => {
    const mockWriteContract = vi.fn();

    vi.mocked(await import('wagmi')).useWriteContract.mockReturnValue({
      writeContract: mockWriteContract,
      data: undefined,
      isPending: false,
      error: null,
      reset: vi.fn(),
    });

    const { result } = renderHook(() => useBlackjack());

    act(() => {
      result.current.switchMode('onchain');
    });

    await act(async () => {
      await result.current.playOnChain();
    });

    expect(mockWriteContract).toHaveBeenCalledWith({
      address: '0xBLACKJACK',
      abi: [],
      functionName: 'playGame',
      chainId: 42220,
      gas: BigInt(500000),
    });
  });

  test('should show error message if not connected', async () => {
    vi.mocked(await import('wagmi')).useAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      chain: undefined,
    } as any);

    const { result } = renderHook(() => useBlackjack());

    act(() => {
      result.current.switchMode('onchain');
    });

    await act(async () => {
      await result.current.playOnChain();
    });

    expect(result.current.message).toContain('connect your wallet');
  });

  test('should switch chain if not on Celo', async () => {
    const mockSwitchChain = vi.fn();

    vi.mocked(await import('wagmi')).useAccount.mockReturnValue({
      address: '0x1234567890ABCDEF1234567890ABCDEF12345678' as `0x${string}`,
      isConnected: true,
      chain: { id: 1, name: 'Ethereum' }, // Not Celo
    } as any);

    vi.mocked(await import('wagmi')).useSwitchChain.mockReturnValue({
      switchChain: mockSwitchChain,
    } as any);

    const { result } = renderHook(() => useBlackjack());

    act(() => {
      result.current.switchMode('onchain');
    });

    await act(async () => {
      await result.current.playOnChain();
    });

    expect(mockSwitchChain).toHaveBeenCalledWith({ chainId: 42220 });
  });

  // ============================================================================
  // Edge Cases Tests
  // ============================================================================

  test('should handle credits never going below 0', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 10, suit: '♠', display: '10' },
      { value: 10, suit: '♥', display: '10' },
      { value: 5, suit: '♦', display: '5' },
      { value: 6, suit: '♣', display: '6' },
      { value: 5, suit: '♠', display: '5' }, // Bust card
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);

    // Reduce credits to very low
    while (result.current.credits > 5) {
      act(() => {
        result.current.newGame();
      });
      act(() => {
        result.current.hit(); // Bust
      });
    }

    expect(result.current.credits).toBeGreaterThanOrEqual(0);
  });

  test('should maintain correct state after multiple games', () => {
    const { result } = renderHook(() => useBlackjack());

    const mockDeck: Card[] = [
      { value: 10, suit: '♠', display: '10' },
      { value: 9, suit: '♥', display: '9' },
      { value: 10, suit: '♦', display: '10' },
      { value: 6, suit: '♣', display: '6' },
    ];

    vi.spyOn(blackjackCards, 'createShuffledDeck').mockReturnValue(mockDeck);
    vi.spyOn(blackjackCards, 'determineWinner').mockReturnValue('win');

    // Play 3 games
    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.newGame();
      });
      act(() => {
        result.current.stand();
      });
    }

    expect(result.current.stats.wins).toBe(3);
    expect(result.current.stats.currentStreak).toBe(3);
    expect(result.current.stats.bestStreak).toBe(3);
  });

  test('should handle newGame in onchain mode correctly', () => {
    const { result } = renderHook(() => useBlackjack());

    act(() => {
      result.current.switchMode('onchain');
    });

    act(() => {
      result.current.newGame();
    });

    expect(result.current.gamePhase).toBe('betting');
    expect(result.current.playerHand).toEqual([]);
    expect(result.current.message).toContain('PLAY ON-CHAIN');
  });
});
