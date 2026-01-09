# i18n Audit - Hardcoded Strings Inventory

Date: 2026-01-08
Status: In Progress

## Overview

This document lists all hardcoded strings found in components that need to be internationalized (i18n). Each component should use the `useLanguage()` hook and reference translation keys from `lib/i18n/translations.ts`.

---

## Components with Hardcoded Strings

### 1. Toast.tsx
**File**: `components/ui/Toast.tsx`
**Status**: ❌ Not using i18n
**Priority**: 🔴 HIGH (recently added, user-facing notifications)

| Line | Current English Text | Suggested Translation Key | Notes |
|------|---------------------|---------------------------|-------|
| 84 | "Badge Unlocked!" | `toast.badgeUnlocked` | Title for badge notifications |
| 254 | "Close notification" | `toast.closeNotification` | ARIA label for close button |

**Impact**: Badge notifications and toast messages appear in English only

---

### 2. DifficultySelector.tsx
**File**: `components/connectfive/DifficultySelector.tsx`
**Status**: ❌ Not using i18n
**Priority**: 🔴 HIGH (visible in Connect 4 game)

| Line | Current English Text | Suggested Translation Key | Notes |
|------|---------------------|---------------------------|-------|
| 18 | "Easy" | `games.difficulty.easy` | Easy difficulty label |
| 19 | "Medium" | `games.difficulty.medium` | Medium difficulty label |
| 20 | "Hard" | `games.difficulty.hard` | Hard difficulty label |
| 26 | "AI Difficulty" | `games.difficulty.title` | Section title |

**Impact**: Difficulty selector only shows English labels

---

### 3. ModeToggle.tsx
**File**: `components/shared/ModeToggle.tsx`
**Status**: ❌ Not using i18n
**Priority**: 🔴 HIGH (appears on all game pages)

| Line | Current English Text | Suggested Translation Key | Notes |
|------|---------------------|---------------------------|-------|
| 20 | "Free Play" | `games.mode.freePlay` | Free play mode label |
| 29 | "On-Chain" | `games.mode.onChain` | On-chain mode label |
| 18 | "Switch to free play mode" | `games.mode.switchToFree` | ARIA label |
| 27 | "Switch to on-chain mode" | `games.mode.switchToOnChain` | ARIA label |

**Impact**: Game mode selector only shows English text

---

### 4. WalletConnect.tsx
**File**: `components/shared/WalletConnect.tsx`
**Status**: ❌ Not using i18n
**Priority**: 🟡 MEDIUM (on-chain mode only)

| Line | Current English Text | Suggested Translation Key | Notes |
|------|---------------------|---------------------------|-------|
| 17 | "Connect with your Farcaster wallet" | `wallet.connectFarcaster` | Connector description |
| 18 | "Connect with any mobile wallet" | `wallet.connectWalletConnect` | Connector description |
| 19 | "Connect with MetaMask" | `wallet.connectMetaMask` | Connector description |
| 20 | "Connect with your browser wallet" | `wallet.connectBrowser` | Connector description |
| 53 | "Switching to Celo network..." | `wallet.switchingNetwork` | Network switch status |
| 72 | "via" | `wallet.via` | Connection method prefix |
| 81 | "Disconnect wallet" | `wallet.disconnectLabel` | ARIA label |
| 83 | "Disconnect" | `wallet.disconnect` | Button text |
| 93 | "Connect your wallet to play on-chain" | `wallet.connectPrompt` | Connection prompt |
| 104 | "Farcaster SDK not ready. Some features may not work." | `wallet.farcasterNotReady` | Warning message |
| 111 | "Connect with" | `wallet.connectWith` | Fallback prefix |
| 139 | "No wallet connectors available" | `wallet.noConnectors` | Empty state message |

**Impact**: All wallet connection UI is English-only

---

### 5. GameControls.tsx (Blackjack)
**File**: `components/blackjack/GameControls.tsx`
**Status**: ❌ Not using i18n
**Priority**: 🟡 MEDIUM (Blackjack game only)

