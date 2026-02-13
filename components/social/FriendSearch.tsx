'use client';

import { useState, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { UserSearchResult } from '@/lib/social/types';

interface FriendSearchProps {
  onSearch: (query: string) => Promise<UserSearchResult[]>;
  onSendRequest: (username: string) => Promise<boolean>;
}

export function FriendSearch({ onSearch, onSendRequest }: FriendSearchProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());

  const handleSearch = useCallback(async () => {
    if (query.length < 2) return;

    setSearching(true);
    const users = await onSearch(query);
    setResults(users);
    setSearching(false);
  }, [query, onSearch]);

  const handleSendRequest = useCallback(async (username: string) => {
    setSendingTo(username);
    const success = await onSendRequest(username);
    if (success) {
      setSentTo(prev => new Set(prev).add(username));
    }
    setSendingTo(null);
  }, [onSendRequest]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={t('friends.search')}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 text-sm"
          data-testid="friend-search-input"
        />
        <button
          onClick={handleSearch}
          disabled={query.length < 2 || searching}
          className="px-4 py-2 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="friend-search-button"
        >
          {searching ? '...' : t('friends.sendRequest')}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            {t('friends.searchResults')}
          </p>
          {results.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">
                  {(user.display_name || user.username || '?')[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user.display_name || user.username}
                  </p>
                  {user.display_name && user.username && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleSendRequest(user.username || '')}
                disabled={!user.username || sendingTo === user.username || sentTo.has(user.username || '')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--chain-primary)', color: 'var(--chain-contrast)' }}
              >
                {sentTo.has(user.username || '') ? t('friends.requestPending') : sendingTo === user.username ? '...' : t('friends.sendRequest')}
              </button>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && query.length >= 2 && !searching && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
          {t('friends.noResults')}
        </p>
      )}
    </div>
  );
}
