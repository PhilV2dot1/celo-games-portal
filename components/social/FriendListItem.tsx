'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { FriendWithProfile } from '@/lib/social/types';

interface FriendListItemProps {
  friend: FriendWithProfile;
  onRemove: (friendshipId: string) => Promise<boolean>;
  onInvite?: (friendUserId: string) => void;
}

export function FriendListItem({ friend, onRemove, onInvite }: FriendListItemProps) {
  const { t } = useLanguage();
  const [removing, setRemoving] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    await onRemove(friend.friendship_id);
    setRemoving(false);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <Link
        href={`/profile/${friend.user_id}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 shrink-0">
          {(friend.display_name || friend.username || '?')[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {friend.display_name || friend.username || 'Unknown'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {friend.total_points} {t('points')}
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-2 shrink-0">
        {onInvite && (
          <button
            onClick={() => onInvite(friend.user_id)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--chain-primary)', color: 'var(--chain-contrast)' }}
          >
            {t('friends.inviteToPlay')}
          </button>
        )}
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="More actions"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {showActions && (
          <div className="absolute right-4 mt-20 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <button
              onClick={handleRemove}
              disabled={removing}
              className="w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              {t('friends.remove')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
