import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Celo Games Portal — 27 mini-games on Celo blockchain';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const GAMES = [
  '🃏 Blackjack', '✂️ RPS', '⭕ Tic-Tac-Toe', '🎰 Jackpot', '🔢 2048',
  '🧩 Mastermind', '🔵 Connect 4', '🐍 Snake', '🃏 Solitaire', '💣 Minesweeper',
  '🎲 Yahtzee', '🔷 Sudoku', '🧠 Memory', '🌀 Maze', '🟦 Tetris',
  '♠️ Poker', '📝 Wordle', '🧱 Brick Breaker', '🐦 Flappy Bird', '🪙 Plinko',
  '🪙 Coin Flip', '🎡 Roulette', '💧 Water Sort', '➡️ Arrow Escape',
  '👾 Space Invaders', '📈 Hi-Lo', '📊 Crypto H/L',
];

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0f172a 0%, #111827 50%, #0f2017 100%)',
          padding: '52px 60px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: -120, left: -120,
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(252,255,82,0.08) 0%, transparent 70%)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, right: -80,
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
          {/* Celo yellow circle */}
          <div style={{
            width: 64, height: 64,
            borderRadius: '50%',
            background: '#FCFF52',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32,
          }}>
            🎮
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontSize: 42,
              fontWeight: 900,
              color: '#FCFF52',
              letterSpacing: '-1px',
              lineHeight: 1,
            }}>
              CELO GAMES PORTAL
            </span>
            <span style={{ fontSize: 18, color: '#9ca3af', marginTop: 4 }}>
              celo-games-portal.vercel.app
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p style={{
          fontSize: 26,
          color: '#e5e7eb',
          fontWeight: 600,
          marginBottom: 28,
          lineHeight: 1.3,
        }}>
          27 mini-games on Celo blockchain · Free play, On-chain & Multiplayer
        </p>

        {/* Games grid */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px 12px',
          flex: 1,
        }}>
          {GAMES.map((game) => (
            <div
              key={game}
              style={{
                padding: '5px 12px',
                borderRadius: 20,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#d1d5db',
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                display: 'flex',
              }}
            >
              {game}
            </div>
          ))}
        </div>

        {/* Bottom badges */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginTop: 24,
        }}>
          {/* MiniPay badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 24,
            background: 'rgba(52,211,153,0.15)',
            border: '1px solid rgba(52,211,153,0.4)',
          }}>
            <span style={{ fontSize: 18 }}>📱</span>
            <span style={{ color: '#34d399', fontSize: 15, fontWeight: 700 }}>
              MiniPay Compatible
            </span>
          </div>
          {/* Celo badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 24,
            background: 'rgba(252,255,82,0.1)',
            border: '1px solid rgba(252,255,82,0.3)',
          }}>
            <div style={{
              width: 10, height: 10,
              borderRadius: '50%',
              background: '#FCFF52',
              display: 'flex',
            }} />
            <span style={{ color: '#FCFF52', fontSize: 15, fontWeight: 700 }}>
              Celo Mainnet
            </span>
          </div>
          {/* Farcaster badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 24,
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.4)',
          }}>
            <span style={{ fontSize: 18 }}>🔵</span>
            <span style={{ color: '#818cf8', fontSize: 15, fontWeight: 700 }}>
              Farcaster Mini App
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
