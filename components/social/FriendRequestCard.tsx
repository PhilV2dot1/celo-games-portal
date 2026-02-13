'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { FriendWithProfile } from '@/lib/social/types';

interface FriendRequestCardProps {
  friend: FriendWithProfile;
  type: 'received' | 'sent';
  onAccept?: (friendshipId: string) => Promise<boolean>;
  onDecline?: (friendshipId: string) => Promise<boolean>;
}

export function FriendRequestCard({ friend, type, onAccept, onDecline }: FriendRequestCardProps) {
  const { t } = useLanguage();
  const [acting, setActing] = useState(false);

  const handleAccept = async () => {
    if (!onAccept) return;
    setActing(true);
    await onAccept(friend.friendship_id);
    setActing(false);
  };

  const handleDecline = async () => {
    if (!onDecline) return;
    setActing(true);
    await onDecline(friend.friendship_id);
    setActing(false);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">
          {(friend.display_name || friend.username || '?')[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {friend.display_name || friend.username || 'Unknown'}
          </p>
          {friend.username && (
            <p className="text-xs text-gray-500 dark:text-gray-400">@{friend.username}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {type === 'received' ? (
          <>
            <button
              onClick={handleAccept}
              disabled={acting}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {t('friends.accept')}
            </button>
            <button
              onClick={handleDecline}
              disabled={acting}
              className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {t('friends.decline')}
            </button>
          </>
        ) : (
          <span className="text-xs text-gray-500 dark:text-gray-400 italic">
            {t('friends.requestPending')}
          </span>
        )}
      </div>
    </div>
  );
}
