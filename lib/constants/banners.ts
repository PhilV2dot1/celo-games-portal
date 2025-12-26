/**
 * Profile Banner Options
 * Defines the predefined banner options for user profiles
 */

export type BannerType = 'default' | 'predefined' | 'custom';

export interface BannerOption {
  id: string;
  name: string;
  url: string;
  description: string;
}

/**
 * Predefined banner options (1200×300px recommended)
 * Images should be placed in public/banners/predefined/
 */
export const PREDEFINED_BANNERS: BannerOption[] = [
  {
    id: 'gradient-yellow',
    name: 'Dégradé Jaune Celo',
    url: '/banners/predefined/gradient-yellow.jpg',
    description: 'Dégradé jaune officiel Celo',
  },
  {
    id: 'gradient-blue',
    name: 'Dégradé Bleu',
    url: '/banners/predefined/gradient-blue.jpg',
    description: 'Dégradé bleu apaisant',
  },
  {
    id: 'gradient-purple',
    name: 'Dégradé Violet',
    url: '/banners/predefined/gradient-purple.jpg',
    description: 'Dégradé violet mystérieux',
  },
  {
    id: 'gradient-green',
    name: 'Dégradé Vert',
    url: '/banners/predefined/gradient-green.jpg',
    description: 'Dégradé vert nature',
  },
  {
    id: 'pattern-dots',
    name: 'Motif Points',
    url: '/banners/predefined/pattern-dots.jpg',
    description: 'Motif géométrique avec points',
  },
  {
    id: 'pattern-waves',
    name: 'Motif Vagues',
    url: '/banners/predefined/pattern-waves.jpg',
    description: 'Motif ondulé dynamique',
  },
  {
    id: 'pattern-hexagons',
    name: 'Motif Hexagones',
    url: '/banners/predefined/pattern-hexagons.jpg',
    description: 'Motif hexagonal moderne',
  },
  {
    id: 'pattern-gaming',
    name: 'Gaming',
    url: '/banners/predefined/pattern-gaming.jpg',
    description: 'Thème gaming avec controllers',
  },
];

/**
 * Default banner (used for new users)
 */
export const DEFAULT_BANNER = PREDEFINED_BANNERS[0];

/**
 * Get banner by ID
 */
export function getBanner(bannerId: string): BannerOption | undefined {
  return PREDEFINED_BANNERS.find((b) => b.id === bannerId);
}

/**
 * Get banner URL with fallback
 */
export function getBannerUrl(bannerUrl?: string | null, bannerType?: string | null): string {
  if (!bannerUrl || !bannerType) {
    return DEFAULT_BANNER.url;
  }

  if (bannerType === 'custom') {
    return bannerUrl;
  }

  return bannerUrl;
}

/**
 * Validate if user can upload custom banner
 * Same logic as custom avatar - unlocked after 100 games or Veteran badge
 */
export function canUploadCustomBanner(gamesPlayed: number): boolean {
  return gamesPlayed >= 100;
}
