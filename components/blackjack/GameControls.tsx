import type { GamePhase } from "@/hooks/useBlackjack";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface GameControlsProps {
  onHit: () => void;
  onStand: () => void;
  onNewGame: () => void;
  onPlayOnChain: () => void;
  gamePhase: GamePhase;
  mode: 'free' | 'onchain';
  disabled: boolean;
}

export function GameControls({
  onHit,
  onStand,
  onNewGame,
  onPlayOnChain,
  gamePhase,
  mode,
  disabled
}: GameControlsProps) {
  const { t } = useLanguage();

  // Show play buttons when in playing phase (free mode only)
  const showPlayButtons = gamePhase === 'playing' && mode === 'free';

  // Show new game button when finished or in betting phase
  const showNewGameButton = (gamePhase === 'finished' || gamePhase === 'betting') && mode === 'free';

  // Show play on-chain button when in betting phase and on-chain mode
  const showOnChainButton = gamePhase === 'betting' && mode === 'onchain';

  // Show play again button when finished in on-chain mode
  const showPlayAgainButton = gamePhase === 'finished' && mode === 'onchain';

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mt-3 sm:mt-6">
      {showPlayButtons && (
        <>
          <button
            onClick={onHit}
            disabled={disabled}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-white/90 hover:bg-white text-gray-900 rounded-xl font-bold text-base sm:text-lg shadow-lg border-2 border-gray-300 hover:border-celo disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 min-w-[100px] sm:min-w-[120px]"
          >
            {t('games.blackjack.hit')}
          </button>
          <button
            onClick={onStand}
            disabled={disabled}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-white/90 hover:bg-white text-gray-900 rounded-xl font-bold text-base sm:text-lg shadow-lg border-2 border-gray-300 hover:border-celo disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 min-w-[100px] sm:min-w-[120px]"
          >
            {t('games.blackjack.stand')}
          </button>
        </>
      )}

      {showNewGameButton && (
        <button
          onClick={onNewGame}
          className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-celo to-celo hover:brightness-110 text-gray-900 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 min-w-[120px] sm:min-w-[140px]"
        >
          {t('games.blackjack.newGame')}
        </button>
      )}

      {showOnChainButton && (
        <button
          onClick={onPlayOnChain}
          disabled={disabled}
          className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-celo to-celo hover:brightness-110 text-gray-900 rounded-xl font-bold text-base sm:text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 min-w-[140px] sm:min-w-[160px]"
        >
          {t('games.blackjack.playOnChain')}
        </button>
      )}

      {showPlayAgainButton && (
        <button
          onClick={onPlayOnChain}
          disabled={disabled}
          className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-celo to-celo hover:brightness-110 text-gray-900 rounded-xl font-bold text-base sm:text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 min-w-[120px] sm:min-w-[140px]"
        >
          {t('games.blackjack.playAgain')}
        </button>
      )}
    </div>
  );
}
