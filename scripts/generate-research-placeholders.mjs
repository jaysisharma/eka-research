/**
 * Generates placeholder images for each research area.
 * Run: node scripts/generate-research-placeholders.mjs
 * Replace files in public/research/ with real photos from the client.
 */

import sharp from "sharp";
import { mkdir } from "fs/promises";
import { join } from "path";

const ROOT = process.cwd();
const OUT  = join(ROOT, "public/research");
await mkdir(OUT, { recursive: true });

const W = 800, H = 450;

/** Each area gets a unique atmosphere */
const areas = [
  {
    id: "observational-astronomy",
    from: "#090B18", to: "#162161",
    glow: { cx: 600, cy: 80,  r: 260, color: "rgba(91,114,212,0.35)" },
    accent: { cx: 160, cy: 340, r: 90, color: "rgba(254,199,62,0.08)" },
  },
  {
    id: "meteor-science",
    from: "#0D0519", to: "#1E0E40",
    glow: { cx: 650, cy: 60,  r: 300, color: "rgba(160,100,240,0.3)" },
    accent: { cx: 100, cy: 380, r: 70, color: "rgba(254,199,62,0.12)" },
  },
  {
    id: "space-weather",
    from: "#110800", to: "#1E1400",
    glow: { cx: 400, cy: -60, r: 320, color: "rgba(254,180,62,0.25)" },
    accent: { cx: 680, cy: 380, r: 110, color: "rgba(255,120,30,0.1)" },
  },
  {
    id: "atmospheric-physics",
    from: "#001618", to: "#00232B",
    glow: { cx: 700, cy: 100, r: 280, color: "rgba(40,200,220,0.18)" },
    accent: { cx: 80,  cy: 300, r: 100, color: "rgba(40,200,180,0.1)" },
  },
  {
    id: "astrophysics",
    from: "#05050F", to: "#0A0A22",
    glow: { cx: 400, cy: 225, r: 300, color: "rgba(100,120,255,0.2)" },
    accent: { cx: 700, cy: 380, r: 120, color: "rgba(254,199,62,0.07)" },
  },
  {
    id: "science-education",
    from: "#060E12", to: "#0A1E18",
    glow: { cx: 150, cy: 100, r: 240, color: "rgba(40,180,120,0.2)" },
    accent: { cx: 650, cy: 350, r: 100, color: "rgba(254,199,62,0.09)" },
  },
];

/** Generate random star positions deterministically per area */
function stars(seed, count) {
  let s = seed;
  const rand = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  return Array.from({ length: count }, () => ({
    x: Math.floor(rand() * W),
    y: Math.floor(rand() * H),
    r: rand() < 0.15 ? 1.4 : rand() < 0.5 ? 0.8 : 0.4,
    o: 0.2 + rand() * 0.7,
    gold: rand() < 0.04,
  }));
}

function buildSvg(area, idx) {
  const { from, to, glow, accent } = area;
  const pts = stars(idx * 31337 + 7, 90);

  const starDots = pts.map(
    (p) => `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${
      p.gold ? "rgba(254,199,62," + p.o + ")" : "rgba(255,255,255," + p.o + ")"
    }"/>`
  ).join("");

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <!-- Main glow -->
  <circle cx="${glow.cx}" cy="${glow.cy}" r="${glow.r}" fill="${glow.color}"/>
  <!-- Accent glow -->
  <circle cx="${accent.cx}" cy="${accent.cy}" r="${accent.r}" fill="${accent.color}"/>
  <!-- Stars -->
  ${starDots}
  <!-- Subtle vignette -->
  <rect width="${W}" height="${H}" fill="rgba(0,0,0,0.25)"/>
</svg>`;
}

for (const [i, area] of areas.entries()) {
  const svg    = Buffer.from(buildSvg(area, i));
  const output = join(OUT, `${area.id}.jpg`);
  await sharp(svg).jpeg({ quality: 90 }).toFile(output);
  console.log(`✓ ${area.id}.jpg`);
}

console.log("All research placeholders generated.");