| Line | Current English Text | Suggested Translation Key | Notes |
|------|---------------------|---------------------------|-------|
| 43 | "HIT" | `games.blackjack.hit` | Hit button |
| 50 | "STAND" | `games.blackjack.stand` | Stand button |
| 60 | "NEW GAME" | `games.blackjack.newGame` | New game button |
| 70 | "PLAY ON-CHAIN" | `games.blackjack.playOnChain` | On-chain play button |
| 80 | "PLAY AGAIN" | `games.blackjack.playAgain` | Play again button |

**Impact**: Blackjack game controls English-only

---

### 6. Connect Five Game Page
**File**: `app/games/connect-five/page.tsx`
**Status**: ❌ Not using i18n
**Priority**: 🔴 HIGH (main game page)

| Line | Current English Text | Suggested Translation Key | Notes |
|------|---------------------|---------------------------|-------|
| 53 | "← Back to Portal" | `games.backToPortal` | Navigation link |
| 66 | "Connect 4" | `games.connectfive.title` | Game title (or use existing) |
| 68 | "Align 4 pieces in a row on Celo" | `games.connectfive.subtitle` | Game subtitle |
| 107 | "Starting..." | `games.starting` | Loading state |
| 107 | "Start Game" | `games.startGame` | Start button |
| 118 | "Reset" | `games.reset` | Reset button |
| 133 | "🎮 Play against intelligent AI with minimax algorithm" | `games.connectfive.aiInfo` | Footer info |
| 135 | "Contract:" | `games.contract` | Contract label |

**Impact**: Entire Connect 4 page UI is English-only

---

## Recommended Translation Keys to Add

### New Section: `toast`
```typescript
toast: {
  badgeUnlocked: 'Badge Unlocked!',
  closeNotification: 'Close notification',
}
```

**French:**
```typescript
toast: {
  badgeUnlocked: 'Badge Débloqué !',
  closeNotification: 'Fermer la notification',
}
```

---

### New Section: `games`
```typescript
games: {
  // Game modes
  mode: {
    freePlay: 'Free Play',
    onChain: 'On-Chain',
    switchToFree: 'Switch to free play mode',
    switchToOnChain: 'Switch to on-chain mode',
  },

  // Difficulty levels
  difficulty: {
    title: 'AI Difficulty',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  },

  // Common game actions
  startGame: 'Start Game',
  starting: 'Starting...',
  reset: 'Reset',
  backToPortal: '← Back to Portal',
  contract: 'Contract:',

  // Blackjack specific
  blackjack: {
    hit: 'HIT',
    stand: 'STAND',
    newGame: 'NEW GAME',
    playOnChain: 'PLAY ON-CHAIN',
    playAgain: 'PLAY AGAIN',
  },

  // Connect Five specific
  connectfive: {
    title: 'Connect 4',
    subtitle: 'Align 4 pieces in a row on Celo',
    aiInfo: '🎮 Play against intelligent AI with minimax algorithm',
  },
}
```

**French:**
```typescript
games: {
  // Game modes
  mode: {
    freePlay: 'Mode Gratuit',
    onChain: 'Mode On-Chain',
    switchToFree: 'Passer au mode gratuit',
    switchToOnChain: 'Passer au mode on-chain',
  },

  // Difficulty levels
  difficulty: {
    title: 'Difficulté IA',
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
  },

  // Common game actions
  startGame: 'Démarrer',
  starting: 'Démarrage...',
  reset: 'Réinitialiser',
  backToPortal: '← Retour au Portail',
  contract: 'Contrat :',

  // Blackjack specific
  blackjack: {
    hit: 'CARTE',
    stand: 'RESTER',
    newGame: 'NOUVELLE PARTIE',
    playOnChain: 'JOUER ON-CHAIN',
    playAgain: 'REJOUER',
  },

  // Connect Five specific
  connectfive: {
    title: 'Puissance 4',
    subtitle: 'Alignez 4 pièces d\'affilée sur Celo',
    aiInfo: '🎮 Jouez contre une IA intelligente avec algorithme minimax',
  },
}
```

