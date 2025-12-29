# Testing Infrastructure - Celo Games Portal

Documentation complète de l'infrastructure de tests pour le Celo Games Portal.

## 📊 Vue d'Ensemble

Le projet dispose d'une infrastructure de tests complète couvrant tous les aspects de l'application :

| Type de Tests | Nombre | Couverture | Status |
|--------------|---------|------------|--------|
| **Unit Tests** | 614 | 100% | ✅ Passing |
| **Component Tests** | 404 | 100% | ✅ Passing |
| **Integration API Tests** | 92 | 100% | ✅ Passing |
| **E2E Tests** | 54 (162 avec browsers) | 100% | ✅ Ready |
| **Blockchain Tests** | 223 | N/A | ⏭️ Skip by default |
| **Total Active** | **1,110+** | **100%** | ✅ **Passing** |

## 🚀 Exécution Rapide

### Tous les Tests (sauf E2E et Blockchain)

```bash
npm test
```

**Résultat attendu**: 1,110+ tests passing, ~236 skipped

### Tests par Catégorie

```bash
# Tests unitaires uniquement
npm run test:unit

# Tests avec watch mode
npm run test:watch

# Tests E2E (nécessite dev server)
npm run test:e2e

# Tests blockchain (nécessite réseau)
RUN_BLOCKCHAIN_TESTS=true npm run test:blockchain
```

## 📁 Structure des Tests

```
tests/
├── unit/                      # Tests unitaires (614 tests)
│   ├── hooks/                 # Tests des custom React hooks
│   ├── lib/                   # Tests des utilitaires
│   └── utils/                 # Tests des fonctions helper
│
├── component/                 # Tests de composants (404 tests)
│   ├── auth/                  # Composants d'authentification
│   ├── badges/                # Composants de badges
│   ├── games/                 # Composants de jeux
│   ├── profile/               # Composants de profil
│   └── ui/                    # Composants UI génériques
│
├── integration/               # Tests d'intégration (92 tests)
│   └── api/                   # Tests des endpoints API
│       ├── badges/            # API badges
│       ├── leaderboard/       # API leaderboard
│       └── user/              # API utilisateur
│
├── e2e/                       # Tests End-to-End (54 tests × 3 browsers)
│   ├── helpers/               # Helpers E2E réutilisables
│   ├── scripts/               # Scripts helper pour exécution
│   ├── user-registration.spec.ts
│   ├── profile-customization.spec.ts
│   ├── badge-earning.spec.ts
│   └── leaderboard.spec.ts
│
└── blockchain/                # Tests blockchain (223 tests)
    ├── contracts/             # Tests des smart contracts
    ├── helpers/               # Helpers blockchain
    ├── scripts/               # Scripts helper pour exécution
    └── setup/                 # Configuration wallet de test
```

## 🧪 Types de Tests Détaillés

### 1. Tests Unitaires (614 tests)

**Location**: `tests/unit/`

**Technologies**: Vitest, @testing-library/react

**Couverture**:
- ✅ Custom React Hooks (useJackpot, useTicTacToe, etc.)
- ✅ Utilitaires et fonctions helper
- ✅ Logique métier isolée
- ✅ Validation et formatage de données

**Exécution**:
```bash
npm run test:unit
```

**Documentation**: Voir README dans chaque sous-dossier

---

### 2. Tests de Composants (404 tests)

**Location**: `tests/component/`

**Technologies**: Vitest, @testing-library/react, happy-dom

**Couverture**:
- ✅ Rendu des composants React
- ✅ Interactions utilisateur
- ✅ Props et state management
- ✅ Événements et callbacks
- ✅ Accessibilité de base

**Exécution**:
```bash
# Tous les composants
npm test -- tests/component

# Un composant spécifique
npm test -- tests/component/profile/ProfileCard.test.tsx
```

---

### 3. Tests d'Intégration API (92 tests)

**Location**: `tests/integration/api/`

**Technologies**: Vitest, Supabase mocks

**Couverture**:
- ✅ Endpoints API complets
- ✅ Validation des requêtes
- ✅ Gestion des erreurs
- ✅ Authentification et autorisation
- ✅ Interactions base de données

**Exécution**:
```bash
# Tous les tests API
npm test -- tests/integration

# Un endpoint spécifique
npm test -- tests/integration/api/user/profile.test.ts
```

**Features**:
- Mocking complet de Supabase
- Tests de cas d'erreur (404, 500, validation)
- Tests de race conditions
- Tests de création/mise à jour/lecture

---

### 4. Tests End-to-End (54 tests)

**Location**: `tests/e2e/`

**Technologies**: Playwright

**Navigateurs**: Chromium, Firefox, Mobile Chrome (162 tests total)

**Couverture**:
- ✅ Parcours utilisateur complets
- ✅ Inscription et onboarding (9 tests)
- ✅ Personnalisation profil (14 tests)
- ✅ Système de badges (14 tests)
- ✅ Leaderboard (17 tests)

**Exécution**:

