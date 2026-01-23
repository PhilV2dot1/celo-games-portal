/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getEloTier } from "@/lib/multiplayer/elo";
import type { RoomPlayer, MultiplayerStats } from "@/lib/multiplayer/types";

interface PlayerCardProps {
  player: RoomPlayer;
  isMe?: boolean;
  showReady?: boolean;
  stats?: MultiplayerStats | null;
  compact?: boolean;
}

export function PlayerCard({
  player,
  isMe = false,
  showReady = false,
  stats,
  compact = false,
}: PlayerCardProps) {
  const { t } = useLanguage();

  // Get user info from joined data
  const userInfo = (player as any).users;
  const username = userInfo?.display_name || userInfo?.username || 'Player';
  const avatarUrl = userInfo?.avatar_url;
  const themeColor = userInfo?.theme_color || 'yellow';

  // ELO tier
  const eloTier = stats ? getEloTier(stats.elo_rating) : null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
            themeColor === 'yellow' ? 'bg-yellow-500' :
            themeColor === 'blue' ? 'bg-blue-500' :
            themeColor === 'purple' ? 'bg-purple-500' :
            themeColor === 'green' ? 'bg-green-500' :
            themeColor === 'red' ? 'bg-red-500' :
            themeColor === 'orange' ? 'bg-orange-500' :
            themeColor === 'pink' ? 'bg-pink-500' :
            'bg-gray-500'
          }`}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            username.charAt(0).toUpperCase()
          )}
        </div>

        {/* Name */}
        <span className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-[100px]">
          {username}
          {isMe && <span className="text-xs text-gray-500 ml-1">(you)</span>}
        </span>

        {/* Ready indicator */}
        {showReady && (
          <span className={`text-xs ${player.ready ? 'text-green-500' : 'text-gray-400'}`}>
            {player.ready ? '✓' : '○'}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md ${
          themeColor === 'yellow' ? 'bg-yellow-500' :
          themeColor === 'blue' ? 'bg-blue-500' :
          themeColor === 'purple' ? 'bg-purple-500' :
          themeColor === 'green' ? 'bg-green-500' :
          themeColor === 'red' ? 'bg-red-500' :
          themeColor === 'orange' ? 'bg-orange-500' :
          themeColor === 'pink' ? 'bg-pink-500' :
          'bg-gray-500'
        }`}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          username.charAt(0).toUpperCase()
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-white truncate">
            {username}
          </span>
          {isMe && (
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full">
              {t('multiplayer.you') || 'You'}
            </span>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-xs font-medium px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${eloTier?.color}20`, color: eloTier?.color }}
            >
              {eloTier?.icon} {stats.elo_rating}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {stats.wins}W-{stats.losses}L
            </span>
          </div>
        )}
      </div>

      {/* Ready status */}
      {showReady && (
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            player.ready
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
          }`}
        >
          {player.ready ? '✓' : '○'}
        </div>
      )}
    </div>
  );
}

export default PlayerCard;
