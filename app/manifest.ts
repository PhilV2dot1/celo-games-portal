import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Celo Games Portal',
    short_name: 'CeloGames',
    description: 'Play 27 mini-games on Celo blockchain — free, on-chain, and multiplayer. MiniPay compatible.',
    start_url: '/',
    scope: '/',
    id: 'celo-games-portal',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#111827',
    theme_color: '#FCFF52',
    categories: ['games', 'entertainment', 'finance'],
    lang: 'en',
    dir: 'ltr',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/screenshots/home.png',
        sizes: '390x844',
        // @ts-expect-error — 'form_factor' is valid in Web App Manifest spec but not yet in Next.js types
        form_factor: 'narrow',
        label: 'Celo Games Portal — Home',
      },
    ],
    shortcuts: [
      {
        name: 'Crypto Higher / Lower',
        short_name: 'Hi/Lo Crypto',
        description: 'Guess if Token B price is higher or lower than Token A',
        url: '/games/crypto-higher-lower',
        icons: [{ src: '/icons/cryptohigherlower.png', sizes: '96x96' }],
      },
      {
        name: 'Play Blackjack',
        short_name: 'Blackjack',
        description: 'Beat the dealer to 21',
        url: '/blackjack',
        icons: [{ src: '/icons/blackjack.png', sizes: '96x96' }],
      },
      {
        name: 'Play Poker',
        short_name: 'Poker',
        description: "Texas Hold'em vs the dealer",
        url: '/games/poker',
        icons: [{ src: '/icons/poker.png', sizes: '96x96' }],
      },
      {
        name: 'Play Snake',
        short_name: 'Snake',
        description: 'Eat food and grow long',
        url: '/games/snake',
        icons: [{ src: '/icons/snake.png', sizes: '96x96' }],
      },
    ],
  };
}
