/**
 * Generate predefined avatar SVGs with emojis
 * Run with: node scripts/generate-avatars.js
 */

const fs = require('fs');
const path = require('path');

const AVATARS = [
  { name: 'default-player', emoji: '🎮', color: '#4B5563' },
  { name: 'controller', emoji: '🎮', color: '#3B82F6' },
  { name: 'joystick', emoji: '🕹️', color: '#8B5CF6' },
  { name: 'trophy', emoji: '🏆', color: '#F59E0B' },
  { name: 'crown', emoji: '👑', color: '#FCFF52' },
  { name: 'star', emoji: '⭐', color: '#FBBF24' },
  { name: 'rocket', emoji: '🚀', color: '#EF4444' },
  { name: 'gem', emoji: '💎', color: '#06B6D4' },
  { name: 'flame', emoji: '🔥', color: '#F97316' },
  { name: 'lightning', emoji: '⚡', color: '#FCD34D' },
  { name: 'heart', emoji: '❤️', color: '#EC4899' },
  { name: 'dice', emoji: '🎲', color: '#10B981' },
  { name: 'coin', emoji: '🪙', color: '#F59E0B' },
  { name: 'target', emoji: '🎯', color: '#EF4444' },
  { name: 'bomb', emoji: '💣', color: '#1F2937' },
  { name: 'ninja', emoji: '🥷', color: '#374151' },
  { name: 'pirate', emoji: '🏴‍☠️', color: '#111827' },
  { name: 'wizard', emoji: '🧙', color: '#8B5CF6' },
  { name: 'knight', emoji: '⚔️', color: '#6B7280' },
  { name: 'dragon', emoji: '🐉', color: '#DC2626' },
  { name: 'robot', emoji: '🤖', color: '#6366F1' },
  { name: 'alien', emoji: '👽', color: '#10B981' },
  { name: 'ghost', emoji: '👻', color: '#E5E7EB' },
  { name: 'skull', emoji: '💀', color: '#F3F4F6' },
  { name: 'moon', emoji: '🌙', color: '#FEF3C7' },
  { name: 'sun', emoji: '☀️', color: '#FDE68A' },
  { name: 'planet', emoji: '🪐', color: '#A78BFA' },
  { name: 'phoenix', emoji: '🔥', color: '#FB923C' },
  { name: 'shield', emoji: '🛡️', color: '#60A5FA' },
  { name: 'sword', emoji: '⚔️', color: '#9CA3AF' },
];

const createSVG = (emoji, bgColor) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${bgColor}"/>
  <text x="50" y="50" font-size="50" text-anchor="middle" dominant-baseline="central">${emoji}</text>
</svg>`;

const outputDir = path.join(__dirname, '..', 'public', 'avatars', 'predefined');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate all avatars
AVATARS.forEach(({ name, emoji, color }) => {
  const svg = createSVG(emoji, color);
  const filename = `${name}.svg`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, svg, 'utf8');
  console.log(`✅ Created ${filename}`);
});

console.log(`\n🎉 Generated ${AVATARS.length} avatar SVGs in ${outputDir}`);
