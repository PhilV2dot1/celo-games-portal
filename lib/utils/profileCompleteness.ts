/**
 * Profile Completeness Utility
 * Calculates profile completion score and tracks completed actions
 */

export interface ProfileCompletenessCheck {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  weight: number; // Points awarded for completing this check
}

export interface ProfileCompletenessResult {
  percentage: number; // 0-100
  completedChecks: number;
  totalChecks: number;
  checks: ProfileCompletenessCheck[];
  level: 'beginner' | 'intermediate' | 'advanced' | 'complete';
  nextAction?: string; // Suggestion for next action to complete
}

interface ProfileData {
  display_name?: string;
  username?: string;
  bio?: string;
  avatar_type?: 'default' | 'predefined' | 'custom';
  social_links?: {
    twitter?: string;
    farcaster?: string;
    discord?: string;
  };
  total_points?: number;
  stats?: {
    gamesPlayed?: number;
  };
}

/**
 * Calculate profile completeness based on user data
 */
export function calculateProfileCompleteness(profile: ProfileData): ProfileCompletenessResult {
  const checks: ProfileCompletenessCheck[] = [
    {
      id: 'display_name',
      label: 'Nom affiché défini',
      description: 'Ajoutez un nom d\'affichage personnalisé avec espaces et émojis',
      completed: !!(profile.display_name && profile.display_name !== profile.username),
      weight: 15,
    },
    {
      id: 'custom_avatar',
      label: 'Avatar personnalisé',
      description: 'Choisissez un avatar prédéfini ou téléchargez le vôtre',
      completed: profile.avatar_type === 'predefined' || profile.avatar_type === 'custom',
      weight: 15,
    },
    {
      id: 'bio',
      label: 'Bio renseignée',
      description: 'Décrivez-vous en quelques mots (min. 20 caractères)',
      completed: !!(profile.bio && profile.bio.trim().length >= 20),
      weight: 15,
    },
    {
      id: 'social_link',
      label: 'Lien social ajouté',
      description: 'Ajoutez au moins un lien social (Twitter, Farcaster, Discord)',
      completed: !!(
        profile.social_links &&
        (profile.social_links.twitter ||
          profile.social_links.farcaster ||
          profile.social_links.discord)
      ),
      weight: 15,
    },
    {
      id: 'first_game',
      label: 'Premier jeu joué',
      description: 'Jouez à votre premier jeu et gagnez des points',
      completed: !!(profile.stats?.gamesPlayed && profile.stats.gamesPlayed > 0),
      weight: 20,
    },
    {
      id: 'points_milestone',
      label: '100 points atteints',
      description: 'Atteignez 100 points en jouant aux jeux',
      completed: !!(profile.total_points && profile.total_points >= 100),
      weight: 20,
    },
  ];

  // Calculate completion
  const completedChecks = checks.filter((c) => c.completed).length;
  const totalChecks = checks.length;
  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const earnedWeight = checks
    .filter((c) => c.completed)
    .reduce((sum, check) => sum + check.weight, 0);

  const percentage = Math.round((earnedWeight / totalWeight) * 100);

  // Determine level
  let level: ProfileCompletenessResult['level'];
  if (percentage === 100) {
    level = 'complete';
  } else if (percentage >= 70) {
    level = 'advanced';
  } else if (percentage >= 40) {
    level = 'intermediate';
  } else {
    level = 'beginner';
  }

  // Find next action (first incomplete check)
  const nextIncompleteCheck = checks.find((c) => !c.completed);
  const nextAction = nextIncompleteCheck?.description;

  return {
    percentage,
    completedChecks,
    totalChecks,
    checks,
    level,
    nextAction,
  };
}

/**
 * Get level badge emoji and text
 */
export function getLevelBadge(level: ProfileCompletenessResult['level']): {
  emoji: string;
  text: string;
  color: string;
} {
  switch (level) {
    case 'complete':
      return { emoji: '🏆', text: 'Profil Complet', color: 'text-yellow-600' };
    case 'advanced':
      return { emoji: '⭐', text: 'Avancé', color: 'text-blue-600' };
    case 'intermediate':
      return { emoji: '📈', text: 'Intermédiaire', color: 'text-green-600' };
    case 'beginner':
      return { emoji: '🌱', text: 'Débutant', color: 'text-gray-600' };
  }
}

/**
 * Get motivational message based on completion level
 */
export function getMotivationalMessage(percentage: number): string {
  if (percentage === 100) {
    return 'Félicitations! Votre profil est parfait! 🎉';
  } else if (percentage >= 80) {
    return 'Excellent! Encore quelques détails et c\'est parfait!';
  } else if (percentage >= 60) {
    return 'Très bien! Vous êtes sur la bonne voie!';
  } else if (percentage >= 40) {
    return 'Bon début! Continuez à compléter votre profil!';
  } else if (percentage >= 20) {
    return 'C\'est un début! Complétez quelques actions pour améliorer votre profil.';
  } else {
    return 'Bienvenue! Commencez par compléter votre profil.';
  }
}
