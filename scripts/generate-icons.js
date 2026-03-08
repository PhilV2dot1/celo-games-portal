#!/usr/bin/env node
/**
 * PWA Icon Generator — Celo Games Portal
 * Design: fond jaune #FCFF52, gamepad stylisé, texte "CELO GAMES"
 * Run: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, '..', 'public');

// SVG source — 512x512 base
function makeSVG(size, maskable = false) {
  const pad = maskable ? Math.round(size * 0.12) : Math.round(size * 0.06);
  const inner = size - pad * 2;
  const cx = size / 2;
  const cy = size / 2;
  const r = maskable ? 0 : Math.round(size * 0.18); // rounded corners for non-maskable

  // Scale factors based on size
  const s = size / 512;

  // Gamepad body dimensions
  const gpW = Math.round(280 * s);
  const gpH = Math.round(180 * s);
  const gpX = cx - gpW / 2;
  const gpY = cy - gpH / 2 - Math.round(30 * s);
  const gpR = Math.round(50 * s);

  // D-pad
  const dpCx = cx - Math.round(85 * s);
  const dpCy = gpY + Math.round(90 * s);
  const dpW = Math.round(18 * s);
  const dpL = Math.round(50 * s);

  // Buttons (ABXY)
  const btnCx = cx + Math.round(85 * s);
  const btnCy = gpY + Math.round(90 * s);
  const btnR = Math.round(14 * s);

  // Text size
  const fontSize = Math.round(52 * s);
  const subFontSize = Math.round(28 * s);
  const textY = cy + Math.round(110 * s);
  const subY = cy + Math.round(145 * s);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FCFF52;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#E8EB00;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="gpad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0d0d1a;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="${Math.round(4 * s)}" stdDeviation="${Math.round(8 * s)}" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Background -->
  ${maskable
    ? `<rect width="${size}" height="${size}" fill="url(#bg)"/>`
    : `<rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#bg)"/>`
  }

  <!-- Gamepad body -->
  <rect x="${gpX}" y="${gpY}" width="${gpW}" height="${gpH}" rx="${gpR}" ry="${gpR}"
        fill="url(#gpad)" filter="url(#shadow)"/>

  <!-- Gamepad grips (left) -->
  <ellipse cx="${gpX + Math.round(55 * s)}" cy="${gpY + gpH}" rx="${Math.round(38 * s)}" ry="${Math.round(22 * s)}" fill="#0d0d1a"/>
  <!-- Gamepad grips (right) -->
  <ellipse cx="${gpX + gpW - Math.round(55 * s)}" cy="${gpY + gpH}" rx="${Math.round(38 * s)}" ry="${Math.round(22 * s)}" fill="#0d0d1a"/>

  <!-- D-Pad vertical -->
  <rect x="${dpCx - dpW / 2}" y="${dpCy - dpL / 2}" width="${dpW}" height="${dpL}" rx="${Math.round(4 * s)}" fill="#FCFF52"/>
  <!-- D-Pad horizontal -->
  <rect x="${dpCx - dpL / 2}" y="${dpCy - dpW / 2}" width="${dpL}" height="${dpW}" rx="${Math.round(4 * s)}" fill="#FCFF52"/>

  <!-- Button A (right) - red -->
  <circle cx="${btnCx + Math.round(28 * s)}" cy="${btnCy}" r="${btnR}" fill="#FF4444"/>
  <!-- Button B (bottom) - green -->
  <circle cx="${btnCx}" cy="${btnCy + Math.round(28 * s)}" r="${btnR}" fill="#44FF44"/>
  <!-- Button X (top) - blue -->
  <circle cx="${btnCx}" cy="${btnCy - Math.round(28 * s)}" r="${btnR}" fill="#4488FF"/>
  <!-- Button Y (left) - yellow -->
  <circle cx="${btnCx - Math.round(28 * s)}" cy="${btnCy}" r="${btnR}" fill="#FFCC00"/>

  <!-- Start/Select buttons -->
  <rect x="${cx - Math.round(22 * s)}" y="${gpY + Math.round(75 * s)}" width="${Math.round(18 * s)}" height="${Math.round(10 * s)}" rx="${Math.round(5 * s)}" fill="#444"/>
  <rect x="${cx + Math.round(4 * s)}" y="${gpY + Math.round(75 * s)}" width="${Math.round(18 * s)}" height="${Math.round(10 * s)}" rx="${Math.round(5 * s)}" fill="#444"/>

  <!-- Text: CELO GAMES -->
  <text x="${cx}" y="${textY}" font-family="'Arial Black', 'Helvetica Neue', Arial, sans-serif"
        font-size="${fontSize}" font-weight="900" fill="#111827" text-anchor="middle"
        letter-spacing="${Math.round(2 * s)}">CELO</text>
  <text x="${cx}" y="${subY}" font-family="'Arial Black', 'Helvetica Neue', Arial, sans-serif"
        font-size="${subFontSize}" font-weight="700" fill="#333" text-anchor="middle"
        letter-spacing="${Math.round(6 * s)}">GAMES</text>
</svg>`;
}

async function generateIcon(size, filename, maskable = false) {
  const svg = makeSVG(size, maskable);
  const outPath = path.join(OUT_DIR, filename);
  await sharp(Buffer.from(svg))
    .png({ quality: 100, compressionLevel: 6 })
    .toFile(outPath);
  console.log(`✅ ${filename} (${size}x${size})`);
}

async function main() {
  console.log('🎮 Generating Celo Games Portal PWA icons...\n');

  await generateIcon(512, 'icon-512.png', false);
  await generateIcon(192, 'icon-192.png', false);
  await generateIcon(512, 'icon-maskable-512.png', true);
  await generateIcon(192, 'icon-maskable-192.png', true);
  await generateIcon(180, 'apple-touch-icon.png', false);
  await generateIcon(32,  'favicon-32.png', false);

  console.log('\n✨ All icons generated in public/');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