---

### New Section: `wallet`
```typescript
wallet: {
  // Connection
  connectPrompt: 'Connect your wallet to play on-chain',
  connectFarcaster: 'Connect with your Farcaster wallet',
  connectWalletConnect: 'Connect with any mobile wallet',
  connectMetaMask: 'Connect with MetaMask',
  connectBrowser: 'Connect with your browser wallet',
  connectWith: 'Connect with',

  // Status
  switchingNetwork: 'Switching to Celo network...',
  via: 'via',

  // Actions
  disconnect: 'Disconnect',
  disconnectLabel: 'Disconnect wallet',

  // Errors & Warnings
  farcasterNotReady: 'Farcaster SDK not ready. Some features may not work.',
  noConnectors: 'No wallet connectors available',
}
```

**French:**
```typescript
wallet: {
  // Connection
  connectPrompt: 'Connectez votre wallet pour jouer on-chain',
  connectFarcaster: 'Connectez-vous avec votre wallet Farcaster',
  connectWalletConnect: 'Connectez-vous avec n\'importe quel wallet mobile',
  connectMetaMask: 'Connectez-vous avec MetaMask',
  connectBrowser: 'Connectez-vous avec votre wallet navigateur',
  connectWith: 'Connecter avec',

  // Status
  switchingNetwork: 'Changement vers le réseau Celo...',
  via: 'via',

  // Actions
  disconnect: 'Déconnecter',
  disconnectLabel: 'Déconnecter le wallet',

  // Errors & Warnings
  farcasterNotReady: 'SDK Farcaster pas prêt. Certaines fonctionnalités peuvent ne pas fonctionner.',
  noConnectors: 'Aucun connecteur de wallet disponible',
}
```

---

## Summary Statistics

| Category | Count | Priority |
|----------|-------|----------|
| 🔴 HIGH Priority Components | 4 | Toast, DifficultySelector, ModeToggle, ConnectFive page |
| 🟡 MEDIUM Priority Components | 2 | WalletConnect, BlackjackControls |
| 🟢 LOW Priority Components | 0 | - |
| **Total Components** | **6** | |
| **Total Strings** | **41** | |

---

## Implementation Plan

### Phase 1: Add Translation Keys (Est. 30 min)
1. ✅ Create this audit document
2. ⏳ Add `toast` section to translations.ts (EN + FR)
3. ⏳ Add `games` section to translations.ts (EN + FR)
4. ⏳ Add `wallet` section to translations.ts (EN + FR)

### Phase 2: Update Components (Est. 1-2 hours)
1. ⏳ Toast.tsx - Add useLanguage() hook
2. ⏳ DifficultySelector.tsx - Add useLanguage() hook
3. ⏳ ModeToggle.tsx - Add useLanguage() hook
4. ⏳ WalletConnect.tsx - Add useLanguage() hook
5. ⏳ GameControls.tsx (Blackjack) - Add useLanguage() hook
6. ⏳ Connect Five page - Add useLanguage() hook

### Phase 3: Testing (Est. 30 min)
1. ⏳ Test language switching on all affected pages
2. ⏳ Verify badge notifications in both languages
3. ⏳ Test game controls in both languages
4. ⏳ Test wallet connection flow in both languages

---

## Additional Notes

### Components Already Using i18n ✅
The following components already use `useLanguage()` and are **not** included in this audit:
- CreateAccountModal.tsx
- LoginModal.tsx
- Header.tsx
- GameCard.tsx
- BadgeGallery.tsx
- ProfileSetup.tsx
- ProfileCompleteness.tsx
- AvatarSelector.tsx
- AvatarUploadDialog.tsx
- LanguageSwitcher.tsx
- Footer.tsx
- And ~10 other profile/stats components

### Future Considerations
- Other game pages (TicTacToe, 2048, Snake, etc.) may also have hardcoded strings
- Game-specific messages (win/lose messages) may need i18n
- Error messages in game hooks may need translation keys

---

**Audit completed by:** Claude Code
**Next step:** Add translation keys to translations.ts
