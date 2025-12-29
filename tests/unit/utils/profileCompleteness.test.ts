/**
 * Tests for Profile Completeness Utility
 *
 * Tests the gamification logic for profile completion tracking including:
 * - Profile completeness calculation with weighted checks
 * - Level badge determination
 * - Motivational message selection
 */

import { describe, it, expect } from 'vitest';
import {
  calculateProfileCompleteness,
  getLevelBadge,
  getMotivationalMessage,
  type ProfileCompletenessResult,
} from '@/lib/utils/profileCompleteness';

describe('Profile Completeness Utility', () => {
  // ============================================================
  // calculateProfileCompleteness()
  // ============================================================

  describe('calculateProfileCompleteness', () => {
    describe('Empty Profile', () => {
      it('should return 0% for completely empty profile', () => {
        const result = calculateProfileCompleteness({});

        expect(result.percentage).toBe(0);
        expect(result.completedChecks).toBe(0);
        expect(result.totalChecks).toBe(6);
        expect(result.level).toBe('beginner');
        expect(result.nextAction).toBeDefined();
        expect(result.checks).toHaveLength(6);
        expect(result.checks.every((c) => !c.completed)).toBe(true);
      });
    });

    describe('Display Name Check (15 points)', () => {
      it('should mark display_name complete when different from username', () => {
        const result = calculateProfileCompleteness({
          username: 'user123',
          display_name: 'Cool Player',
        });

        const displayNameCheck = result.checks.find((c) => c.id === 'display_name');
        expect(displayNameCheck?.completed).toBe(true);
        expect(result.percentage).toBe(15); // 15/100
      });

      it('should mark display_name incomplete when same as username', () => {
        const result = calculateProfileCompleteness({
          username: 'user123',
          display_name: 'user123',
        });

        const displayNameCheck = result.checks.find((c) => c.id === 'display_name');
        expect(displayNameCheck?.completed).toBe(false);
      });

      it('should mark display_name incomplete when missing', () => {
        const result = calculateProfileCompleteness({
          username: 'user123',
        });

        const displayNameCheck = result.checks.find((c) => c.id === 'display_name');
        expect(displayNameCheck?.completed).toBe(false);
      });
    });

    describe('Custom Avatar Check (15 points)', () => {
      it('should mark complete for predefined avatar', () => {
        const result = calculateProfileCompleteness({
          avatar_type: 'predefined',
        });

        const avatarCheck = result.checks.find((c) => c.id === 'custom_avatar');
        expect(avatarCheck?.completed).toBe(true);
        expect(result.percentage).toBe(15);
      });

      it('should mark complete for custom avatar', () => {
        const result = calculateProfileCompleteness({
          avatar_type: 'custom',
        });

        const avatarCheck = result.checks.find((c) => c.id === 'custom_avatar');
        expect(avatarCheck?.completed).toBe(true);
      });

      it('should mark incomplete for default avatar', () => {
        const result = calculateProfileCompleteness({
          avatar_type: 'default',
        });

        const avatarCheck = result.checks.find((c) => c.id === 'custom_avatar');
        expect(avatarCheck?.completed).toBe(false);
      });
    });

    describe('Bio Check (15 points)', () => {
      it('should mark complete for bio with 20+ characters', () => {
        const result = calculateProfileCompleteness({
          bio: 'I love playing games and competing!',
        });

        const bioCheck = result.checks.find((c) => c.id === 'bio');
        expect(bioCheck?.completed).toBe(true);
        expect(result.percentage).toBe(15);
      });

      it('should mark complete for bio with exactly 20 characters', () => {
        const result = calculateProfileCompleteness({
          bio: '12345678901234567890', // exactly 20
        });

        const bioCheck = result.checks.find((c) => c.id === 'bio');
        expect(bioCheck?.completed).toBe(true);
      });

      it('should mark incomplete for bio with < 20 characters', () => {
        const result = calculateProfileCompleteness({
          bio: 'Short bio',
        });

        const bioCheck = result.checks.find((c) => c.id === 'bio');
        expect(bioCheck?.completed).toBe(false);
      });

      it('should mark incomplete for bio with only whitespace', () => {
        const result = calculateProfileCompleteness({
          bio: '                    ', // 20 spaces
        });

        const bioCheck = result.checks.find((c) => c.id === 'bio');
        expect(bioCheck?.completed).toBe(false);
      });
    });

    describe('Social Link Check (15 points)', () => {
      it('should mark complete with Twitter link', () => {
        const result = calculateProfileCompleteness({
          social_links: {
            twitter: '@user',
          },
        });

        const socialCheck = result.checks.find((c) => c.id === 'social_link');
        expect(socialCheck?.completed).toBe(true);
        expect(result.percentage).toBe(15);
      });

      it('should mark complete with Farcaster link', () => {
        const result = calculateProfileCompleteness({
          social_links: {
            farcaster: 'user.eth',
          },
        });

        const socialCheck = result.checks.find((c) => c.id === 'social_link');
        expect(socialCheck?.completed).toBe(true);
      });

      it('should mark complete with Discord link', () => {
        const result = calculateProfileCompleteness({
          social_links: {
            discord: 'user#1234',
          },
        });

        const socialCheck = result.checks.find((c) => c.id === 'social_link');
        expect(socialCheck?.completed).toBe(true);
      });

      it('should mark complete with multiple social links', () => {
        const result = calculateProfileCompleteness({
          social_links: {
            twitter: '@user',
            farcaster: 'user.eth',
            discord: 'user#1234',
          },
        });

        const socialCheck = result.checks.find((c) => c.id === 'social_link');
        expect(socialCheck?.completed).toBe(true);
      });

      it('should mark incomplete with empty social_links object', () => {
        const result = calculateProfileCompleteness({
          social_links: {},
        });

        const socialCheck = result.checks.find((c) => c.id === 'social_link');
        expect(socialCheck?.completed).toBe(false);
      });
    });

    describe('First Game Check (20 points)', () => {
      it('should mark complete when gamesPlayed > 0', () => {
        const result = calculateProfileCompleteness({
          stats: {
            gamesPlayed: 1,
          },
        });

        const gameCheck = result.checks.find((c) => c.id === 'first_game');
        expect(gameCheck?.completed).toBe(true);
        expect(result.percentage).toBe(20);
      });

      it('should mark complete for many games played', () => {
        const result = calculateProfileCompleteness({
          stats: {
            gamesPlayed: 100,
          },
        });

        const gameCheck = result.checks.find((c) => c.id === 'first_game');
        expect(gameCheck?.completed).toBe(true);
      });

      it('should mark incomplete when gamesPlayed is 0', () => {
        const result = calculateProfileCompleteness({
          stats: {
            gamesPlayed: 0,
          },
        });

        const gameCheck = result.checks.find((c) => c.id === 'first_game');
        expect(gameCheck?.completed).toBe(false);
      });
    });

    describe('Points Milestone Check (20 points)', () => {
      it('should mark complete when total_points >= 100', () => {
        const result = calculateProfileCompleteness({
          total_points: 100,
        });

        const pointsCheck = result.checks.find((c) => c.id === 'points_milestone');
        expect(pointsCheck?.completed).toBe(true);
        expect(result.percentage).toBe(20);
      });

      it('should mark complete for points > 100', () => {
        const result = calculateProfileCompleteness({
          total_points: 500,
        });

        const pointsCheck = result.checks.find((c) => c.id === 'points_milestone');
        expect(pointsCheck?.completed).toBe(true);
      });

      it('should mark incomplete for points < 100', () => {
        const result = calculateProfileCompleteness({
          total_points: 99,
        });

        const pointsCheck = result.checks.find((c) => c.id === 'points_milestone');
        expect(pointsCheck?.completed).toBe(false);
      });
    });

    describe('Level Determination', () => {
      it('should return "complete" level at 100%', () => {
        const result = calculateProfileCompleteness({
          username: 'user',
          display_name: 'Cool Player',
          avatar_type: 'custom',
          bio: 'I love playing games and competing on the leaderboard!',
          social_links: { twitter: '@user' },
          stats: { gamesPlayed: 50 },
          total_points: 500,
        });

        expect(result.percentage).toBe(100);
        expect(result.completedChecks).toBe(6);
        expect(result.level).toBe('complete');
      });

      it('should return "advanced" level at 70-99%', () => {
        // Complete 5/6 checks = 80 points (80%)
        const result = calculateProfileCompleteness({
          username: 'user',
          display_name: 'Cool Player',
          avatar_type: 'custom',
          bio: 'I love playing games!',
          social_links: { twitter: '@user' },
          stats: { gamesPlayed: 50 },
          // Missing: total_points >= 100
        });

        expect(result.percentage).toBe(80);
        expect(result.level).toBe('advanced');
      });

      it('should return "intermediate" level at 40-69%', () => {
        // Complete 3/6 checks (display_name, bio, first_game) = 50 points (50%)
        const result = calculateProfileCompleteness({
          username: 'user',
          display_name: 'Cool Player',
          bio: 'I love playing games!',
          stats: { gamesPlayed: 5 },
        });

        expect(result.percentage).toBe(50);
        expect(result.level).toBe('intermediate');
      });

      it('should return "beginner" level at <40%', () => {
        // Complete 1/6 checks (first_game) = 20 points (20%)
        const result = calculateProfileCompleteness({
          stats: { gamesPlayed: 1 },
        });

        expect(result.percentage).toBe(20);
        expect(result.level).toBe('beginner');
      });
    });

    describe('Next Action', () => {
      it('should suggest first incomplete action', () => {
        const result = calculateProfileCompleteness({
          // Complete first 2 checks, leave display_name incomplete
          avatar_type: 'custom',
          bio: 'I love playing games!',
        });

        expect(result.nextAction).toBeDefined();
        // First incomplete check is display_name
        const firstIncomplete = result.checks.find((c) => !c.completed);
        expect(result.nextAction).toBe(firstIncomplete?.description);
      });

      it('should return undefined when all checks complete', () => {
        const result = calculateProfileCompleteness({
          username: 'user',
          display_name: 'Cool Player',
          avatar_type: 'custom',
          bio: 'I love playing games!',
          social_links: { twitter: '@user' },
          stats: { gamesPlayed: 50 },
          total_points: 500,
        });

        expect(result.nextAction).toBeUndefined();
      });
    });

    describe('Weight Calculation', () => {
      it('should correctly calculate weighted percentage', () => {
        // Complete only the 20-point checks (40%)
        const result = calculateProfileCompleteness({
          stats: { gamesPlayed: 10 },
          total_points: 200,
        });

        expect(result.percentage).toBe(40); // 40/100
        expect(result.completedChecks).toBe(2);
      });

      it('should have total weight of 100', () => {
        const result = calculateProfileCompleteness({});
        const totalWeight = result.checks.reduce((sum, check) => sum + check.weight, 0);
        expect(totalWeight).toBe(100);
      });
    });

    describe('Translation Support', () => {
      it('should use translation function when provided', () => {
        const mockT = (key: string) => `TRANSLATED_${key}`;

        const result = calculateProfileCompleteness({}, mockT);

        expect(result.checks[0].label).toBe('TRANSLATED_profile.completion.displayName');
        expect(result.checks[0].description).toBe('TRANSLATED_profile.completion.displayNameDesc');
      });

      it('should use default labels when translation not provided', () => {
        const result = calculateProfileCompleteness({});

        expect(result.checks[0].label).toBe('Nom affiché défini');
        expect(result.checks[0].description).toContain('Ajoutez un nom d\'affichage');
      });
    });
  });

  // ============================================================
  // getLevelBadge()
  // ============================================================

  describe('getLevelBadge', () => {
    it('should return trophy badge for complete level', () => {
      const badge = getLevelBadge('complete');

      expect(badge.emoji).toBe('🏆');
      expect(badge.text).toBe('Profil Complet');
      expect(badge.color).toBe('text-yellow-600');
    });

    it('should return star badge for advanced level', () => {
      const badge = getLevelBadge('advanced');

      expect(badge.emoji).toBe('⭐');
      expect(badge.text).toBe('Avancé');
      expect(badge.color).toBe('text-blue-600');
    });

    it('should return chart badge for intermediate level', () => {
      const badge = getLevelBadge('intermediate');

      expect(badge.emoji).toBe('📈');
      expect(badge.text).toBe('Intermédiaire');
      expect(badge.color).toBe('text-green-600');
    });

    it('should return seedling badge for beginner level', () => {
      const badge = getLevelBadge('beginner');

      expect(badge.emoji).toBe('🌱');
      expect(badge.text).toBe('Débutant');
      expect(badge.color).toBe('text-gray-600');
    });

    it('should use translation function when provided', () => {
      const mockT = (key: string) => `TRANSLATED_${key}`;

      const badge = getLevelBadge('complete', mockT);

      expect(badge.emoji).toBe('🏆');
      expect(badge.text).toBe('TRANSLATED_profile.completion.levelComplete');
    });
  });

  // ============================================================
  // getMotivationalMessage()
  // ============================================================

  describe('getMotivationalMessage', () => {
    it('should return celebration message at 100%', () => {
      const message = getMotivationalMessage(100);

      expect(message).toBe('Félicitations! Votre profil est parfait! 🎉');
    });

    it('should return excellent message at 80-99%', () => {
      const message80 = getMotivationalMessage(80);
      const message99 = getMotivationalMessage(99);

      expect(message80).toBe('Excellent! Encore quelques détails et c\'est parfait!');
      expect(message99).toBe('Excellent! Encore quelques détails et c\'est parfait!');
    });

    it('should return very good message at 60-79%', () => {
      const message60 = getMotivationalMessage(60);
      const message79 = getMotivationalMessage(79);

      expect(message60).toBe('Très bien! Vous êtes sur la bonne voie!');
      expect(message79).toBe('Très bien! Vous êtes sur la bonne voie!');
    });

    it('should return good start message at 40-59%', () => {
      const message40 = getMotivationalMessage(40);
      const message59 = getMotivationalMessage(59);

      expect(message40).toBe('Bon début! Continuez à compléter votre profil!');
      expect(message59).toBe('Bon début! Continuez à compléter votre profil!');
    });

    it('should return beginning message at 20-39%', () => {
      const message20 = getMotivationalMessage(20);
      const message39 = getMotivationalMessage(39);

      expect(message20).toBe('C\'est un début! Complétez quelques actions pour améliorer votre profil.');
      expect(message39).toBe('C\'est un début! Complétez quelques actions pour améliorer votre profil.');
    });

    it('should return welcome message at 0-19%', () => {
      const message0 = getMotivationalMessage(0);
      const message19 = getMotivationalMessage(19);

      expect(message0).toBe('Bienvenue! Commencez par compléter votre profil.');
      expect(message19).toBe('Bienvenue! Commencez par compléter votre profil.');
    });

    it('should use translation function when provided', () => {
      const mockT = (key: string) => `TRANSLATED_${key}`;

      const message = getMotivationalMessage(100, mockT);

      expect(message).toBe('TRANSLATED_profile.completion.msg100');
    });

    it('should handle edge case percentages', () => {
      expect(getMotivationalMessage(0)).toBe('Bienvenue! Commencez par compléter votre profil.');
      expect(getMotivationalMessage(100)).toBe('Félicitations! Votre profil est parfait! 🎉');
    });
  });

  // ============================================================
  // Integration Tests
  // ============================================================

  describe('Integration Tests', () => {
    it('should calculate correct level and message for typical beginner profile', () => {
      const profile = {
        stats: { gamesPlayed: 5 },
      };

      const result = calculateProfileCompleteness(profile);
      const badge = getLevelBadge(result.level);
      const message = getMotivationalMessage(result.percentage);

      expect(result.level).toBe('beginner');
      expect(badge.emoji).toBe('🌱');
      expect(message).toBe('C\'est un début! Complétez quelques actions pour améliorer votre profil.');
    });

    it('should calculate correct level and message for intermediate profile', () => {
      const profile = {
        username: 'user',
        display_name: 'Cool Player',
        bio: 'I love gaming and competition!',
        stats: { gamesPlayed: 20 },
      };

      const result = calculateProfileCompleteness(profile);
      const badge = getLevelBadge(result.level);
      const message = getMotivationalMessage(result.percentage);

      expect(result.level).toBe('intermediate');
      expect(result.percentage).toBe(50);
      expect(badge.emoji).toBe('📈');
      expect(message).toBe('Bon début! Continuez à compléter votre profil!');
    });

    it('should calculate correct level and message for advanced profile', () => {
      const profile = {
        username: 'user',
        display_name: 'Cool Player',
        avatar_type: 'custom' as const,
        bio: 'Passionate gamer and competitor!',
        social_links: { twitter: '@user' },
        stats: { gamesPlayed: 100 },
        // Missing: total_points >= 100
      };

      const result = calculateProfileCompleteness(profile);
      const badge = getLevelBadge(result.level);
      const message = getMotivationalMessage(result.percentage);

      expect(result.level).toBe('advanced');
      expect(result.percentage).toBe(80);
      expect(badge.emoji).toBe('⭐');
      expect(message).toBe('Excellent! Encore quelques détails et c\'est parfait!');
    });

    it('should calculate correct level and message for complete profile', () => {
      const profile = {
        username: 'user',
        display_name: 'Cool Player',
        avatar_type: 'custom' as const,
        bio: 'Passionate gamer and competitor on the leaderboard!',
        social_links: {
          twitter: '@user',
          farcaster: 'user.eth',
        },
        stats: { gamesPlayed: 150 },
        total_points: 1000,
      };

      const result = calculateProfileCompleteness(profile);
      const badge = getLevelBadge(result.level);
      const message = getMotivationalMessage(result.percentage);

      expect(result.level).toBe('complete');
      expect(result.percentage).toBe(100);
      expect(result.completedChecks).toBe(6);
      expect(badge.emoji).toBe('🏆');
      expect(badge.text).toBe('Profil Complet');
      expect(message).toBe('Félicitations! Votre profil est parfait! 🎉');
      expect(result.nextAction).toBeUndefined();
    });
  });
});
