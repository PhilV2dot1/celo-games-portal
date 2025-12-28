#!/usr/bin/env python3
"""
Script pour corriger automatiquement les patterns de tests incompatibles avec vi.useFakeTimers()

Problème: vi.advanceTimersByTime() + waitFor() ne fonctionnent pas ensemble
Solution: Remplacer par vi.runAllTimersAsync() + assertions directes
"""

import re
import sys
from pathlib import Path

def fix_timer_patterns(content: str) -> str:
    """Corrige les patterns de timers dans le contenu du fichier"""

    # Pattern 1: Remplacer vi.advanceTimersByTime par vi.runAllTimersAsync
    content = re.sub(
        r'await vi\.advanceTimersByTime\(\d+\);',
        'await vi.runAllTimersAsync();',
        content
    )

    content = re.sub(
        r'vi\.advanceTimersByTime\(\d+\);',
        'await vi.runAllTimersAsync();',
        content
    )

    # Pattern 2: Remplacer vi.advanceTimersByTimeAsync par vi.runAllTimersAsync
    content = re.sub(
        r'await vi\.advanceTimersByTimeAsync\(\d+\);',
        'await vi.runAllTimersAsync();',
        content
    )

    return content

def fix_waitfor_patterns(content: str) -> str:
    """
    Corrige les patterns waitFor() en les supprimant et en gardant les assertions

    AVANT:
    await waitFor(() => {
      expect(result.current.status).toBe('finished');
    });

    APRÈS:
    expect(result.current.status).toBe('finished');
    """

    # Pattern simple: waitFor avec une seule assertion
    pattern = r'await waitFor\(\(\) => \{\s*\n\s*(expect\([^\)]+\)[^\;]+;)\s*\n\s*\}\);'
    content = re.sub(pattern, r'\1', content, flags=re.MULTILINE)

    # Pattern avec multiple assertions
    pattern_multi = r'await waitFor\(\(\) => \{\s*\n((?:\s*expect\([^\}]+\n)+)\s*\}\);'

    def replace_multi(match):
        assertions = match.group(1)
        # Enlever l'indentation supplémentaire
        lines = assertions.split('\n')
        dedented = '\n'.join(line[2:] if len(line) > 2 else line for line in lines)
        return dedented.rstrip()

    content = re.sub(pattern_multi, replace_multi, content, flags=re.MULTILINE)

    return content

def consolidate_act_blocks(content: str) -> str:
    """
    Consolide les blocs act() consécutifs

    AVANT:
    await act(async () => {
      await result.current.play(0);
    });
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    APRÈS:
    await act(async () => {
      result.current.play(0);
      await vi.runAllTimersAsync();
    });
    """

    # Ce pattern est complexe et pourrait nécessiter un parsing AST
    # Pour l'instant, on le fait manuellement si nécessaire
    return content

def fix_test_file(file_path: Path) -> tuple[bool, str]:
    """
    Corrige un fichier de test

    Returns:
        (success, message)
    """
    try:
        # Lire le fichier
        content = file_path.read_text(encoding='utf-8')
        original_content = content

        # Appliquer les corrections
        content = fix_timer_patterns(content)
        content = fix_waitfor_patterns(content)

        # Vérifier si des changements ont été faits
        if content == original_content:
            return True, f"Aucun changement nécessaire pour {file_path.name}"

        # Sauvegarder une backup
        backup_path = file_path.with_suffix(file_path.suffix + '.bak')
        backup_path.write_text(original_content, encoding='utf-8')

        # Écrire le fichier corrigé
        file_path.write_text(content, encoding='utf-8')

        return True, f"[OK] Corrige: {file_path.name} (backup: {backup_path.name})"

    except Exception as e:
        return False, f"[ERREUR] Erreur pour {file_path.name}: {str(e)}"

def main():
    """Point d'entrée principal"""

    if len(sys.argv) < 2:
        print("Usage: python fix-test-timers.py <test-file1> [test-file2] ...")
        print("\nOu pour corriger tous les fichiers de test:")
        print("  python fix-test-timers.py tests/**/*.test.ts tests/**/*.test.tsx")
        sys.exit(1)

    files_to_fix = []
    for arg in sys.argv[1:]:
        path = Path(arg)
        if path.is_file():
            files_to_fix.append(path)
        elif '*' in arg:
            # Pattern glob
            base = Path('.')
            for file in base.glob(arg):
                if file.is_file():
                    files_to_fix.append(file)

    if not files_to_fix:
        print("Aucun fichier trouvé à corriger")
        sys.exit(1)

    print(f"Fichiers à corriger: {len(files_to_fix)}")
    print()

    results = []
    for file_path in files_to_fix:
        success, message = fix_test_file(file_path)
        results.append((success, message))
        print(message)

    print()
    print("=" * 60)
    successful = sum(1 for success, _ in results if success)
    print(f"Résultats: {successful}/{len(results)} fichiers traités avec succès")

    if successful < len(results):
        sys.exit(1)

if __name__ == '__main__':
    main()
