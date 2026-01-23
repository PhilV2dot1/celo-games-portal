"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { PlayerCard } from "./PlayerCard";
import type { RoomPlayer, MultiplayerRoom } from "@/lib/multiplayer/types";

interface WaitingRoomProps {
  room: MultiplayerRoom;
  players: RoomPlayer[];
  myPlayerNumber: number | null;
  isReady: boolean;
  onSetReady: (ready: boolean) => void;
  onLeave: () => void;
}

export function WaitingRoom({
  room,
  players,
  myPlayerNumber,
  isReady,
  onSetReady,
  onLeave,
}: WaitingRoomProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const copyRoomCode = async () => {
    if (room.room_code) {
      await navigator.clipboard.writeText(room.room_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const maxPlayers = room.max_players;
  const waitingForPlayers = players.length < maxPlayers;
  const allReady = players.length >= maxPlayers && players.every(p => p.ready);

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl border-2 border-gray-300 dark:border-gray-600 shadow-xl max-w-md w-full">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('multiplayer.waitingRoom') || 'Waiting Room'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
          {room.mode === '1v1-ranked'
            ? t('multiplayer.rankedMatch') || 'Ranked Match'
            : t('multiplayer.casualMatch') || 'Casual Match'}
        </p>
      </div>

      {/* Room Code (if private) */}
      {room.room_code && (
        <div className="w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
            {t('multiplayer.roomCode') || 'Room Code'}
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-mono font-bold tracking-widest text-gray-900 dark:text-white">
              {room.room_code}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyRoomCode}
              className="ml-2"
            >
              {copied ? '✓' : '📋'}
            </Button>
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            {t('multiplayer.shareCode') || 'Share this code with your friend'}
          </p>
        </div>
      )}

      {/* Players */}
      <div className="w-full space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
          {t('multiplayer.players') || 'Players'} ({players.length}/{maxPlayers})
        </p>

        {/* Player slots */}
        <div className="space-y-2">
          {Array.from({ length: maxPlayers }).map((_, index) => {
            const player = players.find(p => p.player_number === index + 1);
            const isMe = player?.player_number === myPlayerNumber;

            return (
              <div
                key={index}
                className={`p-3 rounded-lg border-2 transition-all ${
                  player
                    ? isMe
                      ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-600'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                    : 'bg-gray-100 dark:bg-gray-800 border-dashed border-gray-300 dark:border-gray-600'
                }`}
              >
                {player ? (
                  <PlayerCard
                    player={player}
                    isMe={isMe}
                    showReady={true}
                  />
                ) : (
                  <div className="flex items-center justify-center h-12 text-gray-400">
                    <span className="animate-pulse">
                      {t('multiplayer.waitingForPlayer') || 'Waiting for player...'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status message */}
      {waitingForPlayers ? (
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          <span className="text-sm">
            {t('multiplayer.waitingForOpponent') || 'Waiting for opponent...'}
          </span>
        </div>
      ) : allReady ? (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <span className="text-lg">✓</span>
          <span className="text-sm font-medium">
            {t('multiplayer.startingSoon') || 'Starting soon...'}
          </span>
        </div>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
          {t('multiplayer.waitingForReady') || 'Waiting for all players to be ready'}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 w-full">
        <Button
          variant="ghost"
          size="md"
          onClick={onLeave}
          className="flex-1"
        >
          {t('multiplayer.leave') || 'Leave'}
        </Button>

        {!waitingForPlayers && (
          <Button
            variant={isReady ? "secondary" : "celo"}
            size="md"
            onClick={() => onSetReady(!isReady)}
            className="flex-1"
          >
            {isReady
              ? t('multiplayer.notReady') || 'Not Ready'
              : t('multiplayer.ready') || 'Ready!'}
          </Button>
        )}
      </div>
    </div>
  );
}

export default WaitingRoom;