**Méthode Recommandée - Helper Scripts**:
```bash
# Windows
cd tests\e2e\scripts
run-e2e-tests.bat              # Headless
run-e2e-tests.bat --headed     # Avec fenêtre
run-e2e-tests.bat --debug      # Mode debug
run-e2e-tests.bat --ui         # Interface UI

# Linux/Mac
cd tests/e2e/scripts
./run-e2e-tests.sh             # Headless
./run-e2e-tests.sh --headed    # Avec fenêtre
./run-e2e-tests.sh --debug     # Mode debug
```

**Méthode Manuelle**:
```bash
npm run test:e2e               # Tous les navigateurs
npm run test:e2e:headed        # Mode visible
npm run test:e2e:debug         # Mode debug
npx playwright test --ui       # Interface UI
```

**Documentation**: [tests/e2e/README.md](tests/e2e/README.md)

---

### 5. Tests Blockchain (223 tests)

**Location**: `tests/blockchain/`

**Technologies**: Viem, Playwright test runner

**Network**: Celo Alfajores Testnet (Chain ID: 44787)

**Couverture**:
- ✅ Validation réseau (13 tests)
- ✅ Tests de lecture contrats (read operations)
- ✅ Tests d'écriture contrats (write operations)
- ✅ Parsing des événements blockchain
- ✅ 6 smart contracts testés

**⚠️ Skip par Défaut**: Ces tests sont skippés par défaut car ils nécessitent une connexion réseau active.

**Activation**:

**Helper Scripts**:
```bash
# Windows
cd tests\blockchain\scripts
run-blockchain-tests.bat

# Linux/Mac
cd tests/blockchain/scripts
./run-blockchain-tests.sh
```

**Manuel**:
```bash
RUN_BLOCKCHAIN_TESTS=true npm run test:blockchain
```

**Documentation**:
- [tests/blockchain/README.md](tests/blockchain/README.md) - Guide complet
- [tests/blockchain/CONTRACTS.md](tests/blockchain/CONTRACTS.md) - Documentation contrats

---

## 🛠️ Helper Scripts

Des scripts helper sont disponibles pour faciliter l'exécution des tests :

### Tests E2E

**Location**: `tests/e2e/scripts/`

- `run-e2e-tests.sh` (Linux/Mac)
- `run-e2e-tests.ps1` (PowerShell)
- `run-e2e-tests.bat` (Windows)

**Features**:
- Vérification installation Playwright
- Détection dev server
- Multiples modes d'exécution
- Messages d'aide et debugging

### Tests Blockchain

**Location**: `tests/blockchain/scripts/`

- `run-blockchain-tests.sh` (Linux/Mac)
- `run-blockchain-tests.ps1` (PowerShell)
- `run-blockchain-tests.bat` (Windows)

**Features**:
- Configuration automatique de RUN_BLOCKCHAIN_TESTS
- Vérification .env.test
- Détection wallet de test
- Messages d'aide clairs

---

## ⚙️ Configuration

### Vitest (Unit, Component, Integration)

**Fichier**: `vitest.config.ts`

**Configuration clé**:
- Environment: happy-dom (pour composants React)
- Coverage: v8
- Globals: true
- Timeout: 10s par test

### Playwright (E2E)

**Fichier**: `playwright.config.ts`

**Configuration clé**:
- Base URL: http://localhost:3000
- Projects: Chromium, Firefox, Mobile Chrome
- Screenshots: Sur échec
- Traces: Sur premier retry
- Web Server: Démarre automatiquement Next.js

### Tests Blockchain

**Fichier**: `tests/blockchain/helpers/test-config.ts`

**Configuration clé**:
- Skip par défaut (RUN_BLOCKCHAIN_TESTS=false)
- Network: Alfajores (44787)
- RPC: https://alfajores-forno.celo-testnet.org
- Timeout: Variable selon type de test

---

## 📈 CI/CD

### GitHub Actions (Exemple)

Des workflows exemple sont disponibles pour automatiser les tests en CI/CD :

**E2E Tests**: `tests/e2e/.github-workflows-example.yml`
- Matrix strategy (Chromium, Firefox)
- Tests mobile sur main
- Upload artifacts (rapports, screenshots)
- Retry automatique

**Pour activer**:
```bash
# Copier le workflow exemple
cp tests/e2e/.github-workflows-example.yml .github/workflows/e2e-tests.yml

# Configurer les secrets GitHub si nécessaire
# Push ou créer une PR
```

**Configuration recommandée**:
- Run tests sur push vers main/develop
- Run tests sur toutes les PRs
- Skip blockchain tests en CI (ou run sur scheduled)
- Upload artifacts pour debugging

---

## 🐛 Debugging

### Tests Unitaires/Composants

```bash
# Mode watch avec UI
npm run test:ui

# Mode verbose
npm test -- --reporter=verbose

# Un test spécifique
npm test -- tests/unit/hooks/useJackpot.test.ts
```

### Tests E2E

