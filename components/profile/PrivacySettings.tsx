'use client';

/**
 * Privacy Settings Component
 * Allows users to control profile visibility and what information is displayed
 */

import React from 'react';
import { motion } from 'framer-motion';

export type ProfileVisibility = 'public' | 'private';

interface PrivacySettingsProps {
  profileVisibility: ProfileVisibility;
  showStats: boolean;
  showBadges: boolean;
  showGameHistory: boolean;
  onVisibilityChange: (visibility: ProfileVisibility) => void;
  onShowStatsChange: (show: boolean) => void;
  onShowBadgesChange: (show: boolean) => void;
  onShowGameHistoryChange: (show: boolean) => void;
}

export function PrivacySettings({
  profileVisibility,
  showStats,
  showBadges,
  showGameHistory,
  onVisibilityChange,
  onShowStatsChange,
  onShowBadgesChange,
  onShowGameHistoryChange,
}: PrivacySettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Visibilité du profil
        </label>

        {/* Visibility options */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onVisibilityChange('public')}
            className={`p-4 rounded-xl border-2 transition-all ${
              profileVisibility === 'public'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  profileVisibility === 'public'
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-400 bg-white'
                }`}
              >
                {profileVisibility === 'public' && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-900">🌍 Public</div>
                <div className="text-xs text-gray-600">
                  Visible par tous les utilisateurs
                </div>
              </div>
            </div>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onVisibilityChange('private')}
            className={`p-4 rounded-xl border-2 transition-all ${
              profileVisibility === 'private'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  profileVisibility === 'private'
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-400 bg-white'
                }`}
              >
                {profileVisibility === 'private' && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-900">🔒 Privé</div>
                <div className="text-xs text-gray-600">
                  Uniquement visible par vous
                </div>
              </div>
            </div>
          </motion.button>
        </div>
      </div>

      <hr className="border-gray-300" />

      {/* Individual toggles */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">
          Éléments visibles sur votre profil
        </h3>

        {/* Show Stats Toggle */}
        <ToggleSwitch
          label="Afficher les statistiques"
          description="Nombre de parties jouées, victoires, défaites, taux de victoire"
          enabled={showStats}
          onChange={onShowStatsChange}
          icon="📊"
        />

        {/* Show Badges Toggle */}
        <ToggleSwitch
          label="Afficher les badges"
          description="Vos badges gagnés et accomplissements"
          enabled={showBadges}
          onChange={onShowBadgesChange}
          icon="🏅"
        />

        {/* Show Game History Toggle */}
        <ToggleSwitch
          label="Afficher l'historique de jeu"
          description="Statistiques détaillées par jeu"
          enabled={showGameHistory}
          onChange={onShowGameHistoryChange}
          icon="🎮"
        />
      </div>

      {/* Info message */}
      {profileVisibility === 'private' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 text-sm mb-1">
                Profil privé
              </h4>
              <p className="text-xs text-orange-800">
                Votre profil est actuellement privé. Les autres utilisateurs ne pourront pas le consulter,
                même avec un lien direct. Vous apparaîtrez toujours dans les classements publics.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Toggle Switch Component
interface ToggleSwitchProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  icon: string;
}

function ToggleSwitch({ label, description, enabled, onChange, icon }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
      <div className="flex items-start gap-3 flex-1">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="font-semibold text-gray-900 text-sm">{label}</div>
          <div className="text-xs text-gray-600 mt-1">{description}</div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
          enabled ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
