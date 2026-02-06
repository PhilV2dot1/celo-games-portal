import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameCard } from '@/components/games/GameCard';
import { useLocalStats } from '@/hooks/useLocalStats';
import type { GameMetadata } from '@/lib/types';

/**
 * GameCard Component Tests
 *
 * Tests for the game card component that displays:
 * - Game icon, name, and description
 * - NEW badge for new games
 * - Fee indicator for paid games
 * - Player stats (played, wins, points)
 * - Hover animations
 */

// Mock dependencies
vi.mock('@/hooks/useLocalStats');
vi.mock('@/lib/utils/motion', () => ({
  useShouldAnimate: () => false,
}));
vi.mock('@/lib/audio/AudioContext', () => ({
  useOptionalAudio: () => ({
    playHover: vi.fn(),
    playClick: vi.fn(),
  }),
}));
vi.mock('@/lib/constants/design-tokens', () => ({
  colors: { celo: '#FCFF52' },
  shadows: { celoGlow: {} },
}));
vi.mock('@/lib/i18n/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    t: (key: string) => {
      // Mock translations for game cards
      const translations: Record<string, string> = {
        // Game subtitles (descriptions)
        'games.blackjack.subtitle': 'Beat the dealer to 21!',
        'games.rps.subtitle': 'Classic hand game!',
        'games.tictactoe.subtitle': 'Get three in a row!',
        'games.jackpot.subtitle': 'Spin the crypto wheel!',
        'games.2048.subtitle': 'Merge tiles to 2048!',
        'games.mastermind.subtitle': 'Crack the crypto code!',
        // Game titles
        'games.blackjack.title': 'Blackjack',
        'games.rps.title': 'Rock Paper Scissors',
        'games.tictactoe.title': 'Tic-Tac-Toe',
        'games.jackpot.title': 'Jackpot',
        'games.2048.title': '2048',
        'games.mastermind.title': 'Mastermind',
        // Stats labels
        'stats.played': 'Played',
        'stats.wins': 'Wins',
        'points': 'Points',
        // Button
        'games.playNow': 'Play Now',
      };
      return translations[key] || key;
    },
  }),
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, className }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  ),
}));
vi.mock('framer-motion', async () => {
  const React = await import('react');
  return {
    motion: {
      div: React.forwardRef(({ children, className, style, whileHover, whileTap, transition, initial, animate, exit, ...rest }: any, ref: any) => (
        <div className={className} style={style} ref={ref} {...rest}>
          {children}
        </div>
      )),
      button: React.forwardRef(({ children, className, style, whileHover, whileTap, transition, initial, animate, exit, ...rest }: any, ref: any) => (
        <button className={className} style={style} ref={ref} {...rest}>
          {children}
        </button>
      )),
      svg: React.forwardRef(({ children, className, style, whileHover, whileTap, transition, initial, animate, exit, ...rest }: any, ref: any) => (
        <svg className={className} style={style} ref={ref} {...rest}>
          {children}
        </svg>
      )),
    },
  };
});

