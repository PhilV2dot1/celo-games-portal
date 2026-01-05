import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameStatus } from '@/components/snake/GameStatus';
import type { GameStatus as Status } from '@/hooks/useSnake';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>{children}</div>
    ),
  },
}));

/**
 * GameStatus Component Tests
 *
 * Tests for the Snake game status component that displays:
 * - Current game message
 * - Game status (idle, playing, processing, gameover)
 * - Current score
 * - Status-specific styling
 */

describe('GameStatus', () => {
  // ========================================
  // MESSAGE DISPLAY
  // ========================================

  describe('Message Display', () => {
    test('should display initial message', () => {
      render(
        <GameStatus
          message="Press Start to begin!"
          status="idle"
          score={0}
        />
      );

      expect(screen.getByText('Press Start to begin!')).toBeInTheDocument();
    });

    test('should display playing message', () => {
      render(
        <GameStatus
          message="Use arrow keys or WASD to move"
          status="playing"
          score={50}
        />
      );

      expect(screen.getByText('Use arrow keys or WASD to move')).toBeInTheDocument();
    });

    test('should display game over message', () => {
      render(
        <GameStatus
          message="Game Over! You crashed!"
          status="gameover"
          score={150}
        />
      );

      expect(screen.getByText('Game Over! You crashed!')).toBeInTheDocument();
    });

    test('should display processing message', () => {
      render(
        <GameStatus
          message="Recording score on blockchain..."
          status="processing"
          score={100}
        />
      );

      expect(screen.getByText('Recording score on blockchain...')).toBeInTheDocument();
    });

    test('should update message dynamically', () => {
      const { rerender } = render(
        <GameStatus
          message="Initial message"
          status="idle"
          score={0}
        />
      );

      expect(screen.getByText('Initial message')).toBeInTheDocument();

      rerender(
        <GameStatus
          message="Updated message"
          status="playing"
          score={10}
        />
      );

      expect(screen.getByText('Updated message')).toBeInTheDocument();
      expect(screen.queryByText('Initial message')).not.toBeInTheDocument();
    });
  });

  // ========================================
  // SCORE DISPLAY
  // ========================================

  describe('Score Display', () => {
    test('should display score of 0', () => {
      render(
        <GameStatus
          message="Test message"
          status="idle"
          score={0}
        />
      );

      expect(screen.getByText(/Score: 0/)).toBeInTheDocument();
    });

    test('should display positive score', () => {
      render(
        <GameStatus
          message="Test message"
          status="playing"
          score={50}
        />
      );

      expect(screen.getByText(/Score: 50/)).toBeInTheDocument();
    });

    test('should display high score', () => {
      render(
        <GameStatus
          message="Test message"
          status="playing"
          score={500}
        />
      );

      expect(screen.getByText(/Score: 500/)).toBeInTheDocument();
    });

    test('should update score dynamically', () => {
      const { rerender } = render(
        <GameStatus
          message="Test message"
          status="playing"
          score={10}
        />
      );

      expect(screen.getByText(/Score: 10/)).toBeInTheDocument();

      rerender(
        <GameStatus
          message="Test message"
          status="playing"
          score={20}
        />
      );

      expect(screen.getByText(/Score: 20/)).toBeInTheDocument();
      expect(screen.queryByText(/Score: 10/)).not.toBeInTheDocument();
    });

    test('should display score after game over', () => {
      render(
        <GameStatus
          message="Game Over!"
          status="gameover"
          score={150}
        />
      );

      expect(screen.getByText(/Score: 150/)).toBeInTheDocument();
    });
  });

  // ========================================
  // STATUS STATES
  // ========================================

  describe('Status States', () => {
    test('should render with idle status', () => {
      const { container } = render(
        <GameStatus
          message="Press Start"
          status="idle"
          score={0}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('should render with playing status', () => {
      const { container } = render(
        <GameStatus
          message="Playing..."
          status="playing"
          score={50}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('should render with processing status', () => {
      const { container } = render(
        <GameStatus
          message="Processing..."
          status="processing"
          score={100}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('should render with gameover status', () => {
      const { container } = render(
        <GameStatus
          message="Game Over!"
          status="gameover"
          score={150}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  // ========================================
  // STYLING
  // ========================================

  describe('Styling', () => {
    test('should apply correct classes for idle status', () => {
      const { container } = render(
        <GameStatus
          message="Press Start"
          status="idle"
          score={0}
        />
      );

      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain('bg-gradient-to-r');
    });

    test('should apply correct classes for playing status', () => {
      const { container } = render(
        <GameStatus
          message="Playing"
          status="playing"
          score={50}
        />
      );

      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain('bg-gradient-to-r');
    });

    test('should apply correct classes for processing status', () => {
      const { container } = render(
        <GameStatus
          message="Processing"
          status="processing"
          score={100}
        />
      );

      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain('bg-gradient-to-r');
    });

    test('should apply correct classes for gameover status', () => {
      const { container } = render(
        <GameStatus
          message="Game Over"
          status="gameover"
          score={150}
        />
      );

      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain('bg-gradient-to-r');
    });
  });

  // ========================================
  // EDGE CASES
  // ========================================

  describe('Edge Cases', () => {
    test('should handle empty message', () => {
      render(
        <GameStatus
          message=""
          status="idle"
          score={0}
        />
      );

      expect(screen.getByText(/Score: 0/)).toBeInTheDocument();
    });

    test('should handle very long message', () => {
      const longMessage = 'This is a very long message that might wrap to multiple lines in the display';

      render(
        <GameStatus
          message={longMessage}
          status="playing"
          score={50}
        />
      );

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    test('should handle special characters in message', () => {
      const specialMessage = "🎮 Great! You're doing awesome! 🐍";

      render(
        <GameStatus
          message={specialMessage}
          status="playing"
          score={100}
        />
      );

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    test('should handle very high scores', () => {
      render(
        <GameStatus
          message="Amazing!"
          status="playing"
          score={99999}
        />
      );

      expect(screen.getByText(/Score: 99999/)).toBeInTheDocument();
    });
  });

  // ========================================
  // LAYOUT
  // ========================================

  describe('Layout', () => {
    test('should display message and score in same container', () => {
      render(
        <GameStatus
          message="Test message"
          status="playing"
          score={50}
        />
      );

      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByText(/Score: 50/)).toBeInTheDocument();
    });

    test('should use flexbox layout', () => {
      const { container } = render(
        <GameStatus
          message="Test"
          status="playing"
          score={50}
        />
      );

      const flexContainer = container.querySelector('.flex');
      expect(flexContainer).toBeInTheDocument();
    });
  });
});
