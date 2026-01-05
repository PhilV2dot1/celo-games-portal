import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerStats } from '@/components/snake/PlayerStats';
import type { PlayerStats as Stats } from '@/hooks/useSnake';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>{children}</div>
    ),
  },
}));

/**
 * PlayerStats Component Tests
 *
 * Tests for the Snake player statistics component that displays:
 * - Games played
 * - High score
 * - Average score
 * - Total food eaten
 */

describe('PlayerStats', () => {
  const createStats = (
    games: number,
    highScore: number,
    totalScore: number,
    totalFood: number
  ): Stats => ({
    games,
    highScore,
    totalScore,
    totalFood,
  });

  // ========================================
  // INITIAL STATE
  // ========================================

  describe('Initial State', () => {
    test('should display zero stats for new player', () => {
      const stats = createStats(0, 0, 0, 0);

      render(<PlayerStats stats={stats} />);

      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0); // games, highScore, avgScore, totalFood
      expect(screen.getByText('Games Played')).toBeInTheDocument();
    });

    test('should render all stat labels', () => {
      const stats = createStats(0, 0, 0, 0);

      render(<PlayerStats stats={stats} />);

      expect(screen.getByText('Games Played')).toBeInTheDocument();
      expect(screen.getByText('High Score')).toBeInTheDocument();
      expect(screen.getByText('Avg Score')).toBeInTheDocument();
      expect(screen.getByText('Total Food')).toBeInTheDocument();
    });
  });

  // ========================================
  // GAMES PLAYED
  // ========================================

  describe('Games Played', () => {
    test('should display zero games', () => {
      const stats = createStats(0, 0, 0, 0);

      render(<PlayerStats stats={stats} />);

      const gamesValues = screen.getAllByText('0');
      expect(gamesValues.length).toBeGreaterThan(0);
    });

    test('should display single game', () => {
      const stats = createStats(1, 50, 50, 5);

      render(<PlayerStats stats={stats} />);

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    test('should display multiple games', () => {
      const stats = createStats(25, 200, 3000, 250);

      render(<PlayerStats stats={stats} />);

      expect(screen.getByText('25')).toBeInTheDocument();
    });

    test('should display high number of games', () => {
      const stats = createStats(1000, 500, 150000, 15000);

      render(<PlayerStats stats={stats} />);

      expect(screen.getByText('1000')).toBeInTheDocument();
    });
  });

  // ========================================
  // HIGH SCORE
  // ========================================

  describe('High Score', () => {
    test('should display zero high score', () => {
      const stats = createStats(0, 0, 0, 0);

      render(<PlayerStats stats={stats} />);

      const zeroValues = screen.getAllByText('0');
      expect(zeroValues.length).toBeGreaterThan(0);
    });

    test('should display low high score', () => {
      const stats = createStats(5, 30, 100, 10);

      render(<PlayerStats stats={stats} />);

      expect(screen.getByText('30')).toBeInTheDocument();
    });

    test('should display medium high score', () => {
      const stats = createStats(10, 150, 1000, 100);

      render(<PlayerStats stats={stats} />);

      expect(screen.getByText('150')).toBeInTheDocument();
    });

    test('should display very high score', () => {
      const stats = createStats(50, 999, 25000, 2500);

      render(<PlayerStats stats={stats} />);

      expect(screen.getByText('999')).toBeInTheDocument();
    });
  });

  // ========================================
  // AVERAGE SCORE
  // ========================================

  describe('Average Score', () => {
    test('should calculate and display average score', () => {
      const stats = createStats(5, 100, 300, 30);
      // Average = 300 / 5 = 60

      render(<PlayerStats stats={stats} />);

      expect(screen.getByText('60')).toBeInTheDocument();
    });

    test('should round average score', () => {
      const stats = createStats(3, 100, 250, 25);
      // Average = 250 / 3 = 83.33... → 83

      render(<PlayerStats stats={stats} />);

      expect(screen.getByText('83')).toBeInTheDocument();
    });

    test('should show 0 average when no games played', () => {
      const stats = createStats(0, 0, 0, 0);

      render(<PlayerStats stats={stats} />);

      const zeroValues = screen.getAllByText('0');
      expect(zeroValues.length).toBeGreaterThan(0);
    });

    test('should handle perfect average (no rounding)', () => {
      const stats = createStats(10, 200, 1000, 100);
      // Average = 1000 / 10 = 100

      render(<PlayerStats stats={stats} />);

      const hundredElements = screen.getAllByText('100');
      expect(hundredElements.length).toBeGreaterThan(0);
    });
  });

  // ========================================
  // TOTAL FOOD
  // ========================================

  describe('Total Food', () => {
    test('should display zero food eaten', () => {
      const stats = createStats(0, 0, 0, 0);

      render(<PlayerStats stats={stats} />);

      const zeroValues = screen.getAllByText('0');
      expect(zeroValues.length).toBeGreaterThan(0);
    });

    test('should display small amount of food', () => {
      const stats = createStats(2, 50, 100, 10);

      render(<PlayerStats stats={stats} />);

      expect(screen.getByText('10')).toBeInTheDocument();
    });

    test('should display large amount of food', () => {
      const stats = createStats(100, 500, 25000, 2500);

      render(<PlayerStats stats={stats} />);

      expect(screen.getByText('2500')).toBeInTheDocument();
    });
  });

  // ========================================
  // STAT UPDATES
  // ========================================

  describe('Stat Updates', () => {
    test('should update when stats change', () => {
      const initialStats = createStats(5, 100, 300, 30);
      const { rerender } = render(<PlayerStats stats={initialStats} />);

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();

      const updatedStats = createStats(6, 120, 420, 42);
      rerender(<PlayerStats stats={updatedStats} />);

      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    test('should update average when total score changes', () => {
      const initialStats = createStats(5, 100, 300, 30);
      // Initial average = 60

      const { rerender } = render(<PlayerStats stats={initialStats} />);
      expect(screen.getByText('60')).toBeInTheDocument();

      const updatedStats = createStats(5, 100, 400, 40);
      // New average = 80

      rerender(<PlayerStats stats={updatedStats} />);
      expect(screen.getByText('80')).toBeInTheDocument();
      expect(screen.queryByText('60')).not.toBeInTheDocument();
    });
  });

  // ========================================
  // LAYOUT & STYLING
  // ========================================

  describe('Layout & Styling', () => {
    test('should render stats in grid layout', () => {
      const stats = createStats(10, 150, 1000, 100);

      const { container } = render(<PlayerStats stats={stats} />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    test('should have title "Your Stats"', () => {
      const stats = createStats(5, 100, 300, 30);

      render(<PlayerStats stats={stats} />);

      expect(screen.getByText('Your Stats')).toBeInTheDocument();
    });

    test('should apply proper styling classes', () => {
      const stats = createStats(5, 100, 300, 30);

      const { container } = render(<PlayerStats stats={stats} />);

      const statsContainer = container.firstChild as HTMLElement;
      expect(statsContainer.className).toContain('bg-white');
      expect(statsContainer.className).toContain('rounded');
    });
  });

  // ========================================
  // EDGE CASES
  // ========================================

  describe('Edge Cases', () => {
    test('should handle division by zero in average calculation', () => {
      const stats = createStats(0, 0, 0, 0);

      render(<PlayerStats stats={stats} />);

      // Should not crash and should show 0
      const zeroValues = screen.getAllByText('0');
      expect(zeroValues.length).toBeGreaterThan(0);
    });

    test('should handle very large numbers', () => {
      const stats = createStats(99999, 99999, 9999999, 999999);

      render(<PlayerStats stats={stats} />);

      const largeNumber1 = screen.getAllByText('99999');
      const largeNumber2 = screen.getAllByText('999999');
      expect(largeNumber1.length).toBeGreaterThan(0);
      expect(largeNumber2.length).toBeGreaterThan(0);
    });

    test('should handle stats with high score lower than average', () => {
      // This shouldn't happen in normal gameplay, but test robustness
      const stats = createStats(3, 50, 300, 30);
      // Average = 100, but high score = 50

      render(<PlayerStats stats={stats} />);

      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  // ========================================
  // REAL WORLD SCENARIOS
  // ========================================

  describe('Real World Scenarios', () => {
    test('should display stats for beginner player', () => {
      const stats = createStats(3, 40, 90, 9);

      render(<PlayerStats stats={stats} />);

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('40')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument(); // average
      expect(screen.getByText('9')).toBeInTheDocument();
    });

    test('should display stats for intermediate player', () => {
      const stats = createStats(25, 200, 3000, 300);

      render(<PlayerStats stats={stats} />);

      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument(); // average
      expect(screen.getByText('300')).toBeInTheDocument();
    });

    test('should display stats for expert player', () => {
      const stats = createStats(100, 500, 30000, 3000);

      render(<PlayerStats stats={stats} />);

      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText('300')).toBeInTheDocument(); // average
      expect(screen.getByText('3000')).toBeInTheDocument();
    });
  });
});
