import { describe, test, expect } from 'vitest';
import { THEME_COLORS, getTheme, getAllThemes, type ThemeColor } from '@/lib/utils/themes';

describe('Theme Utilities', () => {
  describe('THEME_COLORS constant', () => {
    test('has 7 theme colors', () => {
      const themeIds = Object.keys(THEME_COLORS);
      expect(themeIds).toHaveLength(7);
    });

    test('has all expected theme colors', () => {
      const expectedThemes = ['yellow', 'blue', 'purple', 'green', 'red', 'orange', 'pink'];
      const actualThemes = Object.keys(THEME_COLORS);

      expectedThemes.forEach(theme => {
        expect(actualThemes).toContain(theme);
      });
    });

    test('each theme has required properties', () => {
      Object.values(THEME_COLORS).forEach(theme => {
        expect(theme).toHaveProperty('id');
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('primary');
        expect(theme).toHaveProperty('secondary');
        expect(theme).toHaveProperty('gradient');
        expect(theme).toHaveProperty('textColor');
        expect(theme).toHaveProperty('borderColor');
      });
    });

    test('all theme IDs match their object keys', () => {
      Object.entries(THEME_COLORS).forEach(([key, theme]) => {
        expect(theme.id).toBe(key);
      });
    });

    test('all primary colors are valid hex codes', () => {
      Object.values(THEME_COLORS).forEach(theme => {
        expect(theme.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    test('all secondary colors are valid hex codes', () => {
      Object.values(THEME_COLORS).forEach(theme => {
        expect(theme.secondary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    test('all gradients are valid Tailwind gradient classes', () => {
      Object.values(THEME_COLORS).forEach(theme => {
        expect(theme.gradient).toMatch(/^from-\w+-\d{3} to-\w+-\d{3}$/);
      });
    });

    test('all textColors are valid Tailwind text classes', () => {
      Object.values(THEME_COLORS).forEach(theme => {
        expect(theme.textColor).toMatch(/^text-(white|gray-\d{3})$/);
      });
    });

    test('all borderColors are valid Tailwind border classes', () => {
      Object.values(THEME_COLORS).forEach(theme => {
        expect(theme.borderColor).toMatch(/^border-\w+-\d{3}$/);
      });
    });
  });

  describe('Individual theme colors', () => {
    describe('Yellow theme (Celo default)', () => {
      test('has correct properties', () => {
        expect(THEME_COLORS.yellow.id).toBe('yellow');
        expect(THEME_COLORS.yellow.name).toBe('Jaune Celo');
        expect(THEME_COLORS.yellow.primary).toBe('#FCFF52');
        expect(THEME_COLORS.yellow.secondary).toBe('#fbbf24');
        expect(THEME_COLORS.yellow.gradient).toBe('from-yellow-400 to-yellow-500');
        expect(THEME_COLORS.yellow.textColor).toBe('text-gray-900');
        expect(THEME_COLORS.yellow.borderColor).toBe('border-yellow-400');
      });
    });

    describe('Blue theme', () => {
      test('has correct properties', () => {
        expect(THEME_COLORS.blue.id).toBe('blue');
        expect(THEME_COLORS.blue.name).toBe('Bleu');
        expect(THEME_COLORS.blue.primary).toBe('#3b82f6');
        expect(THEME_COLORS.blue.secondary).toBe('#2563eb');
        expect(THEME_COLORS.blue.gradient).toBe('from-blue-400 to-blue-600');
        expect(THEME_COLORS.blue.textColor).toBe('text-white');
        expect(THEME_COLORS.blue.borderColor).toBe('border-blue-400');
      });
    });

    describe('Purple theme', () => {
      test('has correct properties', () => {
        expect(THEME_COLORS.purple.id).toBe('purple');
        expect(THEME_COLORS.purple.name).toBe('Violet');
        expect(THEME_COLORS.purple.textColor).toBe('text-white');
      });
    });

    describe('Green theme', () => {
      test('has correct properties', () => {
        expect(THEME_COLORS.green.id).toBe('green');
        expect(THEME_COLORS.green.name).toBe('Vert');
        expect(THEME_COLORS.green.textColor).toBe('text-white');
      });
    });

    describe('Red theme', () => {
      test('has correct properties', () => {
        expect(THEME_COLORS.red.id).toBe('red');
        expect(THEME_COLORS.red.name).toBe('Rouge');
        expect(THEME_COLORS.red.textColor).toBe('text-white');
      });
    });

    describe('Orange theme', () => {
      test('has correct properties', () => {
        expect(THEME_COLORS.orange.id).toBe('orange');
        expect(THEME_COLORS.orange.name).toBe('Orange');
        expect(THEME_COLORS.orange.textColor).toBe('text-white');
      });
    });

    describe('Pink theme', () => {
      test('has correct properties', () => {
        expect(THEME_COLORS.pink.id).toBe('pink');
        expect(THEME_COLORS.pink.name).toBe('Rose');
        expect(THEME_COLORS.pink.textColor).toBe('text-white');
      });
    });
  });

  describe('getTheme function', () => {
    test('returns yellow theme when themeId is undefined', () => {
      const theme = getTheme(undefined);
      expect(theme.id).toBe('yellow');
      expect(theme.name).toBe('Jaune Celo');
    });

    test('returns yellow theme when themeId is null', () => {
      const theme = getTheme(null);
      expect(theme.id).toBe('yellow');
    });

    test('returns yellow theme when themeId is empty string', () => {
      const theme = getTheme('');
      expect(theme.id).toBe('yellow');
    });

    test('returns yellow theme when themeId is invalid', () => {
      const theme = getTheme('invalid-theme');
      expect(theme.id).toBe('yellow');
    });

    test('returns correct theme for valid themeId: yellow', () => {
      const theme = getTheme('yellow');
      expect(theme.id).toBe('yellow');
      expect(theme).toEqual(THEME_COLORS.yellow);
    });

    test('returns correct theme for valid themeId: blue', () => {
      const theme = getTheme('blue');
      expect(theme.id).toBe('blue');
      expect(theme).toEqual(THEME_COLORS.blue);
    });

    test('returns correct theme for valid themeId: purple', () => {
      const theme = getTheme('purple');
      expect(theme.id).toBe('purple');
      expect(theme).toEqual(THEME_COLORS.purple);
    });

    test('returns correct theme for valid themeId: green', () => {
      const theme = getTheme('green');
      expect(theme.id).toBe('green');
      expect(theme).toEqual(THEME_COLORS.green);
    });

    test('returns correct theme for valid themeId: red', () => {
      const theme = getTheme('red');
      expect(theme.id).toBe('red');
      expect(theme).toEqual(THEME_COLORS.red);
    });

    test('returns correct theme for valid themeId: orange', () => {
      const theme = getTheme('orange');
      expect(theme.id).toBe('orange');
      expect(theme).toEqual(THEME_COLORS.orange);
    });

    test('returns correct theme for valid themeId: pink', () => {
      const theme = getTheme('pink');
      expect(theme.id).toBe('pink');
      expect(theme).toEqual(THEME_COLORS.pink);
    });

    test('returns theme with all required properties', () => {
      const theme = getTheme('blue');
      expect(theme).toHaveProperty('id');
      expect(theme).toHaveProperty('name');
      expect(theme).toHaveProperty('primary');
      expect(theme).toHaveProperty('secondary');
      expect(theme).toHaveProperty('gradient');
      expect(theme).toHaveProperty('textColor');
      expect(theme).toHaveProperty('borderColor');
    });

    test('handles case-sensitive theme IDs', () => {
      // Should only work with lowercase
      expect(getTheme('Blue').id).toBe('yellow'); // Falls back to default
      expect(getTheme('BLUE').id).toBe('yellow'); // Falls back to default
      expect(getTheme('blue').id).toBe('blue'); // Correct
    });

    test('returns yellow theme for whitespace-only themeId', () => {
      const theme = getTheme('   ');
      expect(theme.id).toBe('yellow');
    });
  });

  describe('getAllThemes function', () => {
    test('returns array of all themes', () => {
      const themes = getAllThemes();
      expect(Array.isArray(themes)).toBe(true);
      expect(themes).toHaveLength(7);
    });

    test('returned array contains all theme objects', () => {
      const themes = getAllThemes();
      const themeIds = themes.map(t => t.id).sort();

      expect(themeIds).toEqual(['blue', 'green', 'orange', 'pink', 'purple', 'red', 'yellow']);
    });

    test('each theme in array has all required properties', () => {
      const themes = getAllThemes();

      themes.forEach(theme => {
        expect(theme).toHaveProperty('id');
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('primary');
        expect(theme).toHaveProperty('secondary');
        expect(theme).toHaveProperty('gradient');
        expect(theme).toHaveProperty('textColor');
        expect(theme).toHaveProperty('borderColor');
      });
    });

    test('returned themes match THEME_COLORS values', () => {
      const themes = getAllThemes();
      const expectedThemes = Object.values(THEME_COLORS);

      expect(themes.length).toBe(expectedThemes.length);

      themes.forEach(theme => {
        expect(expectedThemes).toContainEqual(theme);
      });
    });

    test('returns new array on each call (not cached reference)', () => {
      const themes1 = getAllThemes();
      const themes2 = getAllThemes();

      // Should be different array instances but same content
      expect(themes1).not.toBe(themes2);
      expect(themes1).toEqual(themes2);
    });

    test('includes yellow as first or among the themes', () => {
      const themes = getAllThemes();
      const yellowTheme = themes.find(t => t.id === 'yellow');

      expect(yellowTheme).toBeDefined();
      expect(yellowTheme?.name).toBe('Jaune Celo');
    });
  });

  describe('Theme color consistency', () => {
    test('yellow theme has dark text (for contrast)', () => {
      expect(THEME_COLORS.yellow.textColor).toBe('text-gray-900');
    });

    test('all non-yellow themes have white text', () => {
      const nonYellowThemes = Object.values(THEME_COLORS).filter(t => t.id !== 'yellow');

      nonYellowThemes.forEach(theme => {
        expect(theme.textColor).toBe('text-white');
      });
    });

    test('primary and secondary colors are different', () => {
      Object.values(THEME_COLORS).forEach(theme => {
        expect(theme.primary).not.toBe(theme.secondary);
      });
    });

    test('gradients use consistent color scheme', () => {
      Object.entries(THEME_COLORS).forEach(([id, theme]) => {
        // Gradient should include the color name
        expect(theme.gradient.toLowerCase()).toContain(id.toLowerCase());
      });
    });

    test('borderColor uses consistent color scheme', () => {
      Object.entries(THEME_COLORS).forEach(([id, theme]) => {
        // Border color should include the color name
        expect(theme.borderColor.toLowerCase()).toContain(id.toLowerCase());
      });
    });
  });

  describe('Type safety', () => {
    test('ThemeColor interface matches actual theme structure', () => {
      const theme: ThemeColor = THEME_COLORS.blue;

      expect(theme.id).toBeDefined();
      expect(theme.name).toBeDefined();
      expect(theme.primary).toBeDefined();
      expect(theme.secondary).toBeDefined();
      expect(theme.gradient).toBeDefined();
      expect(theme.textColor).toBeDefined();
      expect(theme.borderColor).toBeDefined();
    });

    test('getTheme always returns ThemeColor type', () => {
      const theme1 = getTheme('blue');
      const theme2 = getTheme('invalid');
      const theme3 = getTheme(undefined);

      [theme1, theme2, theme3].forEach(theme => {
        expect(theme).toHaveProperty('id');
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('primary');
        expect(theme).toHaveProperty('secondary');
        expect(theme).toHaveProperty('gradient');
        expect(theme).toHaveProperty('textColor');
        expect(theme).toHaveProperty('borderColor');
      });
    });

    test('getAllThemes returns array of ThemeColor', () => {
      const themes = getAllThemes();

      themes.forEach((theme: ThemeColor) => {
        expect(typeof theme.id).toBe('string');
        expect(typeof theme.name).toBe('string');
        expect(typeof theme.primary).toBe('string');
        expect(typeof theme.secondary).toBe('string');
        expect(typeof theme.gradient).toBe('string');
        expect(typeof theme.textColor).toBe('string');
        expect(typeof theme.borderColor).toBe('string');
      });
    });
  });

  describe('Edge cases and robustness', () => {
    test('handles numeric theme ID', () => {
      const theme = getTheme('123');
      expect(theme.id).toBe('yellow'); // Falls back to default
    });

    test('handles special characters in theme ID', () => {
      const theme = getTheme('blue@#$');
      expect(theme.id).toBe('yellow'); // Falls back to default
    });

    test('handles very long theme ID', () => {
      const theme = getTheme('a'.repeat(1000));
      expect(theme.id).toBe('yellow'); // Falls back to default
    });

    test('all theme names are non-empty', () => {
      Object.values(THEME_COLORS).forEach(theme => {
        expect(theme.name.length).toBeGreaterThan(0);
      });
    });

    test('all theme IDs are non-empty', () => {
      Object.values(THEME_COLORS).forEach(theme => {
        expect(theme.id.length).toBeGreaterThan(0);
      });
    });

    test('no duplicate theme IDs', () => {
      const ids = Object.values(THEME_COLORS).map(t => t.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    test('no duplicate theme names', () => {
      const names = Object.values(THEME_COLORS).map(t => t.name);
      const uniqueNames = [...new Set(names)];
      expect(names.length).toBe(uniqueNames.length);
    });
  });

  describe('Integration with expected usage', () => {
    test('can be used to style components dynamically', () => {
      const userPreference = 'blue';
      const theme = getTheme(userPreference);

      // Should be able to use these in CSS-in-JS or inline styles
      expect(theme.primary).toBeTruthy();
      expect(theme.gradient).toBeTruthy();
      expect(theme.textColor).toBeTruthy();
    });

    test('can display theme picker with all themes', () => {
      const themes = getAllThemes();

      // Should have enough themes for a nice selection
      expect(themes.length).toBeGreaterThanOrEqual(5);

      // Each theme should be displayable
      themes.forEach(theme => {
        expect(theme.name).toBeTruthy();
        expect(theme.primary).toBeTruthy();
      });
    });

    test('fallback to default works as safety mechanism', () => {
      // If user has corrupted data or old theme
      const corruptedTheme = getTheme('old-theme-no-longer-exists');

      expect(corruptedTheme.id).toBe('yellow'); // Safe fallback
      expect(corruptedTheme).toEqual(THEME_COLORS.yellow);
    });
  });
});
