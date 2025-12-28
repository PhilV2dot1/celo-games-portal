# Guide de Correction des Tests - Timers et waitFor()

## 🎯 Objectif

Corriger les tests qui utilisent `vi.useFakeTimers()` + `waitFor()`, une combinaison incompatible qui cause des timeouts.

## ✅ Succès: useRockPaperScissors.test.ts

**Résultat**: 33/33 tests passent (vs 31 échecs timeout avant)

## 🔧 Pattern de Correction

### Avant (❌ Timeout)

```typescript
await act(async () => {
  result.current.handleMove(0);
});

await act(async () => {
  await vi.advanceTimersByTime(600);
});

await waitFor(() => {
  expect(result.current.status).toBe('finished');
  expect(result.current.result).toBe('win');
});
```

### Après (✅ Fonctionne)

```typescript
await act(async () => {
  result.current.handleMove(0);
  await vi.runAllTimersAsync();
});

// Assertions directes, pas de waitFor
expect(result.current.status).toBe('finished');
expect(result.current.result).toBe('win');
```

## 📝 Étapes de Correction

### Étape 1: Remplacer vi.advanceTimersByTime()

**Chercher:**
```typescript
await vi.advanceTimersByTime(X);
```

**Remplacer par:**
```typescript
await vi.runAllTimersAsync();
```

### Étape 2: Supprimer waitFor() et extraire les assertions

**Chercher:**
```typescript
await waitFor(() => {
  expect(...);
  expect(...);
});
```

**Remplacer par:**
```typescript
// Assertions directes
expect(...);
expect(...);
```

### Étape 3: Consolider les blocs act()

Si vous avez des blocs `act()` consécutifs, consolidez-les:

**Avant:**
```typescript
await act(async () => {
  result.current.play(0);
});

await act(async () => {
  await vi.runAllTimersAsync();
});
```

**Après:**
```typescript
await act(async () => {
  result.current.play(0);
  await vi.runAllTimersAsync();
});
```

## 📋 Fichiers à Corriger (par Priorité)

### Haute Priorité (Timeouts - même pattern)

1. **useTicTacToe.test.ts** - 23 tests timeout
   - Localisation: `tests/unit/hooks/useTicTacToe.test.ts`
   - `waitFor()` à supprimer: 9+ occurrences
   - Lignes: 304, 334, 377, 553, 597, 638, 709, 750, 1035

2. **ProfileSetup.test.tsx** - 17 tests timeout
   - Localisation: `tests/unit/components/profile/ProfileSetup.test.tsx`
   - Vérifier l'existence du fichier

3. **CreateAccountModal.test.tsx** - 23 tests timeout
   - Localisation: `tests/unit/components/auth/CreateAccountModal.test.tsx`
   - Vérifier l'existence du fichier

### Priorité Moyenne (Autres échecs)

4. **ThemeSelector.test.tsx** - 8 échecs
5. **useMastermind.test.ts** - 5 échecs
6. **BadgeGallery.test.tsx** - 3 échecs
7. **AuthProvider.test.tsx** + **GameCard.test.tsx** - 2 échecs

## 🔍 Exemple Complet: useTicTacToe.test.ts

### Test Original (ligne 100-134)

```typescript
it('should detect horizontal win on first row', async () => {
  const { result } = renderHook(() => useTicTacToe());

  await act(async () => {
    await result.current.startGame();
  });

  // Set up board for horizontal win: X X X | _ _ _ | _ _ _
  act(() => {
    result.current.handleMove(0);
  });
  await act(async () => {
    await vi.runAllTimersAsync();  // ✅ Déjà corrigé
  });

  act(() => {
    result.current.handleMove(1);
  });
  await act(async () => {
    await vi.runAllTimersAsync();  // ✅ Déjà corrigé
  });

  act(() => {
    result.current.handleMove(2);
  });
  await act(async () => {
    await vi.runAllTimersAsync();  // ✅ Déjà corrigé
  });

  // Should detect win
  await waitFor(() => {  // ❌ PROBLÈME ICI
    expect(result.current.result).toBe('win');
    expect(result.current.status).toBe('finished');
  });
});
```

### Test Corrigé

```typescript
it('should detect horizontal win on first row', async () => {
  const { result } = renderHook(() => useTicTacToe());

  await act(async () => {
    await result.current.startGame();
  });

  // Set up board for horizontal win: X X X | _ _ _ | _ _ _
  await act(async () => {
    result.current.handleMove(0);
    await vi.runAllTimersAsync();
  });

  await act(async () => {
    result.current.handleMove(1);
    await vi.runAllTimersAsync();
  });

  await act(async () => {
    result.current.handleMove(2);
    await vi.runAllTimersAsync();
  });

  // Direct assertions - no waitFor
  expect(result.current.result).toBe('win');
  expect(result.current.status).toBe('finished');
});
```

## 🛠️ Script de Correction Automatique (Partiel)

Le script `fix-test-timers.py` a été créé mais nécessite des améliorations pour gérer tous les cas.

**Utilisation actuelle:**
```bash
cd tests
python fix-test-timers.py unit/hooks/useTicTacToe.test.ts
```

**Limitations:**
- Ne gère pas tous les patterns de `waitFor()`
- Ne consolide pas automatiquement les blocs `act()`
- Nécessite une révision manuelle après exécution

## ✅ Checklist de Vérification

Après correction d'un fichier:

- [ ] Tous les `vi.advanceTimersByTime()` sont remplacés par `vi.runAllTimersAsync()`
- [ ] Tous les `waitFor()` sont supprimés
- [ ] Les assertions sont directes (pas dans des callbacks)
- [ ] Les blocs `act()` consécutifs sont consolidés quand possible
- [ ] Le fichier compile sans erreurs TypeScript
- [ ] Exécuter le test: `npm run test -- <fichier> --run`
- [ ] Tous les tests du fichier passent

## 📊 Progression

- [x] useRockPaperScissors.test.ts (33/33 tests ✅)
- [ ] useTicTacToe.test.ts (0/40 tests)
- [ ] ProfileSetup.test.tsx
- [ ] CreateAccountModal.test.tsx
- [ ] ThemeSelector.test.tsx
- [ ] useMastermind.test.ts
- [ ] BadgeGallery.test.tsx
- [ ] AuthProvider.test.tsx
- [ ] GameCard.test.tsx

## 🎯 Objectif Final

**Cible**: 103 tests échoués → 0 tests échoués
**Progression**: 33 tests corrigés (useRockPaperScissors)
**Restant**: ~70 tests à corriger

Une fois tous les tests corrigés, le rapport de couverture pourra être généré avec:
```bash
npm run test:unit
```

## 💡 Conseils

1. **Corriger un fichier à la fois** et tester immédiatement
2. **Commencer par useTicTacToe.test.ts** car c'est un hook (pattern similaire à useRockPaperScissors)
3. **Utiliser la recherche/remplacement** dans votre éditeur pour les patterns répétitifs
4. **Valider avec git diff** avant de commit

## 🔗 Références

- [Vitest Fake Timers](https://vitest.dev/api/vi.html#vi-usefaketimers)
- [Testing Library waitFor](https://testing-library.com/docs/dom-testing-library/api-async/#waitfor)
- Issue GitHub Vitest: https://github.com/vitest-dev/vitest/issues/1115

---

**Créé le**: 2025-12-28
**Dernière mise à jour**: 2025-12-28
**Auteur**: Claude Code Assistant
