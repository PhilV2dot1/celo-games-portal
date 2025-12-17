'use client';

/**
 * About Page - Explain game mechanics, badges, and leaderboard
 *
 * Comprehensive guide to:
 * - How to earn points
 * - Badge system
 * - Leaderboard rankings
 * - Game modes
 */

import React from 'react';
import { Header } from '@/components/layout/Header';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-200 to-gray-400 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Header />

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 mb-6 shadow-xl border-2 border-yellow-400"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            🎮 Comment Jouer
          </h1>
          <p className="text-lg text-gray-700 text-center">
            Découvrez comment gagner des points, débloquer des badges et grimper au classement !
          </p>
        </motion.div>

        {/* Game Modes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 mb-6 shadow-lg border-2 border-gray-300"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            🎯 Modes de Jeu
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-300">
              <h3 className="text-lg font-bold text-blue-900 mb-2">🆓 Mode Gratuit (Free Play)</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Jouez immédiatement sans wallet</li>
                <li>• Gagnez des points et des badges</li>
                <li>• Stats sauvegardées localement</li>
                <li>• Idéal pour découvrir les jeux</li>
              </ul>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-300">
              <h3 className="text-lg font-bold text-purple-900 mb-2">⛓️ Mode On-Chain</h3>
              <ul className="space-y-2 text-sm text-purple-800">
                <li>• Connectez votre wallet Celo</li>
                <li>• Stats sauvegardées sur la blockchain</li>
                <li>• Participez au classement global</li>
                <li>• Certains jeux requièrent 0.01 CELO</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Points System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 mb-6 shadow-lg border-2 border-gray-300"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            ⭐ Système de Points
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-semibold text-green-900">Victoire</p>
                <p className="text-sm text-green-700">+10 à +50 points selon le jeu</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">🎮</span>
              <div>
                <p className="font-semibold text-blue-900">Participation</p>
                <p className="text-sm text-blue-700">+5 points même en cas de défaite</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="font-semibold text-purple-900">Bonus Série</p>
                <p className="text-sm text-purple-700">Points bonus pour les victoires consécutives</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <span className="text-2xl">🏅</span>
              <div>
                <p className="font-semibold text-yellow-900">Badges</p>
                <p className="text-sm text-yellow-700">10 à 1000 points bonus par badge débloqué</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Badge System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 mb-6 shadow-lg border-2 border-gray-300"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            🏅 Badges à Débloquer
          </h2>
          <p className="text-gray-700 mb-4">
            Accomplissez des défis pour débloquer des badges et gagner des points bonus !
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900">🎯 Progression</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>🏆 <strong>Première Victoire</strong> - Remportez votre premier jeu (+10 pts)</li>
                <li>🎮 <strong>Débutant</strong> - Jouez 10 parties (+25 pts)</li>
                <li>🎯 <strong>Joueur Régulier</strong> - Jouez 50 parties (+75 pts)</li>
                <li>⭐ <strong>Vétéran</strong> - Jouez 100 parties (+150 pts)</li>
                <li>👑 <strong>Maître du Jeu</strong> - Jouez 500 parties (+500 pts)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-gray-900">⚡ Performance</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>🔥 <strong>Série de 5</strong> - 5 victoires d&apos;affilée (+50 pts)</li>
                <li>⚡ <strong>Série de 10</strong> - 10 victoires d&apos;affilée (+100 pts)</li>
                <li>💎 <strong>Gros Joueur</strong> - Accumulez 1000 points (+250 pts)</li>
                <li>🏅 <strong>Champion</strong> - Accumulez 5000 points (+500 pts)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-gray-900">📊 Classement</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>📊 <strong>Top 10</strong> - Top 10 du leaderboard (+300 pts)</li>
                <li>🥉 <strong>Podium</strong> - Top 3 du leaderboard (+500 pts)</li>
                <li>🥇 <strong>Numéro 1</strong> - 1ère place (+1000 pts)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-gray-900">🌟 Collection</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>🌟 <strong>Touche-à-tout</strong> - Jouez à tous les jeux (+100 pts)</li>
                <li>📅 <strong>Semaine Parfaite</strong> - 7 jours de victoires (+200 pts)</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4">
            <p className="text-sm text-yellow-900">
              💡 <strong>Astuce :</strong> Le badge <strong>Vétéran</strong> (100 parties) débloque la possibilité
              d&apos;uploader un avatar personnalisé !
            </p>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 mb-6 shadow-lg border-2 border-gray-300"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            📊 Classement (Leaderboard)
          </h2>
          <p className="text-gray-700 mb-4">
            Le classement est mis à jour en temps réel et classe les joueurs selon leur total de points.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border-2 border-yellow-400">
              <span className="text-3xl">🥇</span>
              <div>
                <p className="font-bold text-yellow-900">1ère Place</p>
                <p className="text-sm text-yellow-700">Couronne dorée + badge exclusif</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border-2 border-gray-400">
              <span className="text-3xl">🥈</span>
              <div>
                <p className="font-bold text-gray-700">2ème Place</p>
                <p className="text-sm text-gray-600">Médaille d&apos;argent</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border-2 border-orange-400">
              <span className="text-3xl">🥉</span>
              <div>
                <p className="font-bold text-orange-900">3ème Place</p>
                <p className="text-sm text-orange-700">Médaille de bronze</p>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/leaderboard"
              className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-xl transition-all shadow-lg"
            >
              Voir le Classement →
            </Link>
          </div>
        </motion.div>

        {/* Avatar System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 mb-6 shadow-lg border-2 border-gray-300"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            👤 Système d&apos;Avatars
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-semibold text-blue-900">Avatars Prédéfinis</p>
              <p className="text-sm text-blue-700">Choisissez parmi 30 avatars gaming stylisés</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="font-semibold text-purple-900">Avatar Personnalisé 🔓</p>
              <p className="text-sm text-purple-700">
                Uploadez votre propre image (débloqué après 100 parties ou badge Vétéran)
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-8"
        >
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold py-4 px-8 rounded-xl transition-all shadow-xl text-lg"
          >
            Commencer à Jouer ! 🎮
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