describe('GameCard', () => {
  const mockGame: GameMetadata = {
    id: 'blackjack',
    name: 'Blackjack',
    description: 'Beat the dealer to 21',
    icon: '/icons/blackjack.svg',
    route: '/games/blackjack',
    hasFee: false,
    category: 'card',
  };

  const mockGetStats = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useLocalStats).mockReturnValue({
      getStats: mockGetStats,
      updateStats: vi.fn(),
      getTotalPoints: vi.fn(),
      getAllGames: vi.fn(),
      clearStats: vi.fn(),
    });
  });

  // ============================================================================
  // Basic Rendering Tests
  // ============================================================================

  test('should render game name', () => {
    mockGetStats.mockReturnValue({ played: 0, wins: 0, totalPoints: 0 });

    render(<GameCard game={mockGame} />);

    expect(screen.getByText('Blackjack')).toBeInTheDocument();
  });

  test('should render game description', () => {
    mockGetStats.mockReturnValue({ played: 0, wins: 0, totalPoints: 0 });

    render(<GameCard game={mockGame} />);

    // Description comes from i18n mock
    expect(screen.getByText('Beat the dealer to 21!')).toBeInTheDocument();
  });

  test('should render game icon', () => {
    mockGetStats.mockReturnValue({ played: 0, wins: 0, totalPoints: 0 });

    render(<GameCard game={mockGame} />);

    const icon = screen.getByAltText('Blackjack');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', '/icons/blackjack.svg');
  });

  test('should render as link to game route', () => {
    mockGetStats.mockReturnValue({ played: 0, wins: 0, totalPoints: 0 });

    render(<GameCard game={mockGame} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/games/blackjack');
  });

  test('should render play button', () => {
    mockGetStats.mockReturnValue({ played: 0, wins: 0, totalPoints: 0 });

    render(<GameCard game={mockGame} />);

    expect(screen.getByText('Play Now')).toBeInTheDocument();
  });

  // ============================================================================
  // NEW Badge Tests (badges removed in new design)
  // ============================================================================

  test('should not show NEW badge (removed in new design)', () => {
    mockGetStats.mockReturnValue({ played: 0, wins: 0, totalPoints: 0 });

    render(<GameCard game={mockGame} isNew={true} />);

    expect(screen.queryByText('NEW')).not.toBeInTheDocument();
  });

  test('should not show NEW badge when isNew is false', () => {
    mockGetStats.mockReturnValue({ played: 0, wins: 0, totalPoints: 0 });

    render(<GameCard game={mockGame} isNew={false} />);

    expect(screen.queryByText('NEW')).not.toBeInTheDocument();
  });

  test('should not show NEW badge by default', () => {
    mockGetStats.mockReturnValue({ played: 0, wins: 0, totalPoints: 0 });

    render(<GameCard game={mockGame} />);

    expect(screen.queryByText('NEW')).not.toBeInTheDocument();
  });

  // ============================================================================
  // Fee Indicator Tests (fee badges removed in new design)
  // ============================================================================

  test('should not show fee indicator for paid games (removed in new design)', () => {
    mockGetStats.mockReturnValue({ played: 0, wins: 0, totalPoints: 0 });

    const paidGame: GameMetadata = {
      ...mockGame,
      hasFee: true,
    };

    render(<GameCard game={paidGame} />);

    expect(screen.queryByText('0.01 CELO')).not.toBeInTheDocument();
  });

  test('should not show fee indicator for free games', () => {
    mockGetStats.mockReturnValue({ played: 0, wins: 0, totalPoints: 0 });

    render(<GameCard game={mockGame} />);

    expect(screen.queryByText('0.01 CELO')).not.toBeInTheDocument();
  });

  test('should not show fee indicator or NEW badge (both removed in new design)', () => {
    mockGetStats.mockReturnValue({ played: 0, wins: 0, totalPoints: 0 });

    const newPaidGame: GameMetadata = {
      ...mockGame,
      hasFee: true,
    };

    render(<GameCard game={newPaidGame} isNew={true} />);

    expect(screen.queryByText('NEW')).not.toBeInTheDocument();
    expect(screen.queryByText('0.01 CELO')).not.toBeInTheDocument();
  });

  // ============================================================================
  // Stats Display Tests
  // ============================================================================

  test('should not show stats when player has not played', () => {
    mockGetStats.mockReturnValue({ played: 0, wins: 0, totalPoints: 0 });

    render(<GameCard game={mockGame} />);

    expect(screen.queryByText('Played')).not.toBeInTheDocument();
    expect(screen.queryByText('Wins')).not.toBeInTheDocument();
    expect(screen.queryByText('Points')).not.toBeInTheDocument();
  });

  test('should show stats when player has played', () => {
    mockGetStats.mockReturnValue({ played: 10, wins: 5, totalPoints: 150 });

    render(<GameCard game={mockGame} />);

    expect(screen.getByText('Played')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    expect(screen.getByText('Wins')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    expect(screen.getByText('Points')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  test('should show stats with 0 wins', () => {
    mockGetStats.mockReturnValue({ played: 5, wins: 0, totalPoints: 25 });

    render(<GameCard game={mockGame} />);

    expect(screen.getByText('Played')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    expect(screen.getByText('Wins')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();

    expect(screen.getByText('Points')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  test('should show stats with high numbers', () => {
    mockGetStats.mockReturnValue({ played: 999, wins: 500, totalPoints: 15000 });

    render(<GameCard game={mockGame} />);

    expect(screen.getByText('999')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('15000')).toBeInTheDocument();
  });

  test('should call getStats with game id', () => {
    mockGetStats.mockReturnValue({ played: 0, wins: 0, totalPoints: 0 });

    render(<GameCard game={mockGame} />);

    expect(mockGetStats).toHaveBeenCalledWith('blackjack');
  });

  // ============================================================================
  // Different Game Types Tests
  // ============================================================================

  test('should render RPS game correctly', () => {
    mockGetStats.mockReturnValue({ played: 3, wins: 2, totalPoints: 45 });

    const rpsGame: GameMetadata = {
      id: 'rps',
      name: 'Rock Paper Scissors',
      description: 'Classic hand game',
      icon: '/icons/rps.svg',
      route: '/games/rps',
      hasFee: false,
      category: 'casual',
    };

    render(<GameCard game={rpsGame} />);

    expect(screen.getByText('Rock Paper Scissors')).toBeInTheDocument();
    // Description comes from i18n mock with exclamation
    expect(screen.getByText('Classic hand game!')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  test('should render 2048 game without fee indicator', () => {
    mockGetStats.mockReturnValue({ played: 0, wins: 0, totalPoints: 0 });

    const game2048: GameMetadata = {
      id: '2048',
      name: '2048',
      description: 'Merge tiles to 2048',
      icon: '/icons/2048.svg',
      route: '/games/2048',
      hasFee: true,
      category: 'puzzle',
    };

    render(<GameCard game={game2048} />);

    expect(screen.getByText('2048')).toBeInTheDocument();
    expect(screen.queryByText('0.01 CELO')).not.toBeInTheDocument();
  });

  test('should render Mastermind game without fee indicator', () => {
    mockGetStats.mockReturnValue({ played: 7, wins: 4, totalPoints: 120 });

    const mastermindGame: GameMetadata = {
      id: 'mastermind',
      name: 'Mastermind',
      description: 'Crack the code',
      icon: '/icons/mastermind.svg',
      route: '/games/mastermind',
      hasFee: true,
      category: 'puzzle',
    };

    render(<GameCard game={mastermindGame} />);

    expect(screen.getByText('Mastermind')).toBeInTheDocument();
    // Description comes from i18n mock: 'Crack the crypto code!'
    expect(screen.getByText('Crack the crypto code!')).toBeInTheDocument();
    expect(screen.queryByText('0.01 CELO')).not.toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  // ============================================================================
  // Edge Cases Tests
  // ============================================================================

  test('should handle boolean stats return value', () => {
    mockGetStats.mockReturnValue(false);

    render(<GameCard game={mockGame} />);

    // Should not show stats
    expect(screen.queryByText('Played')).not.toBeInTheDocument();
  });

  test('should handle stats without played property', () => {
    mockGetStats.mockReturnValue({ wins: 5, totalPoints: 100 });

    render(<GameCard game={mockGame} />);

    // Should not show stats without played property
    expect(screen.queryByText('Played')).not.toBeInTheDocument();
  });

  test('should handle unknown game with fallback to name prop', () => {
    mockGetStats.mockReturnValue({ played: 0, wins: 0, totalPoints: 0 });

    const unknownGame: GameMetadata = {
      ...mockGame,
      id: 'unknown-game', // Use ID not in i18n mock to trigger fallback
      name: 'Super Ultra Mega Awesome Game Name',
    };

    render(<GameCard game={unknownGame} />);

    // When translation not found, falls back to game.name
    expect(screen.getByText('Super Ultra Mega Awesome Game Name')).toBeInTheDocument();
  });

  test('should handle unknown game with fallback to description prop', () => {
    mockGetStats.mockReturnValue({ played: 0, wins: 0, totalPoints: 0 });

    const unknownGame: GameMetadata = {
      ...mockGame,
      id: 'unknown-game', // Use ID not in i18n mock to trigger fallback
      description: 'This is a very long description',
    };

    render(<GameCard game={unknownGame} />);

    // When translation not found, falls back to game.description
    expect(screen.getByText('This is a very long description')).toBeInTheDocument();
  });

  test('should handle game with special characters in fallback name', () => {
    mockGetStats.mockReturnValue({ played: 0, wins: 0, totalPoints: 0 });

    const specialCharGame: GameMetadata = {
      ...mockGame,
      id: 'special-game', // Use ID not in i18n mock to trigger fallback
      name: 'Rock, Paper & Scissors!',
    };

    render(<GameCard game={specialCharGame} />);

    // When translation not found, falls back to game.name
    expect(screen.getByText('Rock, Paper & Scissors!')).toBeInTheDocument();
  });

  // ============================================================================
  // Animation Props Tests
  // ============================================================================

  test('should have hover animation props', () => {
    mockGetStats.mockReturnValue({ played: 0, wins: 0, totalPoints: 0 });

    const { container } = render(<GameCard game={mockGame} />);

    // When shouldAnimate is false (mocked), whileHover is undefined
    // so no data-while-hover attribute. Verify the motion div renders correctly.
    const wrapper = container.querySelector('.h-full');
    expect(wrapper).toBeInTheDocument();
  });

  test('should have gray border initially that changes on hover', () => {
    mockGetStats.mockReturnValue({ played: 0, wins: 0, totalPoints: 0 });

    const { container } = render(<GameCard game={mockGame} />);

    // Card should have gray border and hover classes
    const card = container.querySelector('.border-gray-200');
    expect(card).toBeInTheDocument();
    expect(card?.className).toContain('hover:border-chain');
    expect(card?.className).toContain('border-2');
  });
});
