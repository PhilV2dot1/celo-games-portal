'use client';

import { ThemeColor, THEME_OPTIONS } from '@/lib/constants/themes';

interface ThemeSelectorProps {
  selectedTheme: ThemeColor;
  onThemeChange: (theme: ThemeColor) => void;
}

export default function ThemeSelector({ selectedTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Couleur du profil
      </label>
      <div className="grid grid-cols-7 gap-3">
        {THEME_OPTIONS.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => onThemeChange(theme.id)}
            className={`
              relative flex flex-col items-center justify-center p-2 rounded-lg transition-all
              ${selectedTheme === theme.id
                ? 'ring-2 ring-offset-2 ring-gray-900 bg-gray-50'
                : 'hover:bg-gray-50'
              }
            `}
            title={theme.name}
          >
            {/* Color preview circle */}
            <div
              className={`
                w-10 h-10 rounded-full ${theme.preview}
                shadow-md transition-transform
                ${selectedTheme === theme.id ? 'scale-110' : 'hover:scale-105'}
              `}
            />

            {/* Theme name */}
            <span className="text-xs mt-1 text-gray-600 font-medium">
              {theme.name}
            </span>

            {/* Selected indicator */}
            {selectedTheme === theme.id && (
              <div className="absolute -top-1 -right-1 bg-gray-900 rounded-full p-1">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
      <p className="text-gray-500 text-xs mt-2">
        Cette couleur s&apos;affichera sur votre carte de profil
      </p>
    </div>
  );
}