```bash
# Mode headed (voir le navigateur)
npm run test:e2e:headed

# Mode debug (inspector Playwright)
npm run test:e2e:debug

# Interface UI
npx playwright test --ui

# Voir le rapport après exécution
npx playwright show-report
```

### Tests Blockchain

```bash
# Mode verbose
RUN_BLOCKCHAIN_TESTS=true npx vitest tests/blockchain --reporter=verbose

# Un fichier spécifique
RUN_BLOCKCHAIN_TESTS=true npx vitest tests/blockchain/contracts/blackjack.read.test.ts
```

**Debugging Tips**:
1. Vérifier les logs de console
2. Utiliser `--reporter=verbose` pour détails
3. Screenshots automatiques sur échec (E2E)
4. Traces Playwright pour rejouer les tests
5. Vérifier balance wallet (blockchain tests)

---

## 📊 Coverage

### Générer le Rapport de Coverage

```bash
npm run test:unit
```

Le rapport de coverage est généré dans `coverage/` et affiché dans le terminal.

**Objectifs de Coverage**:
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

---

## 🔧 Bonnes Pratiques

### 1. Isolation des Tests
- ✅ Chaque test doit être indépendant
- ✅ Pas de dépendances entre tests
- ✅ Cleanup après chaque test (afterEach)
- ✅ Mocks réinitialisés entre tests

### 2. Nomenclature
```typescript
// ✅ Bon
describe('useJackpot', () => {
  test('should spin and award points in free mode', () => {})
})

// ❌ Éviter
describe('test', () => {
  test('test1', () => {})
})
```

### 3. Assertions Claires
```typescript
// ✅ Bon
expect(result.totalPoints).toBe(100)
expect(user.username).toMatch(/^Player_/)

// ❌ Éviter
expect(result).toBeTruthy()
```

### 4. Data Test IDs
```tsx
// ✅ Bon
<button data-testid="save-profile">Save</button>

// Puis dans les tests
await page.click('[data-testid="save-profile"]')
```

### 5. Helpers Réutilisables
- Créer des helpers dans `tests/*/helpers/`
- Factoriser le code commun
- Documenter les helpers

---

## 🚨 Dépannage

### Tests Timeout

**Problème**: Tests qui timeout après 10s

**Solutions**:
```typescript
// Augmenter le timeout pour un test spécifique
test('slow operation', async () => {
  // test code
}, 30000) // 30 secondes

// Ou dans le fichier de config
```

### Blockchain Tests Failing

**Problème**: Tests blockchain échouent ou timeout

**Solutions**:
1. Vérifier connexion internet
2. Vérifier RPC Alfajores: https://alfajores-forno.celo-testnet.org
3. Vérifier balance wallet (pour write tests)
4. Voir [tests/blockchain/README.md](tests/blockchain/README.md)

### E2E Tests Flaky

**Problème**: Tests E2E instables

**Solutions**:
1. Utiliser `waitFor` au lieu de `waitForTimeout`
2. Augmenter les timeouts si nécessaire
3. Utiliser `data-testid` au lieu de sélecteurs CSS fragiles
4. Vérifier les race conditions
5. Run en mode headed pour debug

### Worker Errors

**Problème**: "Worker exited unexpectedly"

**Solutions**:
1. Vérifier la mémoire disponible
2. Réduire le nombre de workers: `vitest --pool=forks --poolOptions.forks.singleFork`
3. Isoler le test qui cause le problème

---

## 📚 Documentation Détaillée

Pour plus de détails sur chaque type de tests :

- **E2E Tests**: [tests/e2e/README.md](tests/e2e/README.md)
- **Blockchain Tests**: [tests/blockchain/README.md](tests/blockchain/README.md)
- **Smart Contracts**: [tests/blockchain/CONTRACTS.md](tests/blockchain/CONTRACTS.md)
- **Playwright Config**: [playwright.config.ts](playwright.config.ts)
- **Vitest Config**: [vitest.config.ts](vitest.config.ts)

---

## 🎯 Résumé

**Infrastructure de Tests Complète**:
- ✅ 1,110+ tests actifs (100% passing)
- ✅ 4 types de tests (Unit, Component, Integration, E2E)
- ✅ 223 tests blockchain (skip by default)
- ✅ Helper scripts multi-plateformes
- ✅ Documentation complète
- ✅ CI/CD ready
- ✅ Coverage à 100% des fonctionnalités critiques

**Commandes Rapides**:
```bash
npm test                     # Tous les tests (sauf E2E/blockchain)
npm run test:e2e            # Tests E2E
npm run test:ui             # Interface de test interactive
npx playwright show-report   # Rapport E2E
```

**Support**:
- Issues GitHub: Pour reporter des bugs de tests
- Documentation: Voir fichiers README dans chaque dossier de tests
- Helper Scripts: Dans `tests/*/scripts/` pour exécution facilitée

---

**Dernière mise à jour**: 2025-12-29
**Version**: 1.0.0
**Tests Total**: 1,110+ passing (1,346 total avec skipped)
