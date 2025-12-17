"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { GameGrid } from "@/components/games/GameGrid";
import { BadgeGallery } from "@/components/badges/BadgeGallery";
import { ProfileSetup } from "@/components/profile/ProfileSetup";
import { useAuth } from "@/components/auth/AuthProvider";
import { GAMES } from "@/lib/types";
import Link from "next/link";
import { motion } from "framer-motion";

interface UserProfile {
  id: string;
  username?: string;
  total_points?: number;
  avatar_unlocked?: boolean;
}

export default function Home() {
  const games = Object.values(GAMES);
  const { user, isAuthenticated } = useAuth();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [hasSeenSetup, setHasSeenSetup] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Load user profile data
  useEffect(() => {
    if (isAuthenticated && user) {
      const loadProfile = async () => {
        try {
          const response = await fetch(`/api/user/profile?id=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setUserProfile(data.user);

            // Check if profile setup is needed
            if (!hasSeenSetup && (!data.user?.username || data.user.username.startsWith('Player_'))) {
              const timer = setTimeout(() => {
                setShowProfileSetup(true);
                setHasSeenSetup(true);
              }, 1000);
              return () => clearTimeout(timer);
            }
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      };

      loadProfile();
    }
  }, [isAuthenticated, user, hasSeenSetup]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-200 to-gray-400 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />

        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 mb-6 shadow-xl border-2 border-yellow-600"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎮 Bienvenue sur Celo Games Portal
              </h1>
              <p className="text-gray-800">
                Jouez, gagnez des points et débloquez des badges !
              </p>
            </div>
            <Link
              href="/about"
              className="bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-6 rounded-xl transition-all shadow-lg whitespace-nowrap"
            >
              📖 Comment Jouer
            </Link>
          </div>
        </motion.div>

        {/* Quick Stats */}
        {isAuthenticated && userProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 backdrop-blur-lg rounded-xl p-6 mb-6 shadow-lg border-2 border-gray-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Votre Profil</h2>
              <Link
                href="/profile/edit"
                className="text-yellow-600 hover:text-yellow-700 font-semibold text-sm underline"
              >
                ✏️ Éditer
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{userProfile.total_points || 0}</div>
                <div className="text-sm text-blue-800 font-semibold">Points</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {userProfile.username ? '✓' : '-'}
                </div>
                <div className="text-sm text-green-800 font-semibold">Profil</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {userProfile.avatar_unlocked ? '🔓' : '🔒'}
                </div>
                <div className="text-sm text-purple-800 font-semibold">Avatar Custom</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 text-center">
                <Link href="/leaderboard" className="block hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-yellow-600">📊</div>
                  <div className="text-sm text-yellow-800 font-semibold">Classement</div>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-lg rounded-xl p-4 mb-6 shadow-lg"
          style={{ border: '3px solid #FCFF52' }}
        >
          <h2 className="text-lg font-bold text-gray-900 mb-2">Modes de Jeu</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-gray-700">
            <div>
              <div className="font-semibold text-gray-900 mb-0.5 text-sm">🆓 Mode Gratuit</div>
              <p className="text-xs">Jouez sans wallet. Stats sauvegardées localement.</p>
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-0.5 text-sm">⛓️ Mode On-Chain</div>
              <p className="text-xs">Connectez votre wallet pour sauvegarder sur Celo.</p>
            </div>
          </div>
          <div className="mt-3 text-center">
            <Link
              href="/about"
              className="text-yellow-600 hover:text-yellow-700 font-semibold text-sm underline"
            >
              En savoir plus sur les points et badges →
            </Link>
          </div>
        </motion.div>

        {/* Badge Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/90 backdrop-blur-lg rounded-xl p-6 mb-6 shadow-lg border-2 border-gray-300"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">🏅 Badges Disponibles</h2>
            <Link
              href="/about"
              className="text-yellow-600 hover:text-yellow-700 font-semibold text-sm underline"
            >
              Voir tous les badges →
            </Link>
          </div>
          <BadgeGallery
            userId={userProfile?.id}
            compact={true}
            maxDisplay={12}
          />
        </motion.div>

        {/* Game Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Jeux Disponibles</h2>
          <GameGrid games={games} />
        </motion.div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-600 text-xs">
          <p>Built on Celo blockchain • Powered by Farcaster</p>
          <p className="mt-1">
            <a
              href="https://celo.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 hover:text-celo font-semibold transition-colors underline decoration-celo"
            >
              Learn more about Celo
            </a>
          </p>
        </footer>
      </div>

      {/* Profile Setup Modal */}
      <ProfileSetup
        isOpen={showProfileSetup}
        onClose={() => setShowProfileSetup(false)}
        onComplete={() => {
          setShowProfileSetup(false);
          // Could trigger a refresh or show a success message
        }}
      />
    </main>
  );
}
