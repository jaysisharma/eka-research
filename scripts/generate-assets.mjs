/**
 * Generates all static image assets from public/logo.png.
 * Run with: node scripts/generate-assets.mjs
 *
 * Outputs:
 *   public/icons/icon-192.png   — PWA icon
 *   public/icons/icon-512.png   — PWA icon (large)
 *   public/icons/apple-icon.png — Apple touch icon (180x180)
 *   app/icon.png                — Next.js favicon (32x32)
 */

import sharp from "sharp";
import { readFile, mkdir } from "fs/promises";
import { join } from "path";

const ROOT = process.cwd();
const logo = await readFile(join(ROOT, "public/logo.png"));

// Deep space background — logo is navy, so it needs a dark (not navy) bg for contrast
const BG = { r: 9, g: 11, b: 24, alpha: 1 }; // #090B18

async function makeIcon(size, logoSize, outPath) {
  // Tint the logo to white so it's fully visible on any dark background
  const whiteLogo = await sharp(logo)
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    // Replace all colour with white while keeping the alpha channel intact
    .linear(0, 255)
    .toBuffer();

  // Composite: space bg + white logo + gold dot accent ring
  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: whiteLogo, gravity: "centre" }])
    .png()
    .toFile(join(ROOT, outPath));

  console.log(`✓ ${outPath}`);
}

await mkdir(join(ROOT, "public/icons"), { recursive: true });

await Promise.all([
  makeIcon(512, 380, "public/icons/icon-512.png"),
  makeIcon(192, 140, "public/icons/icon-192.png"),
  makeIcon(180, 130, "public/icons/apple-icon.png"),
  makeIcon(32,   24, "app/icon.png"),
]);

console.log("All assets generated.");
