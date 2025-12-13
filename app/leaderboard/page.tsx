"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { GAMES } from "@/lib/types";
import Link from "next/link";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  fid: number | null;
  totalPoints?: number;
  gamePoints?: number;
  gamesPlayed: number;
  wins: number;
}

type GameId = 'all' | string;

export default function LeaderboardPage() {
  const [selectedGame, setSelectedGame] = useState<GameId>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const games = Object.values(GAMES);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);

      try {
        const url = selectedGame === 'all'
          ? '/api/leaderboard/global?limit=50'
          : `/api/leaderboard/game/${selectedGame}?limit=50`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }

        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [selectedGame]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-200 to-gray-400 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />

        {/* Back to Home */}
        <Link
          href="/"
          className="inline-block mb-6 text-gray-700 hover:text-gray-900 font-semibold transition-colors"
        >
          ← Back to Games
        </Link>

        {/* Page Title */}
        <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 mb-6 shadow-lg" style={{ border: '3px solid #FCFF52' }}>
          <h1 className="text-3xl font-black text-gray-900 text-center mb-2">
            🏆 Leaderboard
          </h1>
          <p className="text-center text-gray-600 text-sm">
            Top players across all games on Celo Games Portal
          </p>
        </div>

        {/* Game Filter Tabs */}
        <div className="bg-white/90 backdrop-blur-lg rounded-xl p-4 mb-6 shadow-lg">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedGame('all')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                selectedGame === 'all'
                  ? 'bg-gray-900 text-white shadow-lg scale-105'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🌍 All Games
            </button>
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  selectedGame === game.id
                    ? 'bg-gray-900 text-white shadow-lg scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {game.name}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-900"></div>
              <p className="mt-4 text-gray-600">Loading leaderboard...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-600 font-semibold">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg">No players yet. Be the first to play!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-black text-gray-700 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-black text-gray-700 uppercase tracking-wider">
                      Games
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-black text-gray-700 uppercase tracking-wider">
                      Wins
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-black text-gray-700 uppercase tracking-wider">
                      Win Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaderboard.map((entry, index) => {
                    const winRate = entry.gamesPlayed > 0
                      ? ((entry.wins / entry.gamesPlayed) * 100).toFixed(0)
                      : '0';

                    const points = selectedGame === 'all' ? entry.totalPoints : entry.gamePoints;

                    return (
                      <tr
                        key={entry.userId}
                        className={`hover:bg-gray-50 transition-colors ${
                          index < 3 ? 'bg-yellow-50/50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {entry.rank === 1 && <span className="text-2xl mr-2">🥇</span>}
                            {entry.rank === 2 && <span className="text-2xl mr-2">🥈</span>}
                            {entry.rank === 3 && <span className="text-2xl mr-2">🥉</span>}
                            <span className="text-lg font-black text-gray-900">
                              #{entry.rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            {entry.username}
                          </div>
                          {entry.fid && (
                            <div className="text-xs text-gray-500">
                              FID: {entry.fid}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-lg font-black text-gray-900">
                            {points?.toLocaleString() || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-semibold text-gray-700">
                            {entry.gamesPlayed}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-semibold text-green-600">
                            {entry.wins}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-semibold text-gray-700">
                            {winRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Rankings update automatically as players compete across games</p>
        </div>
      </div>
    </main>
  );
}
