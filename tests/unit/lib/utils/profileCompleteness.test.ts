import { describe, test, expect } from 'vitest';
import {
  calculateProfileCompleteness,
  getLevelBadge,
  getMotivationalMessage,
  type ProfileCompletenessResult,
} from '@/lib/utils/profileCompleteness';

describe('Profile Completeness Utilities', () => {
  describe('calculateProfileCompleteness', () => {
    test('returns 0% for empty profile', () => {
      const result = calculateProfileCompleteness({});

      expect(result.percentage).toBe(0);
      expect(result.completedChecks).toBe(0);
      expect(result.totalChecks).toBe(6);
      expect(result.level).toBe('beginner');
    });

    test('counts display_name as complete when different from username', () => {
      const result = calculateProfileCompleteness({
        username: 'player123',
        display_name: 'Cool Player',
      });

      const displayNameCheck = result.checks.find(c => c.id === 'display_name');
      expect(displayNameCheck?.completed).toBe(true);
    });

    test('counts display_name as incomplete when same as username', () => {
      const result = calculateProfileCompleteness({
        username: 'player123',
        display_name: 'player123',
      });

      const displayNameCheck = result.checks.find(c => c.id === 'display_name');
      expect(displayNameCheck?.completed).toBe(false);
    });

    test('counts display_name as incomplete when missing', () => {
      const result = calculateProfileCompleteness({
        username: 'player123',
      });

      const displayNameCheck = result.checks.find(c => c.id === 'display_name');
      expect(displayNameCheck?.completed).toBe(false);
    });

    test('counts custom_avatar as complete with predefined avatar', () => {
      const result = calculateProfileCompleteness({
        avatar_type: 'predefined',
      });

      const avatarCheck = result.checks.find(c => c.id === 'custom_avatar');
      expect(avatarCheck?.completed).toBe(true);
    });

    test('counts custom_avatar as complete with custom avatar', () => {
      const result = calculateProfileCompleteness({
        avatar_type: 'custom',
      });

      const avatarCheck = result.checks.find(c => c.id === 'custom_avatar');
      expect(avatarCheck?.completed).toBe(true);
    });

    test('counts custom_avatar as incomplete with default avatar', () => {
      const result = calculateProfileCompleteness({
        avatar_type: 'default',
      });

      const avatarCheck = result.checks.find(c => c.id === 'custom_avatar');
      expect(avatarCheck?.completed).toBe(false);
    });

    test('counts bio as complete when length >= 20', () => {
      const result = calculateProfileCompleteness({
        bio: 'This is a long enough bio to be valid',
      });

      const bioCheck = result.checks.find(c => c.id === 'bio');
      expect(bioCheck?.completed).toBe(true);
    });

    test('counts bio as incomplete when length < 20', () => {
      const result = calculateProfileCompleteness({
        bio: 'Too short',
      });

      const bioCheck = result.checks.find(c => c.id === 'bio');
      expect(bioCheck?.completed).toBe(false);
    });

    test('counts bio as incomplete when empty or whitespace', () => {
      const result1 = calculateProfileCompleteness({ bio: '' });
      const result2 = calculateProfileCompleteness({ bio: '   ' });

      const bioCheck1 = result1.checks.find(c => c.id === 'bio');
      const bioCheck2 = result2.checks.find(c => c.id === 'bio');

      expect(bioCheck1?.completed).toBe(false);
      expect(bioCheck2?.completed).toBe(false);
    });

    test('counts social_link as complete when twitter is set', () => {
      const result = calculateProfileCompleteness({
        social_links: {
          twitter: 'https://twitter.com/user',
        },
      });

      const socialCheck = result.checks.find(c => c.id === 'social_link');
      expect(socialCheck?.completed).toBe(true);
    });

    test('counts social_link as complete when farcaster is set', () => {
      const result = calculateProfileCompleteness({
        social_links: {
          farcaster: 'https://warpcast.com/user',
        },
      });

      const socialCheck = result.checks.find(c => c.id === 'social_link');
      expect(socialCheck?.completed).toBe(true);
    });

    test('counts social_link as complete when discord is set', () => {
      const result = calculateProfileCompleteness({
        social_links: {
          discord: 'user#1234',
        },
      });

      const socialCheck = result.checks.find(c => c.id === 'social_link');
      expect(socialCheck?.completed).toBe(true);
    });

    test('counts social_link as incomplete when all empty', () => {
      const result = calculateProfileCompleteness({
        social_links: {},
      });

      const socialCheck = result.checks.find(c => c.id === 'social_link');
      expect(socialCheck?.completed).toBe(false);
    });

    test('counts first_game as complete when gamesPlayed > 0', () => {
      const result = calculateProfileCompleteness({
        stats: {
          gamesPlayed: 1,
        },
      });

      const gameCheck = result.checks.find(c => c.id === 'first_game');
      expect(gameCheck?.completed).toBe(true);
    });

    test('counts first_game as incomplete when gamesPlayed = 0', () => {
      const result = calculateProfileCompleteness({
        stats: {
          gamesPlayed: 0,
        },
      });

      const gameCheck = result.checks.find(c => c.id === 'first_game');
      expect(gameCheck?.completed).toBe(false);
    });

    test('counts points_milestone as complete when points >= 100', () => {
      const result = calculateProfileCompleteness({
        total_points: 100,
      });

      const pointsCheck = result.checks.find(c => c.id === 'points_milestone');
      expect(pointsCheck?.completed).toBe(true);
    });

    test('counts points_milestone as incomplete when points < 100', () => {
      const result = calculateProfileCompleteness({
        total_points: 99,
      });

      const pointsCheck = result.checks.find(c => c.id === 'points_milestone');
      expect(pointsCheck?.completed).toBe(false);
    });

    test('calculates correct percentage for partial completion', () => {
      const result = calculateProfileCompleteness({
        username: 'player123',
        display_name: 'Cool Player', // 15%
        avatar_type: 'predefined', // 15%
        bio: 'This is a bio that is long enough', // 15%
      });

      expect(result.percentage).toBe(45); // (15 + 15 + 15) / 100 * 100
      expect(result.completedChecks).toBe(3);
    });

    test('calculates 100% for complete profile', () => {
      const result = calculateProfileCompleteness({
        username: 'player123',
        display_name: 'Cool Player',
        avatar_type: 'predefined',
        bio: 'This is a bio that is long enough to be valid',
        social_links: {
          twitter: 'https://twitter.com/user',
        },
        stats: {
          gamesPlayed: 5,
        },
        total_points: 150,
      });

      expect(result.percentage).toBe(100);
      expect(result.completedChecks).toBe(6);
      expect(result.level).toBe('complete');
    });

    test('assigns correct level: beginner (0-39%)', () => {
      const result = calculateProfileCompleteness({
        avatar_type: 'predefined', // 15%
      });

      expect(result.level).toBe('beginner');
      expect(result.percentage).toBeLessThan(40);
    });

    test('assigns correct level: intermediate (40-69%)', () => {
      const result = calculateProfileCompleteness({
        username: 'player123',
        display_name: 'Cool Player', // 15%
        avatar_type: 'predefined', // 15%
        bio: 'This is a bio that is long enough', // 15%
      });

      expect(result.level).toBe('intermediate');
      expect(result.percentage).toBeGreaterThanOrEqual(40);
      expect(result.percentage).toBeLessThan(70);
    });

    test('assigns correct level: advanced (70-99%)', () => {
      const result = calculateProfileCompleteness({
        username: 'player123',
        display_name: 'Cool Player', // 15%
        avatar_type: 'predefined', // 15%
        bio: 'This is a bio that is long enough', // 15%
        social_links: { twitter: 'https://twitter.com/user' }, // 15%
        stats: { gamesPlayed: 1 }, // 20%
      });

      expect(result.level).toBe('advanced');
      expect(result.percentage).toBeGreaterThanOrEqual(70);
      expect(result.percentage).toBeLessThan(100);
    });

    test('assigns correct level: complete (100%)', () => {
      const result = calculateProfileCompleteness({
        username: 'player123',
        display_name: 'Cool Player',
        avatar_type: 'predefined',
        bio: 'This is a bio that is long enough',
        social_links: { twitter: 'https://twitter.com/user' },
        stats: { gamesPlayed: 1 },
        total_points: 100,
      });

      expect(result.level).toBe('complete');
      expect(result.percentage).toBe(100);
    });

    test('provides nextAction as first incomplete check description', () => {
      const result = calculateProfileCompleteness({
        username: 'player123',
      });

      expect(result.nextAction).toBeDefined();
      expect(result.nextAction).toBeTruthy();
      expect(typeof result.nextAction).toBe('string');
    });

    test('nextAction is undefined when profile is complete', () => {
      const result = calculateProfileCompleteness({
        username: 'player123',
        display_name: 'Cool Player',
        avatar_type: 'predefined',
        bio: 'This is a bio that is long enough',
        social_links: { twitter: 'https://twitter.com/user' },
        stats: { gamesPlayed: 1 },
        total_points: 100,
      });

      expect(result.nextAction).toBeUndefined();
    });

    test('includes all 6 checks in result', () => {
      const result = calculateProfileCompleteness({});

      expect(result.checks).toHaveLength(6);
      expect(result.checks.map(c => c.id)).toEqual([
        'display_name',
        'custom_avatar',
        'bio',
        'social_link',
        'first_game',
        'points_milestone',
      ]);
    });

    test('each check has required properties', () => {
      const result = calculateProfileCompleteness({});

      result.checks.forEach(check => {
        expect(check).toHaveProperty('id');
        expect(check).toHaveProperty('label');
        expect(check).toHaveProperty('description');
        expect(check).toHaveProperty('completed');
        expect(check).toHaveProperty('weight');
        expect(typeof check.id).toBe('string');
        expect(typeof check.label).toBe('string');
        expect(typeof check.description).toBe('string');
        expect(typeof check.completed).toBe('boolean');
        expect(typeof check.weight).toBe('number');
      });
    });

    test('weights sum to 100', () => {
      const result = calculateProfileCompleteness({});
      const totalWeight = result.checks.reduce((sum, check) => sum + check.weight, 0);

      expect(totalWeight).toBe(100);
    });

    test('uses translation function when provided', () => {
      const mockT = (key: string) => `TRANSLATED_${key}`;
      const result = calculateProfileCompleteness({}, mockT);

      result.checks.forEach(check => {
        expect(check.label).toContain('TRANSLATED_');
      });
    });

    test('uses default labels when translation function not provided', () => {
      const result = calculateProfileCompleteness({});

      result.checks.forEach(check => {
        expect(check.label).not.toContain('TRANSLATED_');
        expect(check.label.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getLevelBadge', () => {
    test('returns correct badge for complete level', () => {
      const badge = getLevelBadge('complete');

      expect(badge.emoji).toBe('🏆');
      expect(badge.text).toContain('Profil Complet');
      expect(badge.color).toBe('text-yellow-600');
    });

    test('returns correct badge for advanced level', () => {
      const badge = getLevelBadge('advanced');

      expect(badge.emoji).toBe('⭐');
      expect(badge.text).toContain('Avancé');
      expect(badge.color).toBe('text-blue-600');
    });

    test('returns correct badge for intermediate level', () => {
      const badge = getLevelBadge('intermediate');

      expect(badge.emoji).toBe('📈');
      expect(badge.text).toContain('Intermédiaire');
      expect(badge.color).toBe('text-green-600');
    });

    test('returns correct badge for beginner level', () => {
      const badge = getLevelBadge('beginner');

      expect(badge.emoji).toBe('🌱');
      expect(badge.text).toContain('Débutant');
      expect(badge.color).toBe('text-gray-600');
    });

    test('uses translation function when provided', () => {
      const mockT = (key: string) => `TRANSLATED_${key}`;
      const badge = getLevelBadge('complete', mockT);

      expect(badge.text).toContain('TRANSLATED_');
    });

    test('returns object with emoji, text, and color properties', () => {
      const badge = getLevelBadge('advanced');

      expect(badge).toHaveProperty('emoji');
      expect(badge).toHaveProperty('text');
      expect(badge).toHaveProperty('color');
      expect(typeof badge.emoji).toBe('string');
      expect(typeof badge.text).toBe('string');
      expect(typeof badge.color).toBe('string');
    });

    test('all emojis are valid strings', () => {
      const levels: ProfileCompletenessResult['level'][] = [
        'beginner',
        'intermediate',
        'advanced',
        'complete',
      ];

      levels.forEach(level => {
        const badge = getLevelBadge(level);
        expect(badge.emoji.length).toBeGreaterThan(0);
      });
    });

    test('all colors are Tailwind classes', () => {
      const levels: ProfileCompletenessResult['level'][] = [
        'beginner',
        'intermediate',
        'advanced',
        'complete',
      ];

      levels.forEach(level => {
        const badge = getLevelBadge(level);
        expect(badge.color).toMatch(/^text-\w+-\d{3}$/);
      });
    });
  });

  describe('getMotivationalMessage', () => {
    test('returns congratulations for 100%', () => {
      const message = getMotivationalMessage(100);

      expect(message).toContain('Félicitations');
      expect(message).toContain('parfait');
    });

    test('returns excellent message for 80-99%', () => {
      expect(getMotivationalMessage(80)).toContain('Excellent');
      expect(getMotivationalMessage(90)).toContain('Excellent');
      expect(getMotivationalMessage(99)).toContain('Excellent');
    });

    test('returns very good message for 60-79%', () => {
      expect(getMotivationalMessage(60)).toContain('Très bien');
      expect(getMotivationalMessage(70)).toContain('Très bien');
      expect(getMotivationalMessage(79)).toContain('Très bien');
    });

    test('returns good start message for 40-59%', () => {
      expect(getMotivationalMessage(40)).toContain('Bon début');
      expect(getMotivationalMessage(50)).toContain('Bon début');
      expect(getMotivationalMessage(59)).toContain('Bon début');
    });

    test('returns initial message for 20-39%', () => {
      expect(getMotivationalMessage(20)).toContain('début');
      expect(getMotivationalMessage(30)).toContain('début');
      expect(getMotivationalMessage(39)).toContain('début');
    });

    test('returns welcome message for 0-19%', () => {
      expect(getMotivationalMessage(0)).toContain('Bienvenue');
      expect(getMotivationalMessage(10)).toContain('Bienvenue');
      expect(getMotivationalMessage(19)).toContain('Bienvenue');
    });

    test('uses translation function when provided', () => {
      const mockT = (key: string) => `TRANSLATED_${key}`;
      const message = getMotivationalMessage(100, mockT);

      expect(message).toContain('TRANSLATED_');
    });

    test('returns non-empty string for all percentages', () => {
      for (let i = 0; i <= 100; i += 10) {
        const message = getMotivationalMessage(i);
        expect(message.length).toBeGreaterThan(0);
      }
    });

    test('handles edge percentage values', () => {
      expect(getMotivationalMessage(0).length).toBeGreaterThan(0);
      expect(getMotivationalMessage(100).length).toBeGreaterThan(0);
    });

    test('messages are appropriate for percentage ranges', () => {
      // Higher percentages should have more positive messages
      const message0 = getMotivationalMessage(0);
      const message50 = getMotivationalMessage(50);
      const message100 = getMotivationalMessage(100);

      // Each message should be distinct
      expect(message0).not.toBe(message50);
      expect(message50).not.toBe(message100);
      expect(message0).not.toBe(message100);
    });
  });

  describe('Integration tests', () => {
    test('complete workflow from empty to full profile', () => {
      // Empty profile
      const step0 = calculateProfileCompleteness({});
      expect(step0.percentage).toBe(0);
      expect(step0.level).toBe('beginner');

      // Add display name
      const step1 = calculateProfileCompleteness({
        username: 'player',
        display_name: 'Cool Player',
      });
      expect(step1.percentage).toBeGreaterThan(step0.percentage);

      // Add avatar
      const step2 = calculateProfileCompleteness({
        username: 'player',
        display_name: 'Cool Player',
        avatar_type: 'predefined',
      });
      expect(step2.percentage).toBeGreaterThan(step1.percentage);

      // Complete profile
      const stepFinal = calculateProfileCompleteness({
        username: 'player',
        display_name: 'Cool Player',
        avatar_type: 'predefined',
        bio: 'This is my complete bio with enough characters',
        social_links: { twitter: 'https://twitter.com/user' },
        stats: { gamesPlayed: 5 },
        total_points: 150,
      });
      expect(stepFinal.percentage).toBe(100);
      expect(stepFinal.level).toBe('complete');
    });

    test('level progression matches percentage increases', () => {
      const profiles = [
        { percentage: 0, expectedLevel: 'beginner' as const },
        { percentage: 45, expectedLevel: 'intermediate' as const },
        { percentage: 80, expectedLevel: 'advanced' as const },
        { percentage: 100, expectedLevel: 'complete' as const },
      ];

      profiles.forEach(({ percentage, expectedLevel }) => {
        const weights = { display_name: 15, custom_avatar: 15, bio: 15, social: 15, game: 20, points: 20 };
        let profile = {};

        // Construct profile to match percentage
        if (percentage >= 15) profile = { ...profile, username: 'p', display_name: 'Player' };
        if (percentage >= 30) profile = { ...profile, avatar_type: 'predefined' };
        if (percentage >= 45) profile = { ...profile, bio: 'Bio that is long enough to count' };
        if (percentage >= 60) profile = { ...profile, social_links: { twitter: 'https://twitter.com/u' } };
        if (percentage >= 80) profile = { ...profile, stats: { gamesPlayed: 1 } };
        if (percentage >= 100) profile = { ...profile, total_points: 100 };

        const result = calculateProfileCompleteness(profile);
        expect(result.level).toBe(expectedLevel);
      });
    });
  });
});
