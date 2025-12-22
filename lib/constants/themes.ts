/**
 * Profile Theme Colors
 * Defines the 7 available color themes for user profiles
 */

export type ThemeColor = 'yellow' | 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'pink';

export interface ThemeOption {
  id: ThemeColor;
  name: string;
  colors: {
    primary: string;      // Main background color
    hover: string;        // Hover state
    border: string;       // Border color
    text: string;         // Text color on primary background
    badge: string;        // Badge/accent color
  };
  preview: string;        // Preview dot color
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'yellow',
    name: 'Jaune',
    colors: {
      primary: 'bg-yellow-400',
      hover: 'hover:bg-yellow-500',
      border: 'border-yellow-500',
      text: 'text-gray-900',
      badge: 'bg-yellow-500',
    },
    preview: 'bg-yellow-400',
  },
  {
    id: 'blue',
    name: 'Bleu',
    colors: {
      primary: 'bg-blue-500',
      hover: 'hover:bg-blue-600',
      border: 'border-blue-600',
      text: 'text-white',
      badge: 'bg-blue-600',
    },
    preview: 'bg-blue-500',
  },
  {
    id: 'purple',
    name: 'Violet',
    colors: {
      primary: 'bg-purple-500',
      hover: 'hover:bg-purple-600',
      border: 'border-purple-600',
      text: 'text-white',
      badge: 'bg-purple-600',
    },
    preview: 'bg-purple-500',
  },
  {
    id: 'green',
    name: 'Vert',
    colors: {
      primary: 'bg-green-500',
      hover: 'hover:bg-green-600',
      border: 'border-green-600',
      text: 'text-white',
      badge: 'bg-green-600',
    },
    preview: 'bg-green-500',
  },
  {
    id: 'red',
    name: 'Rouge',
    colors: {
      primary: 'bg-red-500',
      hover: 'hover:bg-red-600',
      border: 'border-red-600',
      text: 'text-white',
      badge: 'bg-red-600',
    },
    preview: 'bg-red-500',
  },
  {
    id: 'orange',
    name: 'Orange',
    colors: {
      primary: 'bg-orange-500',
      hover: 'hover:bg-orange-600',
      border: 'border-orange-600',
      text: 'text-white',
      badge: 'bg-orange-600',
    },
    preview: 'bg-orange-500',
  },
  {
    id: 'pink',
    name: 'Rose',
    colors: {
      primary: 'bg-pink-500',
      hover: 'hover:bg-pink-600',
      border: 'border-pink-600',
      text: 'text-white',
      badge: 'bg-pink-600',
    },
    preview: 'bg-pink-500',
  },
];

/**
 * Get theme colors for a given theme ID
 */
export function getThemeColors(themeId: ThemeColor = 'yellow'): ThemeOption['colors'] {
  const theme = THEME_OPTIONS.find(t => t.id === themeId);
  return theme?.colors ?? THEME_OPTIONS[0].colors;
}

/**
 * Get theme option by ID
 */
export function getTheme(themeId: ThemeColor = 'yellow'): ThemeOption {
  return THEME_OPTIONS.find(t => t.id === themeId) ?? THEME_OPTIONS[0];
}

/**
 * Validate if a theme color is valid
 */
export function isValidThemeColor(color: string): color is ThemeColor {
  return THEME_OPTIONS.some(t => t.id === color);
}
