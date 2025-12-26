# Profile Banners

This directory contains profile banner images for the Celo Games Portal.

## Directory Structure

```
banners/
├── predefined/     # Predefined banners (8 options)
└── README.md       # This file
```

## Predefined Banners

Place the following banner images in `predefined/` directory:

### Required Images (1200×300px recommended)

1. **gradient-yellow.jpg** - Dégradé jaune officiel Celo (default)
2. **gradient-blue.jpg** - Dégradé bleu apaisant
3. **gradient-purple.jpg** - Dégradé violet mystérieux
4. **gradient-green.jpg** - Dégradé vert nature
5. **pattern-dots.jpg** - Motif géométrique avec points
6. **pattern-waves.jpg** - Motif ondulé dynamique
7. **pattern-hexagons.jpg** - Motif hexagonal moderne
8. **pattern-gaming.jpg** - Thème gaming avec controllers

## Image Specifications

- **Dimensions**: 1200×300px (4:1 aspect ratio)
- **Format**: JPG or PNG
- **Max file size**: 500KB recommended
- **Quality**: High-quality, optimized for web

## Custom Banners

Custom banners uploaded by users are stored in Supabase Storage bucket `user-banners`.

### Upload Requirements

- Users must have played 100+ games to unlock custom banner upload
- Same unlock condition as custom avatars
- Max upload size: 5MB
- Allowed formats: JPEG, PNG, WebP

## Creating Banner Images

You can create banners using:

1. **Gradient Banners**: Use CSS gradients or tools like [CSS Gradient](https://cssgradient.io/)
2. **Pattern Banners**: Use pattern generators like [Hero Patterns](https://heropatterns.com/)
3. **Custom Designs**: Design in Figma, Canva, or Photoshop at 1200×300px

### Example: Simple Gradient Banner (CSS → Screenshot)

```css
/* gradient-yellow.jpg */
background: linear-gradient(135deg, #FCFF52 0%, #f59e0b 100%);

/* gradient-blue.jpg */
background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);

/* gradient-purple.jpg */
background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);

/* gradient-green.jpg */
background: linear-gradient(135deg, #10b981 0%, #047857 100%);
```

## Notes

- Default banner is `gradient-yellow.jpg` (Celo brand color)
- Banners are displayed at the top of profile cards
- Responsive design: banners scale appropriately on mobile
