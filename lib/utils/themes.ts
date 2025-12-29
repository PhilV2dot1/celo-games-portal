/**
 * Theme Colors for Profile Customization
 *
 * Provides 7 color themes users can choose from to personalize their profile
 */

export interface ThemeColor {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  gradient: string;
  textColor: string;
  borderColor: string;
}

export const THEME_COLORS: Record<string, ThemeColor> = {
  yellow: {
    id: 'yellow',
    name: 'Jaune Celo',
    primary: '#FCFF52',
    secondary: '#fbbf24',
    gradient: 'from-yellow-400 to-yellow-500',
    textColor: 'text-gray-900',
    borderColor: 'border-yellow-400',
  },
  blue: {
    id: 'blue',
    name: 'Bleu',
    primary: '#3b82f6',
    secondary: '#2563eb',
    gradient: 'from-blue-400 to-blue-600',
    textColor: 'text-white',
    borderColor: 'border-blue-400',
  },
  purple: {
    id: 'purple',
    name: 'Violet',
    primary: '#a855f7',
    secondary: '#9333ea',
    gradient: 'from-purple-400 to-purple-600',
    textColor: 'text-white',
    borderColor: 'border-purple-400',
  },
  green: {
    id: 'green',
    name: 'Vert',
    primary: '#10b981',
    secondary: '#059669',
    gradient: 'from-green-400 to-green-600',
    textColor: 'text-white',
    borderColor: 'border-green-400',
  },
  red: {
    id: 'red',
    name: 'Rouge',
    primary: '#ef4444',
    secondary: '#dc2626',
    gradient: 'from-red-400 to-red-600',
    textColor: 'text-white',
    borderColor: 'border-red-400',
  },
  orange: {
    id: 'orange',
    name: 'Orange',
    primary: '#f97316',
    secondary: '#ea580c',
    gradient: 'from-orange-400 to-orange-600',
    textColor: 'text-white',
    borderColor: 'border-orange-400',
  },
  pink: {
    id: 'pink',
    name: 'Rose',
    primary: '#ec4899',
    secondary: '#db2777',
    gradient: 'from-pink-400 to-pink-600',
    textColor: 'text-white',
    borderColor: 'border-pink-400',
  },
};

/**
 * Get theme by ID with fallback to yellow (default)
 */
export function getTheme(themeId?: string | null): ThemeColor {
  if (!themeId || !THEME_COLORS[themeId]) {
    return THEME_COLORS.yellow;
  }
  return THEME_COLORS[themeId];
}

/**
 * Get all available themes as an array
 */
export function getAllThemes(): ThemeColor[] {
  return Object.values(THEME_COLORS);
}
