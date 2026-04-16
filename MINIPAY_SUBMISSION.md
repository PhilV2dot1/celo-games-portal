# MiniPay App Store — Submission Details

Use this file when filling the MiniPay / Opera Mini DApp submission form.

Submission form: https://minipaydapps.com
Celo docs: https://docs.celo.org/build-on-celo/build-on-minipay/overview

---

## App Information

**App Name**
Celo Games Portal

**Short Name**
CeloGames

**Tagline (one sentence)**
Play 27 mini-games on Celo blockchain — free, on-chain, and multiplayer.

**Description (long)**
Celo Games Portal is a collection of 27 browser mini-games fully integrated with the Celo blockchain.
Play for free or go on-chain to record your scores and stats permanently.
Inside MiniPay your wallet connects automatically — no sign-up, no setup needed.

Games include: Blackjack, Poker, Rock Paper Scissors, Tic-Tac-Toe, Jackpot, 2048, Mastermind,
Connect 4, Snake, Solitaire, Minesweeper, Yahtzee, Sudoku, Memory, Maze, Tetris, Wordle,
Brick Breaker, Flappy Bird, Plinko, Coin Flip, Roulette, Water Sort, Arrow Escape,
Space Invaders, Hi-Lo, and Crypto Higher / Lower.

**Category**
Games / Entertainment

**Tags**
games, blockchain, celo, casino, puzzle, arcade, strategy, cards, multiplayer

---

## URLs

**App URL (main entry point)**
https://celo-games-portal.vercel.app

**MiniPay landing page**
https://celo-games-portal.vercel.app/miniapp

**Icon (512×512 PNG)**
https://celo-games-portal.vercel.app/icon-512.png

**Maskable Icon (512×512 PNG)**
https://celo-games-portal.vercel.app/icon-maskable-512.png

**OG / Preview Image (1200×630 PNG)**
https://celo-games-portal.vercel.app/opengraph-image

**Web App Manifest**
https://celo-games-portal.vercel.app/manifest.webmanifest

---

## Technical Details

**Blockchain**
Celo Mainnet (chainId: 42220)

**Smart Contracts**
25 deployed contracts on Celo — see https://celo-games-portal.vercel.app

**MiniPay Integration**
- Detects window.ethereum.isMiniPay automatically
- Wallet auto-connects via injected provider (no Connect button shown)
- Forces on-chain mode when inside MiniPay
- Skips Farcaster SDK initialization in MiniPay context
- Tested via /test-minipay diagnostic page

**Supported Assets**
CELO (for gas fees — sub-cent transactions)

**Does your app require login?**
No — wallet-based, no email/password

**Does your app work offline?**
Partial — free-play games work offline; on-chain games require network

---

## Contact

**Developer**
Philv2dot1

**Email**
philv2dot1@gmail.com

**GitHub**
https://github.com/PhilV2dot1/celo-games-portal

---

## Screenshots needed for submission

Take these screenshots inside MiniPay or using the /test-minipay simulation:

1. **Home screen** — game grid with MiniPay banner visible at top
2. **Game screen** — any game showing the "📱 MiniPay · On-Chain" badge
3. **WalletConnect badge** — green connected state with address
4. **Gameover screen** — score + on-chain confirmation

Recommended size: 390×844 (iPhone 14 Pro) or 412×915 (Android)
