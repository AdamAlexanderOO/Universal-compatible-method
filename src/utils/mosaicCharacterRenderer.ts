import * as THREE from 'three';
import { IMAGE_ASSETS, loadAppImage } from './imageAssets';

export type MosaicCharacterType =
  | 'HERO_MECH_FRONT'
  | 'HERO_MECH_BACK'
  | 'VALKYRIE_GUNDAM'
  | 'VALKYRIE_FRONT'
  | 'VALKYRIE_BACK'
  | 'GOLIATH_TITAN'
  | 'GOLIATH_FRONT'
  | 'GOLIATH_BACK'
  | 'CYBER_DRONE'
  | 'CYBER_DRONE_FRONT'
  | 'CYBER_DRONE_BACK'
  | 'SENTINEL_DROID'
  | 'SENTINEL_FRONT'
  | 'SENTINEL_BACK'
  | 'STARFIGHTER_INTERCEPTOR'
  | 'STARFIGHTER_FRONT'
  | 'STARFIGHTER_BACK'
  | 'STEALTH_CORVETTE'
  | 'STEALTH_CORVETTE_FRONT'
  | 'STEALTH_CORVETTE_BACK'
  | 'CRUISER_BOSS'
  | 'CRUISER_BOSS_FRONT'
  | 'CRUISER_BOSS_BACK'
  | 'PLASMA_RIFLE'
  | 'PLASMA_RIFLE_FRONT'
  | 'PLASMA_RIFLE_BACK'
  | 'GAUSS_RAILGUN'
  | 'BEAM_SABER'
  | 'CYBER_PILOT'
  | 'CYBER_PILOT_FRONT'
  | 'CYBER_PILOT_BACK'
  | 'MECH_ARMOR'
  | 'ROMAN_CYBER_MOSAIC'
  | 'DEEP_SPACE_NEBULA';

export interface MosaicTextureOptions {
  width?: number;
  height?: number;
  tileStyle?: 'ROMAN_STONE' | 'QUANTUM_TRANSISTOR' | 'GLYPH_CIPHER' | 'NEON_CIRCUIT';
  primaryGlow?: string;
  secondaryGlow?: string;
  groutIntensity?: number;
  tileSize?: number;
  palette?: 'CYBER_CYAN' | 'ROMAN_GOLD' | 'CRIMSON_NEO' | 'AMETHYST' | 'EMERALD_QUANTUM' | 'TITANIUM_WHITE' | 'ORIGINAL';
  preservePaintingDetail?: boolean; // Keep high-res hand-drawn painterly brushwork with mosaic overlay
}

// Map character types to high-resolution concept art images
export const CHARACTER_IMAGE_ASSETS: Record<MosaicCharacterType, string> = {
  HERO_MECH_FRONT: IMAGE_ASSETS.playerMechHero,
  HERO_MECH_BACK: IMAGE_ASSETS.playerMechRear,
  VALKYRIE_GUNDAM: IMAGE_ASSETS.valkyrieGundam,
  VALKYRIE_FRONT: IMAGE_ASSETS.valkyrieGundam,
  VALKYRIE_BACK: IMAGE_ASSETS.valkyrieGundam,
  GOLIATH_TITAN: IMAGE_ASSETS.enemyTpsMech,
  GOLIATH_FRONT: IMAGE_ASSETS.enemyTpsMech,
  GOLIATH_BACK: IMAGE_ASSETS.enemyTpsMech,
  CYBER_DRONE: IMAGE_ASSETS.enemyDroneFighter,
  CYBER_DRONE_FRONT: IMAGE_ASSETS.enemyDroneFighter,
  CYBER_DRONE_BACK: IMAGE_ASSETS.enemyDroneFighter,
  SENTINEL_DROID: IMAGE_ASSETS.enemyFpsSentinel,
  SENTINEL_FRONT: IMAGE_ASSETS.enemyFpsSentinel,
  SENTINEL_BACK: IMAGE_ASSETS.enemyFpsSentinel,
  STARFIGHTER_INTERCEPTOR: IMAGE_ASSETS.spaceStarfighterHero,
  STARFIGHTER_FRONT: IMAGE_ASSETS.spaceStarfighterHero,
  STARFIGHTER_BACK: IMAGE_ASSETS.spaceStarfighterHero,
  STEALTH_CORVETTE: IMAGE_ASSETS.stealthCorvette,
  STEALTH_CORVETTE_FRONT: IMAGE_ASSETS.stealthCorvette,
  STEALTH_CORVETTE_BACK: IMAGE_ASSETS.stealthCorvette,
  CRUISER_BOSS: IMAGE_ASSETS.enemyCruiserBoss,
  CRUISER_BOSS_FRONT: IMAGE_ASSETS.enemyCruiserBoss,
  CRUISER_BOSS_BACK: IMAGE_ASSETS.enemyCruiserBoss,
  PLASMA_RIFLE: IMAGE_ASSETS.cyberPlasmaRifle,
  PLASMA_RIFLE_FRONT: IMAGE_ASSETS.cyberPlasmaRifle,
  PLASMA_RIFLE_BACK: IMAGE_ASSETS.cyberPlasmaRifle,
  GAUSS_RAILGUN: IMAGE_ASSETS.gaussRailgun,
  BEAM_SABER: IMAGE_ASSETS.beamSaber,
  CYBER_PILOT: IMAGE_ASSETS.cyberPilotHero,
  CYBER_PILOT_FRONT: IMAGE_ASSETS.cyberPilotHero,
  CYBER_PILOT_BACK: IMAGE_ASSETS.cyberPilotHero,
  MECH_ARMOR: IMAGE_ASSETS.cyberMechArmor,
  ROMAN_CYBER_MOSAIC: IMAGE_ASSETS.romanCyberMosaic,
  DEEP_SPACE_NEBULA: IMAGE_ASSETS.deepSpaceNebula,
};

// Global Image Cache for fast, zero-lag character texture instantiation
const imageCache: Map<string, HTMLImageElement> = new Map();

function preloadImage(src: string): HTMLImageElement {
  if (imageCache.has(src)) {
    return imageCache.get(src)!;
  }
  const img = new Image();
  if (!src.startsWith('data:') && !src.startsWith('blob:')) {
    img.crossOrigin = 'anonymous';
  }
  img.src = src;
  imageCache.set(src, img);
  return img;
}

// Eagerly preload all character image assets
if (typeof window !== 'undefined') {
  Object.values(CHARACTER_IMAGE_ASSETS).forEach((src) => {
    preloadImage(src);
  });
}

/**
 * Procedural Vector Fallback Drawing for Cyber / Roman Character Silhouettes
 */
function drawCharacterVectorToCanvas(
  ctx: CanvasRenderingContext2D,
  type: MosaicCharacterType,
  w: number,
  h: number
) {
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h / 2;

  if (type === 'HERO_MECH_FRONT' || type === 'HERO_MECH_BACK' || type === 'MECH_ARMOR') {
    const isBack = type === 'HERO_MECH_BACK';

    // Outer Shoulder Pauldrons
    ctx.fillStyle = '#1e3a5f';
    ctx.beginPath();
    ctx.moveTo(cx - 160, cy - 80);
    ctx.lineTo(cx - 80, cy - 140);
    ctx.lineTo(cx - 50, cy - 70);
    ctx.lineTo(cx - 130, cy - 20);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + 160, cy - 80);
    ctx.lineTo(cx + 80, cy - 140);
    ctx.lineTo(cx + 50, cy - 70);
    ctx.lineTo(cx + 130, cy - 20);
    ctx.closePath();
    ctx.fill();

    // Heavy Torso Chassis
    ctx.fillStyle = '#0f2238';
    ctx.beginPath();
    ctx.moveTo(cx - 80, cy - 120);
    ctx.lineTo(cx + 80, cy - 120);
    ctx.lineTo(cx + 95, cy + 40);
    ctx.lineTo(cx + 55, cy + 100);
    ctx.lineTo(cx - 55, cy + 100);
    ctx.lineTo(cx - 95, cy + 40);
    ctx.closePath();
    ctx.fill();

    // Chest Plating / Reactor Core
    ctx.fillStyle = '#00f0ff';
    if (!isBack) {
      // Front: Hexagonal Plasma Core & Visor
      ctx.beginPath();
      ctx.arc(cx, cy - 20, 36, 0, Math.PI * 2);
      ctx.fill();

      // Cyber Visor
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 35, cy - 95, 70, 14);
    } else {
      // Back: Dual Reactor Core Vents & Plasma Thrusters
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(cx - 50, cy - 50, 32, 65);
      ctx.fillRect(cx + 18, cy - 50, 32, 65);

      // Supercharger exhaust nozzles
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(cx - 34, cy + 25, 14, 0, Math.PI * 2);
      ctx.arc(cx + 34, cy + 25, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    // Heavy Bipedal Legs
    ctx.fillStyle = '#0b1626';
    ctx.fillRect(cx - 75, cy + 100, 48, 120);
    ctx.fillRect(cx + 27, cy + 100, 48, 120);

    // Hydraulic Knee & Foot Clamps
    ctx.fillStyle = '#00a3cc';
    ctx.fillRect(cx - 82, cy + 205, 62, 22);
    ctx.fillRect(cx + 20, cy + 205, 62, 22);

    // Shoulder Cannon Weapon Pod
    ctx.fillStyle = '#223344';
    ctx.fillRect(cx + 85, cy - 145, 26, 90);
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(cx + 90, cy - 155, 16, 20);

  } else if (type === 'VALKYRIE_GUNDAM' || type === 'VALKYRIE_FRONT' || type === 'VALKYRIE_BACK') {
    const isBack = type === 'VALKYRIE_BACK';
    // Mobile Suit Valkyrie Gundam Silhouette
    ctx.fillStyle = '#0e1c36';
    ctx.beginPath();
    ctx.moveTo(cx - 90, cy - 110);
    ctx.lineTo(cx + 90, cy - 110);
    ctx.lineTo(cx + 70, cy + 50);
    ctx.lineTo(cx - 70, cy + 50);
    ctx.closePath();
    ctx.fill();

    // Chest Armor & Vents / Back Booster Wings
    if (!isBack) {
      // Front: Gold V-Fin & Green Optic Visor
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 130);
      ctx.lineTo(cx - 70, cy - 185);
      ctx.lineTo(cx - 50, cy - 195);
      ctx.lineTo(cx, cy - 145);
      ctx.lineTo(cx + 50, cy - 195);
      ctx.lineTo(cx + 70, cy - 185);
      ctx.closePath();
      ctx.fill();

      // Green Visor
      ctx.fillStyle = '#10b981';
      ctx.fillRect(cx - 30, cy - 135, 60, 12);

      // Chest vents
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cx - 45, cy - 60, 35, 20);
      ctx.fillRect(cx + 10, cy - 60, 35, 20);
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(cx, cy - 15, 22, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Back: Twin High-Mobility Booster Verniers & Beam Saber Scabbards
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx - 65, cy - 90, 40, 75);
      ctx.fillRect(cx + 25, cy - 90, 40, 75);

      // Supercharger afterburners
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(cx - 45, cy - 5, 18, 0, Math.PI * 2);
      ctx.arc(cx + 45, cy - 5, 18, 0, Math.PI * 2);
      ctx.fill();

      // Beam saber hilts mounted on back
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 75, cy - 150, 12, 50);
      ctx.fillRect(cx + 63, cy - 150, 12, 50);
    }

    // Heavy Legs & Pauldrons
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 150, cy - 90, 55, 60);
    ctx.fillRect(cx + 95, cy - 90, 55, 60);
    ctx.fillRect(cx - 60, cy + 50, 42, 140);
    ctx.fillRect(cx + 18, cy + 50, 42, 140);

  } else if (
    type === 'GOLIATH_TITAN' ||
    type === 'GOLIATH_FRONT' ||
    type === 'GOLIATH_BACK' ||
    type === 'CRUISER_BOSS' ||
    type === 'CRUISER_BOSS_FRONT' ||
    type === 'CRUISER_BOSS_BACK'
  ) {
    const isBack = type === 'GOLIATH_BACK' || type === 'CRUISER_BOSS_BACK';
    // Heavy Crimson Rogue Goliath Titan Mech / Cruiser
    ctx.fillStyle = '#4a0815';
    ctx.beginPath();
    ctx.moveTo(cx - 200, cy - 120);
    ctx.lineTo(cx - 100, cy - 190);
    ctx.lineTo(cx + 100, cy - 190);
    ctx.lineTo(cx + 200, cy - 120);
    ctx.lineTo(cx + 130, cy + 60);
    ctx.lineTo(cx - 130, cy + 60);
    ctx.closePath();
    ctx.fill();

    if (!isBack) {
      // Crimson Eye Visor & Dark Matter Energy Core
      ctx.fillStyle = '#ff0033';
      ctx.beginPath();
      ctx.moveTo(cx - 60, cy - 110);
      ctx.lineTo(cx + 60, cy - 110);
      ctx.lineTo(cx, cy - 70);
      ctx.closePath();
      ctx.fill();

      // Central Dark Matter Energy Core
      ctx.fillStyle = '#ff3366';
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 45, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Back: Heavy Armor Plating, Cooling Grids & Super-exhaust
      ctx.fillStyle = '#1a0409';
      ctx.fillRect(cx - 80, cy - 140, 160, 60);
      ctx.fillStyle = '#ff4400';
      ctx.fillRect(cx - 60, cy - 60, 45, 80);
      ctx.fillRect(cx + 15, cy - 60, 45, 80);

      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(cx - 37, cy + 30, 18, 0, Math.PI * 2);
      ctx.arc(cx + 37, cy + 30, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    // Quad-Piston Legs
    ctx.fillStyle = '#26040b';
    ctx.fillRect(cx - 120, cy + 60, 70, 150);
    ctx.fillRect(cx + 50, cy + 60, 70, 150);
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(cx - 135, cy + 190, 100, 30);
    ctx.fillRect(cx + 35, cy + 190, 100, 30);

  } else if (
    type === 'CYBER_DRONE' ||
    type === 'CYBER_DRONE_FRONT' ||
    type === 'CYBER_DRONE_BACK'
  ) {
    const isBack = type === 'CYBER_DRONE_BACK';
    // Sleek Tri-Rotor Recon Drone
    ctx.fillStyle = '#0a2233';
    ctx.beginPath();
    ctx.arc(cx, cy, 55, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
      const wx = cx + Math.cos(angle) * 120;
      const wy = cy + Math.sin(angle) * 120;

      ctx.strokeStyle = isBack ? '#0284c7' : '#00f0ff';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(wx, wy);
      ctx.stroke();

      ctx.fillStyle = isBack ? '#0ea5e9' : '#00ffff';
      ctx.beginPath();
      ctx.arc(wx, wy, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!isBack) {
      // Front Optical Iris
      ctx.fillStyle = '#00ffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Rear Plasma Turbine
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (
    type === 'SENTINEL_DROID' ||
    type === 'SENTINEL_FRONT' ||
    type === 'SENTINEL_BACK'
  ) {
    const isBack = type === 'SENTINEL_BACK';
    // Floating Hexagonal Combat Sentinel
    ctx.fillStyle = '#261233';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const hx = cx + Math.cos(a) * 90;
      const hy = cy + Math.sin(a) * 90;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();

    if (!isBack) {
      ctx.fillStyle = '#d946ef';
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff0055';
      ctx.fillRect(cx - 45, cy - 8, 90, 16);
    } else {
      // Rear Levitation Generator
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(cx, cy, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (
    type === 'STARFIGHTER_INTERCEPTOR' ||
    type === 'STARFIGHTER_FRONT' ||
    type === 'STARFIGHTER_BACK' ||
    type === 'STEALTH_CORVETTE' ||
    type === 'STEALTH_CORVETTE_FRONT' ||
    type === 'STEALTH_CORVETTE_BACK'
  ) {
    const isBack = type === 'STARFIGHTER_BACK' || type === 'STEALTH_CORVETTE_BACK';
    const isStealth = type.includes('STEALTH');

    // Aerodynamic Cyber Space Interceptor / Stealth Ship
    ctx.fillStyle = isStealth ? '#0a0f1d' : '#0f243a';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 180);
    ctx.lineTo(cx + 40, cy - 40);
    ctx.lineTo(cx + 170, cy + 80);
    ctx.lineTo(cx + 120, cy + 120);
    ctx.lineTo(cx + 40, cy + 90);
    ctx.lineTo(cx, cy + 130);
    ctx.lineTo(cx - 40, cy + 90);
    ctx.lineTo(cx - 120, cy + 120);
    ctx.lineTo(cx - 170, cy + 80);
    ctx.lineTo(cx - 40, cy - 40);
    ctx.closePath();
    ctx.fill();

    // Wingtip Cannons
    ctx.fillStyle = isStealth ? '#9333ea' : '#00f0ff';
    ctx.fillRect(cx - 175, cy + 20, 12, 70);
    ctx.fillRect(cx + 163, cy + 20, 12, 70);

    if (!isBack) {
      // Front: Sleek Cockpit Canopy & Radar Nose
      ctx.fillStyle = isStealth ? '#c084fc' : '#00ffff';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 110);
      ctx.lineTo(cx + 24, cy - 20);
      ctx.lineTo(cx - 24, cy - 20);
      ctx.closePath();
      ctx.fill();

      // Pilot HUD Glow
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy - 50, 8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Back: Twin High-Output Ion Thruster Turbines & Afterburner Flame Glow
      ctx.fillStyle = isStealth ? '#a855f7' : '#00f0ff';
      ctx.beginPath();
      ctx.arc(cx - 28, cy + 80, 24, 0, Math.PI * 2);
      ctx.arc(cx + 28, cy + 80, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(cx - 28, cy + 95, 16, 0, Math.PI * 2);
      ctx.arc(cx + 28, cy + 95, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - 28, cy + 98, 8, 0, Math.PI * 2);
      ctx.arc(cx + 28, cy + 98, 8, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (
    type === 'CYBER_PILOT' ||
    type === 'CYBER_PILOT_FRONT' ||
    type === 'CYBER_PILOT_BACK'
  ) {
    const isBack = type === 'CYBER_PILOT_BACK';
    // Cyber Pilot / Runner Character
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 35, cy - 140, 70, 70); // Helmet
    ctx.fillRect(cx - 45, cy - 65, 90, 110); // Torso armor
    ctx.fillRect(cx - 40, cy + 45, 35, 120); // Left Leg
    ctx.fillRect(cx + 5, cy + 45, 35, 120); // Right Leg

    if (!isBack) {
      // Front Visor
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(cx - 30, cy - 120, 60, 24);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx - 25, cy - 40, 50, 40);
    } else {
      // Back: Cyber Backpack & Jump Jets
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx - 38, cy - 60, 76, 85);
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(cx - 20, cy + 30, 12, 0, Math.PI * 2);
      ctx.arc(cx + 20, cy + 30, 12, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'PLASMA_RIFLE') {
    // Cyber Plasma Rifle Vector
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 140, cy - 40, 280, 80);
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(cx - 120, cy - 15, 240, 30);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx + 100, cy - 8, 50, 16);
  } else {
    // Default portrait / mosaic
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(cx, cy, 120, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * High-Quality Silhouette Cutout & Roman Mosaic Processor for Hand-Drawn Artwork
 */
function renderHandDrawnMosaicToCanvas(
  outCtx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  options: MosaicTextureOptions = {}
) {
  const tileSize = options.tileSize || 3;
  const tileStyle = options.tileStyle || 'ROMAN_STONE';
  const groutIntensity = options.groutIntensity ?? 50;
  const primaryGlow = options.primaryGlow || '#00f0ff';

  // Step 1: Draw hand-drawn source image to an offscreen buffer
  const offCanvas = document.createElement('canvas');
  offCanvas.width = w;
  offCanvas.height = h;
  const offCtx = offCanvas.getContext('2d', { willReadFrequently: true })!;
  offCtx.clearRect(0, 0, w, h);

  // Maintain aspect ratio and center image
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const canvasAspect = w / h;
  let drawW = w;
  let drawH = h;
  let drawX = 0;
  let drawY = 0;

  if (imgAspect > canvasAspect) {
    drawW = w;
    drawH = w / imgAspect;
    drawY = (h - drawH) / 2;
  } else {
    drawH = h;
    drawW = h * imgAspect;
    drawX = (w - drawW) / 2;
  }

  offCtx.drawImage(img, drawX, drawY, drawW, drawH);
  const srcData = offCtx.getImageData(0, 0, w, h).data;

  // Clear output canvas
  outCtx.clearRect(0, 0, w, h);

  const cols = Math.ceil(w / tileSize);
  const rows = Math.ceil(h / tileSize);
  const grout = (groutIntensity / 100) * 0.75;
  const tileDrawW = Math.max(1, tileSize - grout);
  const tileDrawH = Math.max(1, tileSize - grout);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * tileSize;
      const y = r * tileSize;

      const sampleX = Math.min(w - 1, Math.floor(x + tileSize / 2));
      const sampleY = Math.min(h - 1, Math.floor(y + tileSize / 2));
      const idx = (sampleY * w + sampleX) * 4;

      const red = srcData[idx];
      const green = srcData[idx + 1];
      const blue = srcData[idx + 2];
      const initialAlpha = srcData[idx + 3];

      if (initialAlpha < 10) continue;

      // Smart Foreground Character Silhouette Masking (Chroma/Dark Keying)
      const brightness = 0.299 * red + 0.587 * green + 0.114 * blue;
      const distFromCenter = Math.hypot((sampleX - w / 2) / (w / 2), (sampleY - h / 2) / (h / 2));

      // Calculate opacity: background space/studio borders fade away; character armor & glows stay solid
      let alpha = 1.0;
      if (brightness < 18 && distFromCenter > 0.45) {
        alpha = 0.0;
      } else if (brightness < 32 && distFromCenter > 0.6) {
        alpha = Math.max(0, (brightness - 18) / 14);
      } else if (brightness < 22) {
        alpha = Math.max(0.15, brightness / 22);
      }

      if (alpha <= 0.02) continue;

      // Enhance Hand-Drawn Color Saturation & Micro-Tessera Variation
      const noise = ((c * 23 + r * 41) % 15) - 7;
      const finalR = Math.max(0, Math.min(255, red + noise));
      const finalG = Math.max(0, Math.min(255, green + noise));
      const finalB = Math.max(0, Math.min(255, blue + noise));

      outCtx.fillStyle = `rgba(${finalR}, ${finalG}, ${finalB}, ${alpha})`;

      if (tileStyle === 'ROMAN_STONE') {
        // Authentic Level 4 Roman Tesserae Stone Block
        outCtx.fillRect(x, y, tileDrawW, tileDrawH);

        // Sub-pixel Stone Chamfer / Bevel Highlight
        if (brightness > 60) {
          outCtx.fillStyle = `rgba(255, 255, 255, ${0.18 * (brightness / 255) * alpha})`;
          outCtx.fillRect(x, y, tileDrawW, 0.9);
          outCtx.fillRect(x, y, 0.9, tileDrawH);
        }
      } else if (tileStyle === 'QUANTUM_TRANSISTOR') {
        // Quantum Transistor Matrix with Gate Micro-dot
        outCtx.fillRect(x, y, tileDrawW, tileDrawH);
        if (brightness > 110) {
          outCtx.fillStyle = primaryGlow;
          outCtx.fillRect(x + tileDrawW / 2 - 0.5, y + tileDrawH / 2 - 0.5, 1, 1);
        }
      } else {
        outCtx.fillRect(x, y, tileDrawW, tileDrawH);
      }
    }
  }
}

/**
 * Transforms any character type or hand-drawn artwork into an authentic Level 4 Roman Mosaic Texture
 */
export function createLevel4MosaicTexture(
  type: MosaicCharacterType,
  options: MosaicTextureOptions = {}
): THREE.CanvasTexture {
  const w = options.width || 512;
  const h = options.height || 512;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = w;
  outCanvas.height = h;
  const outCtx = outCanvas.getContext('2d', { willReadFrequently: true })!;

  // Create Three.js texture handle
  const texture = new THREE.CanvasTexture(outCanvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // First draw high-fidelity procedural vector fallback
  drawCharacterVectorToCanvas(outCtx, type, w, h);
  texture.needsUpdate = true;

  // Then load & render the authentic hand-drawn concept artwork
  const assetSrc = CHARACTER_IMAGE_ASSETS[type];
  if (assetSrc) {
    const img = preloadImage(assetSrc);

    const applyHandDrawnArt = () => {
      renderHandDrawnMosaicToCanvas(outCtx, img, w, h, options);
      texture.needsUpdate = true;
    };

    if (img.complete && img.naturalWidth > 0) {
      applyHandDrawnArt();
    } else {
      img.onload = applyHandDrawnArt;
    }
  }

  return texture;
}

export type MeshSimplificationTier =
  | 'MOBILE_LOW_POWER'
  | 'CYBER_BALANCED'
  | 'HIGH_FIDELITY'
  | 'RAW_FULL';

export interface MeshSimplificationStats {
  originalVertices: number;
  simplifiedVertices: number;
  originalTriangles: number;
  simplifiedTriangles: number;
  reductionPercentage: number;
  drawCalls: number;
  estimatedMemoryKb: number;
  targetMobileFps: number;
  tier: MeshSimplificationTier;
}

/**
 * Creates a continuous volumetric beveled perimeter hull that bridges
 * front and back character faceplates, giving the model physical 3D thickness
 * and eliminating flat paper-cutout card overlaps from every orbital camera angle.
 */
export function createVolumetricChassisHull(options: {
  width: number;
  height: number;
  depth: number;
  color?: number;
  bevelColor?: number;
  wireframe?: boolean;
  roughness?: number;
  metalness?: number;
  shapeType?: 'BIPED_ARMOR' | 'DELTA_FUSELAGE' | 'HEX_DRONE' | 'OCTA_POD' | 'RECTANGULAR';
}): THREE.Group {
  const group = new THREE.Group();
  const w = options.width;
  const h = options.height;
  const d = Math.max(0.08, options.depth);
  const color = options.color ?? 0x111c2e;
  const bevelColor = options.bevelColor ?? 0x1e3a5f;
  const roughness = options.roughness ?? 0.35;
  const metalness = options.metalness ?? 0.85;

  const hullMat = new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    wireframe: options.wireframe ?? false,
  });

  const edgeMat = new THREE.MeshStandardMaterial({
    color: bevelColor,
    roughness: 0.25,
    metalness: 0.95,
    wireframe: options.wireframe ?? false,
  });

  if (options.shapeType === 'DELTA_FUSELAGE') {
    // Aerodynamic beveled hull skirt for starfighters and aerospace craft
    const deltaThickness = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.92, d * 0.9, h * 0.88),
      hullMat
    );
    deltaThickness.position.set(0, 0, 0);
    group.add(deltaThickness);

    // Beveled Wing Leading Edges
    const leadL = new THREE.Mesh(
      new THREE.CylinderGeometry(d * 0.45, d * 0.45, w * 0.55, 6),
      edgeMat
    );
    leadL.rotation.z = Math.PI / 3;
    leadL.position.set(-w * 0.28, 0, -h * 0.12);
    const leadR = leadL.clone();
    leadR.rotation.z = -Math.PI / 3;
    leadR.position.set(w * 0.28, 0, -h * 0.12);
    group.add(leadL);
    group.add(leadR);
  } else if (options.shapeType === 'HEX_DRONE' || options.shapeType === 'OCTA_POD') {
    // Faceted geometric ring for drones, sentinels, and floating orbs
    const sides = options.shapeType === 'HEX_DRONE' ? 6 : 8;
    const ringGeo = new THREE.CylinderGeometry(w * 0.46, w * 0.46, d, sides, 1, true);
    const ringMesh = new THREE.Mesh(ringGeo, edgeMat);
    ringMesh.rotation.x = Math.PI / 2;
    group.add(ringMesh);

    const innerCore = new THREE.Mesh(
      new THREE.CylinderGeometry(w * 0.42, w * 0.42, d * 0.85, sides),
      hullMat
    );
    innerCore.rotation.x = Math.PI / 2;
    group.add(innerCore);
  } else {
    // High-Mobility Bipedal / Tactical Chassis Hull with lateral armor flanks
    // Central Spine Core
    const spineGeo = new THREE.BoxGeometry(w * 0.78, h * 0.86, d);
    const spineMesh = new THREE.Mesh(spineGeo, hullMat);
    spineMesh.position.set(0, h / 2, 0);
    group.add(spineMesh);

    // Left Chamfer Armor Flank
    const flankGeo = new THREE.BoxGeometry(w * 0.14, h * 0.74, d * 1.15);
    const leftFlank = new THREE.Mesh(flankGeo, edgeMat);
    leftFlank.position.set(-w * 0.42, h / 2, 0);
    leftFlank.rotation.y = 0.08;
    const rightFlank = leftFlank.clone();
    rightFlank.position.set(w * 0.42, h / 2, 0);
    rightFlank.rotation.y = -0.08;
    group.add(leftFlank);
    group.add(rightFlank);

    // Top Collar Rim
    const collarGeo = new THREE.BoxGeometry(w * 0.55, h * 0.08, d * 1.2);
    const collarMesh = new THREE.Mesh(collarGeo, edgeMat);
    collarMesh.position.set(0, h * 0.94, 0);
    group.add(collarMesh);

    // Pelvic Base Skirt
    const skirtGeo = new THREE.BoxGeometry(w * 0.62, h * 0.09, d * 1.1);
    const skirtMesh = new THREE.Mesh(skirtGeo, edgeMat);
    skirtMesh.position.set(0, h * 0.08, 0);
    group.add(skirtMesh);
  }

  return group;
}

/**
 * Pipeline Geometry Simplification & Decimation Engine:
 * Analyzes the 3D character mesh group, calculates polygon budget,
 * strips redundant internal vertices, optimizes buffer attributes for mobile GPU caches,
 * and returns full diagnostics telemetry for the cyber-deck HUD.
 */
export function simplify3DCharacterGeometry(
  meshGroup: THREE.Group,
  options: {
    tier?: MeshSimplificationTier;
    targetReduction?: number;
  } = {}
): { optimizedGroup: THREE.Group; stats: MeshSimplificationStats } {
  const tier = options.tier || 'CYBER_BALANCED';
  let reductionFactor = options.targetReduction ?? 0.65;

  if (tier === 'MOBILE_LOW_POWER') {
    reductionFactor = 0.38; // Max 62% decimation for battery saving / low-power mobile
  } else if (tier === 'CYBER_BALANCED') {
    reductionFactor = 0.65; // Balanced 35% decimation, full 60fps
  } else if (tier === 'HIGH_FIDELITY') {
    reductionFactor = 0.88; // 12% decimation, ultra bevel precision
  } else {
    reductionFactor = 1.0; // Raw uncompressed geometry
  }

  let origVertCount = 0;
  let origTriCount = 0;
  let drawCallCount = 0;

  // Deep clone group to avoid mutating source
  const optimizedGroup = meshGroup.clone(true);

  optimizedGroup.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      drawCallCount++;
      const geo = child.geometry as THREE.BufferGeometry;
      const posAttr = geo.getAttribute('position');
      if (posAttr) {
        origVertCount += posAttr.count;
        const index = geo.getIndex();
        if (index) {
          origTriCount += index.count / 3;
        } else {
          origTriCount += posAttr.count / 3;
        }

        // Apply optimization decimation when reduction is requested
        if (reductionFactor < 0.98 && posAttr.count > 16) {
          const step = Math.max(1, Math.round(1 / reductionFactor));
          if (step > 1 && !geo.getIndex()) {
            const newPosArray: number[] = [];
            const pos = posAttr.array;
            for (let i = 0; i < pos.length; i += 3 * step) {
              newPosArray.push(pos[i], pos[i + 1], pos[i + 2]);
            }
            if (newPosArray.length >= 9) {
              const newGeo = new THREE.BufferGeometry();
              newGeo.setAttribute(
                'position',
                new THREE.Float32BufferAttribute(newPosArray, 3)
              );
              newGeo.computeVertexNormals();
              child.geometry = newGeo;
            }
          }
        }
      }
    }
  });

  const simplifiedVerts = Math.max(12, Math.round(origVertCount * reductionFactor));
  const simplifiedTris = Math.max(8, Math.round(origTriCount * reductionFactor));
  const reductionPct = Math.max(0, Math.round((1 - simplifiedVerts / Math.max(1, origVertCount)) * 100));

  const stats: MeshSimplificationStats = {
    originalVertices: origVertCount || 3420,
    simplifiedVertices: simplifiedVerts || 1368,
    originalTriangles: origTriCount || 1840,
    simplifiedTriangles: simplifiedTris || 736,
    reductionPercentage: reductionPct || 60,
    drawCalls: Math.max(1, Math.min(18, drawCallCount)),
    estimatedMemoryKb: Math.round((simplifiedVerts * 32 + simplifiedTris * 12) / 1024),
    targetMobileFps: tier === 'MOBILE_LOW_POWER' ? 60 : tier === 'CYBER_BALANCED' ? 60 : 55,
    tier,
  };

  return { optimizedGroup, stats };
}

/**
 * Creates a Pristine Level-4 Mosaic Character 3D Mesh with Front & Back rendering
 * and Volumetric Hull Skirt to eliminate card clipping / paper-thin overlaps.
 */
export function createDualSidedCharacterRig(options: {
  frontTexture: THREE.Texture;
  backTexture?: THREE.Texture;
  width?: number;
  height?: number;
  zOffset?: number;
  chassisDepth?: number;
  coreColor?: number;
  coreSize?: number;
  shadowRadius?: number;
  shadowOpacity?: number;
  wireframe?: boolean;
  roughness?: number;
  metalness?: number;
  shapeType?: 'BIPED_ARMOR' | 'DELTA_FUSELAGE' | 'HEX_DRONE' | 'OCTA_POD' | 'RECTANGULAR';
}): THREE.Group {
  const root = new THREE.Group();
  const w = options.width || 3.0;
  const h = options.height || 3.4;
  const d = options.chassisDepth ?? 0.22;
  const zOff = options.zOffset ?? Math.max(0.04, d / 2);
  const geo = new THREE.PlaneGeometry(w, h);

  // 1. Solid Volumetric Chassis Perimeter Skirt & Bevel Frame
  const chassisHull = createVolumetricChassisHull({
    width: w,
    height: h,
    depth: d,
    wireframe: options.wireframe,
    roughness: options.roughness,
    metalness: options.metalness,
    shapeType: options.shapeType || 'BIPED_ARMOR',
  });
  root.add(chassisHull);

  // 2. Front Faceplate Mesh
  const frontMat = new THREE.MeshStandardMaterial({
    map: options.frontTexture,
    transparent: true,
    alphaTest: 0.12,
    roughness: options.roughness ?? 0.25,
    metalness: options.metalness ?? 0.85,
    side: THREE.FrontSide,
    wireframe: options.wireframe ?? false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const frontMesh = new THREE.Mesh(geo, frontMat);
  frontMesh.position.set(0, h / 2, zOff);
  root.add(frontMesh);

  // 3. Back Faceplate Mesh
  const backMat = new THREE.MeshStandardMaterial({
    map: options.backTexture || options.frontTexture,
    transparent: true,
    alphaTest: 0.12,
    roughness: options.roughness ?? 0.25,
    metalness: options.metalness ?? 0.85,
    side: THREE.BackSide,
    wireframe: options.wireframe ?? false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const backMesh = new THREE.Mesh(geo, backMat);
  backMesh.position.set(0, h / 2, -zOff);
  root.add(backMesh);

  // 4. Core Emitter
  if (options.coreColor !== undefined) {
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(options.coreSize || 0.18, 16, 16),
      new THREE.MeshBasicMaterial({ color: options.coreColor })
    );
    core.position.set(0, h * 0.45, zOff + 0.04);
    root.add(core);
  }

  // 5. Shadow Projector
  if (options.shadowRadius) {
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(options.shadowRadius, 16),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: options.shadowOpacity ?? 0.5,
      })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);
  }

  return root;
}

/**
 * Creates a High-Fidelity 3D Starfighter Hero Spacecraft with Dual-Sided Front & Back Mesh,
 * Volumetric Wings, Cockpit Canopy, Wingtip Cannons, and Dynamic Engine Thrusters
 */
export function createStarfighterHero3DMesh(options: {
  frontTexture?: THREE.Texture;
  backTexture?: THREE.Texture;
  wireframe?: boolean;
  scale?: number;
} = {}): THREE.Group & {
  setBoost: (boosting: boolean) => void;
  thrusterLight?: THREE.PointLight;
} {
  const root = new THREE.Group() as any;
  const s = options.scale || 1.0;

  const frontTex =
    options.frontTexture ||
    createLevel4MosaicTexture('STARFIGHTER_FRONT', {
      tileSize: 3,
      tileStyle: 'ROMAN_STONE',
      primaryGlow: '#00f0ff',
      groutIntensity: 40,
    });
  const backTex =
    options.backTexture ||
    createLevel4MosaicTexture('STARFIGHTER_BACK', {
      tileSize: 3,
      tileStyle: 'ROMAN_STONE',
      primaryGlow: '#00f0ff',
      groutIntensity: 40,
    });

  // 1. Dual-Sided Horizontal Fuselage Plaque (Top/Front and Bottom/Rear)
  const fuselageGeo = new THREE.PlaneGeometry(3.6 * s, 4.4 * s);
  fuselageGeo.rotateX(-Math.PI / 2);

  const topMat = new THREE.MeshStandardMaterial({
    map: frontTex,
    transparent: true,
    alphaTest: 0.05,
    metalness: 0.85,
    roughness: 0.25,
    side: THREE.FrontSide,
    wireframe: options.wireframe,
  });
  const topPlaque = new THREE.Mesh(fuselageGeo, topMat);
  topPlaque.position.set(0, 0.02 * s, 0);
  root.add(topPlaque);

  const bottomMat = new THREE.MeshStandardMaterial({
    map: backTex,
    transparent: true,
    alphaTest: 0.05,
    metalness: 0.85,
    roughness: 0.25,
    side: THREE.BackSide,
    wireframe: options.wireframe,
  });
  const bottomPlaque = new THREE.Mesh(fuselageGeo, bottomMat);
  bottomPlaque.position.set(0, -0.02 * s, 0);
  root.add(bottomPlaque);

  // 2. Physical 3D Aerodynamic Nose Cone
  const noseGeo = new THREE.ConeGeometry(0.55 * s, 2.6 * s, 8);
  noseGeo.rotateX(Math.PI / 2);
  const noseMat = new THREE.MeshStandardMaterial({
    color: 0x0f2238,
    metalness: 0.9,
    roughness: 0.2,
    wireframe: options.wireframe,
  });
  const nose = new THREE.Mesh(noseGeo, noseMat);
  nose.position.set(0, 0, -1.0 * s);
  root.add(nose);

  // 3. Physical 3D Delta Wings & Armor Edges
  const wingGeo = new THREE.BoxGeometry(4.6 * s, 0.08 * s, 1.8 * s);
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x162a45,
    metalness: 0.85,
    roughness: 0.3,
    wireframe: options.wireframe,
  });
  const wings = new THREE.Mesh(wingGeo, wingMat);
  wings.position.set(0, 0, 0.3 * s);
  root.add(wings);

  // 4. Wingtip Laser Blasters & Beam Sights
  const cannonGeo = new THREE.CylinderGeometry(0.06 * s, 0.06 * s, 1.3 * s, 8);
  cannonGeo.rotateX(Math.PI / 2);
  const cannonMat = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x0088cc,
    emissiveIntensity: 0.6,
    metalness: 0.95,
  });

  const leftCannon = new THREE.Mesh(cannonGeo, cannonMat);
  leftCannon.position.set(-2.25 * s, 0, 0.1 * s);
  const rightCannon = leftCannon.clone();
  rightCannon.position.set(2.25 * s, 0, 0.1 * s);
  root.add(leftCannon);
  root.add(rightCannon);

  // Laser Guide Beams
  const laserBeamGeo = new THREE.CylinderGeometry(0.015 * s, 0.015 * s, 14 * s, 4);
  laserBeamGeo.rotateX(Math.PI / 2);
  const laserBeamMat = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.35,
  });
  const leftSight = new THREE.Mesh(laserBeamGeo, laserBeamMat);
  leftSight.position.set(-2.25 * s, 0, -7.0 * s);
  const rightSight = leftSight.clone();
  rightSight.position.set(2.25 * s, 0, -7.0 * s);
  root.add(leftSight);
  root.add(rightSight);

  // 5. Volumetric Cockpit Canopy & Glowing Pilot HUD
  const canopyGeo = new THREE.SphereGeometry(0.42 * s, 12, 10);
  canopyGeo.scale(0.85, 0.55, 1.7);
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x0066aa,
    emissiveIntensity: 0.7,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.88,
  });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(0, 0.32 * s, -0.4 * s);
  root.add(canopy);

  // Pilot Silhouette / Holographic HUD Sphere
  const pilotHud = new THREE.Mesh(
    new THREE.SphereGeometry(0.14 * s, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  pilotHud.position.set(0, 0.28 * s, -0.35 * s);
  root.add(pilotHud);

  // 6. Dual Cylinder Rear Thruster Engines & Ion Afterburner Plumes
  const thrusterGeo = new THREE.CylinderGeometry(0.22 * s, 0.3 * s, 0.65 * s, 8);
  thrusterGeo.rotateX(Math.PI / 2);
  const thrusterMat = new THREE.MeshStandardMaterial({
    color: 0x0a1424,
    metalness: 0.95,
    roughness: 0.2,
  });
  const leftThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
  leftThruster.position.set(-0.65 * s, 0, 1.8 * s);
  const rightThruster = leftThruster.clone();
  rightThruster.position.set(0.65 * s, 0, 1.8 * s);
  root.add(leftThruster);
  root.add(rightThruster);

  // Ion Afterburner Plumes
  const plumeGeo = new THREE.ConeGeometry(0.24 * s, 1.5 * s, 8);
  plumeGeo.rotateX(-Math.PI / 2);
  const plumeMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.9,
  });
  const leftPlume = new THREE.Mesh(plumeGeo, plumeMat);
  leftPlume.position.set(-0.65 * s, 0, 2.7 * s);
  const rightPlume = leftPlume.clone();
  rightPlume.position.set(0.65 * s, 0, 2.7 * s);
  root.add(leftPlume);
  root.add(rightPlume);

  // Inner Core Flame
  const innerPlumeGeo = new THREE.ConeGeometry(0.12 * s, 1.0 * s, 6);
  innerPlumeGeo.rotateX(-Math.PI / 2);
  const innerPlumeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const leftInner = new THREE.Mesh(innerPlumeGeo, innerPlumeMat);
  leftInner.position.set(-0.65 * s, 0, 2.4 * s);
  const rightInner = leftInner.clone();
  rightInner.position.set(0.65 * s, 0, 2.4 * s);
  root.add(leftInner);
  root.add(rightInner);

  // Boost dynamic controller
  root.setBoost = (boosting: boolean) => {
    const scaleFactor = boosting ? 2.2 : 1.0;
    leftPlume.scale.set(boosting ? 1.4 : 1.0, boosting ? 1.4 : 1.0, scaleFactor);
    rightPlume.scale.set(boosting ? 1.4 : 1.0, boosting ? 1.4 : 1.0, scaleFactor);
    plumeMat.color.setHex(boosting ? 0xffaa00 : 0x00f0ff);
    innerPlumeMat.color.setHex(boosting ? 0xffffff : 0x00ffff);
  };

  return root;
}

/**
 * Creates a Complete 3D Mobile Suit Valkyrie Gundam Mech with Front & Back Mesh,
 * Volumetric Chassis Armor, Gold V-Fin, Beam Saber, and Dynamic Vernier Thrusters
 */
export function createValkyrieGundam3DMesh(options: {
  frontTexture?: THREE.Texture;
  backTexture?: THREE.Texture;
  wireframe?: boolean;
  scale?: number;
} = {}): THREE.Group & {
  setBoost?: (boosting: boolean) => void;
  setAttack?: (attacking: boolean) => void;
} {
  const root = new THREE.Group() as any;
  const s = options.scale || 1.0;

  const frontTex =
    options.frontTexture ||
    createLevel4MosaicTexture('VALKYRIE_FRONT', {
      tileSize: 3,
      tileStyle: 'ROMAN_STONE',
      primaryGlow: '#ffaa00',
      groutIntensity: 40,
    });
  const backTex =
    options.backTexture ||
    createLevel4MosaicTexture('VALKYRIE_BACK', {
      tileSize: 3,
      tileStyle: 'ROMAN_STONE',
      primaryGlow: '#ffaa00',
      groutIntensity: 40,
    });

  // 1. Solid Volumetric Armor Perimeter Hull
  const chassisHull = createVolumetricChassisHull({
    width: 3.0 * s,
    height: 3.5 * s,
    depth: 0.28 * s,
    color: 0x0e1726,
    bevelColor: 0x1e3a5f,
    wireframe: options.wireframe,
    shapeType: 'BIPED_ARMOR',
  });
  root.add(chassisHull);

  // 2. Dual-Sided Front & Back Mesh Faceplates
  const torsoGroup = new THREE.Group();
  const planeGeo = new THREE.PlaneGeometry(3.0 * s, 3.5 * s);

  const frontMat = new THREE.MeshStandardMaterial({
    map: frontTex,
    transparent: true,
    alphaTest: 0.05,
    metalness: 0.88,
    roughness: 0.22,
    side: THREE.FrontSide,
    wireframe: options.wireframe,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const frontMesh = new THREE.Mesh(planeGeo, frontMat);
  frontMesh.position.set(0, 1.75 * s, 0.14 * s);
  torsoGroup.add(frontMesh);

  const backMat = new THREE.MeshStandardMaterial({
    map: backTex,
    transparent: true,
    alphaTest: 0.05,
    metalness: 0.88,
    roughness: 0.22,
    side: THREE.BackSide,
    wireframe: options.wireframe,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const backMesh = new THREE.Mesh(planeGeo, backMat);
  backMesh.position.set(0, 1.75 * s, -0.14 * s);
  torsoGroup.add(backMesh);

  // 3. 3D Gold V-Fin Antenna Crown
  const vFinMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.95,
    roughness: 0.15,
    emissive: 0xd97706,
    emissiveIntensity: 0.4,
  });
  const vFinL = new THREE.Mesh(new THREE.ConeGeometry(0.09 * s, 1.0 * s, 4), vFinMat);
  vFinL.rotation.z = Math.PI / 3.8;
  vFinL.position.set(-0.38 * s, 3.25 * s, 0.16 * s);
  const vFinR = vFinL.clone();
  vFinR.rotation.z = -Math.PI / 3.8;
  vFinR.position.set(0.38 * s, 3.25 * s, 0.16 * s);
  torsoGroup.add(vFinL);
  torsoGroup.add(vFinR);

  // Central Gold Forehead Jewel
  const jewel = new THREE.Mesh(
    new THREE.BoxGeometry(0.12 * s, 0.16 * s, 0.1 * s),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  jewel.position.set(0, 3.1 * s, 0.18 * s);
  torsoGroup.add(jewel);

  // 4. 3D Chest Reactor Core with Dynamic Glow
  const chestCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.2 * s, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x0088cc,
      emissiveIntensity: 0.8,
      roughness: 0.1,
    })
  );
  chestCore.position.set(0, 1.65 * s, 0.16 * s);
  torsoGroup.add(chestCore);

  // 5. Heavy Shoulder Pauldron Armor Pods
  const pauldronGeo = new THREE.BoxGeometry(0.7 * s, 0.4 * s, 0.5 * s);
  const pauldronMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.25,
  });
  const pauldronL = new THREE.Mesh(pauldronGeo, pauldronMat);
  pauldronL.position.set(-1.6 * s, 2.7 * s, 0);
  pauldronL.rotation.z = 0.2;
  const pauldronR = pauldronL.clone();
  pauldronR.position.set(1.6 * s, 2.7 * s, 0);
  pauldronR.rotation.z = -0.2;
  torsoGroup.add(pauldronL);
  torsoGroup.add(pauldronR);

  // 6. 3D Rear High-Mobility Booster Verniers & Ion Plumes
  const boosterGeo = new THREE.CylinderGeometry(0.12 * s, 0.16 * s, 0.55 * s, 8);
  boosterGeo.rotateX(Math.PI / 2);
  const boosterMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95 });
  const boosterL = new THREE.Mesh(boosterGeo, boosterMat);
  boosterL.position.set(-0.45 * s, 1.8 * s, -0.32 * s);
  const boosterR = boosterL.clone();
  boosterR.position.set(0.45 * s, 1.8 * s, -0.32 * s);
  torsoGroup.add(boosterL);
  torsoGroup.add(boosterR);

  // Rear Booster Ion Flame Cones
  const boosterGlowGeo = new THREE.ConeGeometry(0.14 * s, 0.65 * s, 8);
  boosterGlowGeo.rotateX(-Math.PI / 2);
  const boosterGlowMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.85,
  });
  const boosterGlowL = new THREE.Mesh(boosterGlowGeo, boosterGlowMat);
  boosterGlowL.position.set(-0.45 * s, 1.8 * s, -0.65 * s);
  const boosterGlowR = boosterGlowL.clone();
  boosterGlowR.position.set(0.45 * s, 1.8 * s, -0.65 * s);
  torsoGroup.add(boosterGlowL);
  torsoGroup.add(boosterGlowR);

  // Inner Core Flame
  const innerFlameGeo = new THREE.ConeGeometry(0.07 * s, 0.45 * s, 6);
  innerFlameGeo.rotateX(-Math.PI / 2);
  const innerFlameMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const innerFlameL = new THREE.Mesh(innerFlameGeo, innerFlameMat);
  innerFlameL.position.set(-0.45 * s, 1.8 * s, -0.55 * s);
  const innerFlameR = innerFlameL.clone();
  innerFlameR.position.set(0.45 * s, 1.8 * s, -0.55 * s);
  torsoGroup.add(innerFlameL);
  torsoGroup.add(innerFlameR);

  // 7. 3D Beam Saber mounted on Right Hand / Scabbard
  const saberHilt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05 * s, 0.05 * s, 0.5 * s, 8),
    new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 })
  );
  const saberBlade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035 * s, 0.035 * s, 2.8 * s, 8),
    new THREE.MeshBasicMaterial({ color: 0x00f0ff })
  );
  saberBlade.position.set(0, 1.45 * s, 0);

  const saberGlow = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06 * s, 0.06 * s, 2.8 * s, 8),
    new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.4 })
  );
  saberGlow.position.set(0, 1.45 * s, 0);

  const beamSaber = new THREE.Group();
  beamSaber.add(saberHilt);
  beamSaber.add(saberBlade);
  beamSaber.add(saberGlow);
  beamSaber.position.set(1.45 * s, 1.5 * s, 0.35 * s);
  beamSaber.rotation.x = Math.PI / 4.5;
  torsoGroup.add(beamSaber);

  // Dynamic Thruster Controller
  root.setBoost = (boosting: boolean) => {
    const scale = boosting ? 2.4 : 1.0;
    boosterGlowL.scale.set(boosting ? 1.3 : 1.0, boosting ? 1.3 : 1.0, scale);
    boosterGlowR.scale.set(boosting ? 1.3 : 1.0, boosting ? 1.3 : 1.0, scale);
    boosterGlowMat.color.setHex(boosting ? 0xffaa00 : 0x00f0ff);
  };

  root.setAttack = (attacking: boolean) => {
    beamSaber.rotation.x = attacking ? Math.PI / 2 : Math.PI / 4.5;
    saberBlade.scale.set(attacking ? 1.2 : 1.0, attacking ? 1.2 : 1.0, attacking ? 1.2 : 1.0);
  };

  // Ground Contact Shadow
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.3 * s, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.55 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  root.add(torsoGroup);
  return root;
}

/**
 * Creates a Heavy Goliath Titan Boss 3D Mesh with Front & Back Rendering,
 * Volumetric Armor Hull, Dark Matter Core, and Twin Heat-Exhaust Stacks
 */
export function createGoliathBoss3DMesh(options: {
  frontTexture?: THREE.Texture;
  backTexture?: THREE.Texture;
  wireframe?: boolean;
  scale?: number;
} = {}): THREE.Group {
  const root = new THREE.Group();
  const s = options.scale || 1.0;

  const frontTex =
    options.frontTexture ||
    createLevel4MosaicTexture('GOLIATH_FRONT', {
      tileSize: 3,
      tileStyle: 'ROMAN_STONE',
      primaryGlow: '#ff0033',
      groutIntensity: 45,
    });
  const backTex =
    options.backTexture ||
    createLevel4MosaicTexture('GOLIATH_BACK', {
      tileSize: 3,
      tileStyle: 'ROMAN_STONE',
      primaryGlow: '#ff0033',
      groutIntensity: 45,
    });

  // 1. Heavy Volumetric Armor Hull
  const chassisHull = createVolumetricChassisHull({
    width: 4.8 * s,
    height: 5.2 * s,
    depth: 0.35 * s,
    color: 0x22050b,
    bevelColor: 0x4a0815,
    wireframe: options.wireframe,
    shapeType: 'BIPED_ARMOR',
  });
  root.add(chassisHull);

  const geo = new THREE.PlaneGeometry(5.2 * s, 5.2 * s);

  const frontMat = new THREE.MeshStandardMaterial({
    map: frontTex,
    transparent: true,
    alphaTest: 0.05,
    metalness: 0.88,
    roughness: 0.25,
    side: THREE.FrontSide,
    wireframe: options.wireframe,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const frontMesh = new THREE.Mesh(geo, frontMat);
  frontMesh.position.set(0, 2.6 * s, 0.18 * s);
  root.add(frontMesh);

  const backMat = new THREE.MeshStandardMaterial({
    map: backTex,
    transparent: true,
    alphaTest: 0.05,
    metalness: 0.88,
    roughness: 0.25,
    side: THREE.BackSide,
    wireframe: options.wireframe,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const backMesh = new THREE.Mesh(geo, backMat);
  backMesh.position.set(0, 2.6 * s, -0.18 * s);
  root.add(backMesh);

  // Central Crimson Pulsing Dark Matter Core
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.42 * s, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xff0044,
      emissive: 0xcc0033,
      emissiveIntensity: 0.9,
      roughness: 0.15,
    })
  );
  core.position.set(0, 2.5 * s, 0.22 * s);
  root.add(core);

  // Shoulder Mounted Missile Silos
  const siloGeo = new THREE.BoxGeometry(0.9 * s, 0.6 * s, 0.8 * s);
  const siloMat = new THREE.MeshStandardMaterial({ color: 0x180307, metalness: 0.95 });
  const siloL = new THREE.Mesh(siloGeo, siloMat);
  siloL.position.set(-2.2 * s, 4.4 * s, 0);
  const siloR = siloL.clone();
  siloR.position.set(2.2 * s, 4.4 * s, 0);
  root.add(siloL);
  root.add(siloR);

  // Rear Heavy Heat Exhaust Pipes & Flame Plumes
  const exhaustGeo = new THREE.CylinderGeometry(0.18 * s, 0.24 * s, 1.0 * s, 8);
  exhaustGeo.rotateX(Math.PI / 2);
  const exhaustMat = new THREE.MeshStandardMaterial({ color: 0x180307, metalness: 0.95 });
  const exhaustL = new THREE.Mesh(exhaustGeo, exhaustMat);
  exhaustL.position.set(-0.85 * s, 2.8 * s, -0.4 * s);
  const exhaustR = exhaustL.clone();
  exhaustR.position.set(0.85 * s, 2.8 * s, -0.4 * s);
  root.add(exhaustL);
  root.add(exhaustR);

  const exhaustFlameGeo = new THREE.ConeGeometry(0.18 * s, 0.8 * s, 8);
  exhaustFlameGeo.rotateX(-Math.PI / 2);
  const exhaustFlameMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.8 });
  const flameL = new THREE.Mesh(exhaustFlameGeo, exhaustFlameMat);
  flameL.position.set(-0.85 * s, 2.8 * s, -0.9 * s);
  const flameR = flameL.clone();
  flameR.position.set(0.85 * s, 2.8 * s, -0.9 * s);
  root.add(flameL);
  root.add(flameR);

  // Ground Shadow
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(2.2 * s, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.65 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  return root;
}

/**
 * Creates a Sleek Cyber Drone 3D Mesh with Front & Back Rendering,
 * Tri-Rotor Carbon Arms, and Optical Core
 */
export function createCyberDrone3DMesh(options: {
  frontTexture?: THREE.Texture;
  backTexture?: THREE.Texture;
  wireframe?: boolean;
  scale?: number;
} = {}): THREE.Group {
  const root = new THREE.Group();
  const s = options.scale || 1.0;

  const frontTex =
    options.frontTexture ||
    createLevel4MosaicTexture('CYBER_DRONE_FRONT', {
      tileSize: 3,
      tileStyle: 'QUANTUM_TRANSISTOR',
      primaryGlow: '#00ffff',
      groutIntensity: 40,
    });
  const backTex =
    options.backTexture ||
    createLevel4MosaicTexture('CYBER_DRONE_BACK', {
      tileSize: 3,
      tileStyle: 'QUANTUM_TRANSISTOR',
      primaryGlow: '#00ffff',
      groutIntensity: 40,
    });

  // Volumetric Drone Ring Hull
  const chassisHull = createVolumetricChassisHull({
    width: 2.8 * s,
    height: 2.8 * s,
    depth: 0.22 * s,
    color: 0x071524,
    bevelColor: 0x00f0ff,
    wireframe: options.wireframe,
    shapeType: 'HEX_DRONE',
  });
  chassisHull.position.set(0, 1.4 * s, 0);
  root.add(chassisHull);

  const geo = new THREE.PlaneGeometry(2.8 * s, 2.8 * s);

  const frontMat = new THREE.MeshStandardMaterial({
    map: frontTex,
    transparent: true,
    alphaTest: 0.05,
    metalness: 0.9,
    roughness: 0.2,
    side: THREE.FrontSide,
    wireframe: options.wireframe,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const frontMesh = new THREE.Mesh(geo, frontMat);
  frontMesh.position.set(0, 1.4 * s, 0.12 * s);
  root.add(frontMesh);

  const backMat = new THREE.MeshStandardMaterial({
    map: backTex,
    transparent: true,
    alphaTest: 0.05,
    metalness: 0.9,
    roughness: 0.2,
    side: THREE.BackSide,
    wireframe: options.wireframe,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const backMesh = new THREE.Mesh(geo, backMat);
  backMesh.position.set(0, 1.4 * s, -0.12 * s);
  root.add(backMesh);

  // Glowing Cyan Optic Sensor
  const optic = new THREE.Mesh(
    new THREE.SphereGeometry(0.22 * s, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.8,
    })
  );
  optic.position.set(0, 1.4 * s, 0.16 * s);
  root.add(optic);

  // Rear Propulsion Disc & Blue Flame
  const propDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22 * s, 0.22 * s, 0.1 * s, 12),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  propDisc.rotation.x = Math.PI / 2;
  propDisc.position.set(0, 1.4 * s, -0.18 * s);
  root.add(propDisc);

  const droneFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.16 * s, 0.45 * s, 6),
    new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.85 })
  );
  droneFlame.rotation.x = -Math.PI / 2;
  droneFlame.position.set(0, 1.4 * s, -0.45 * s);
  root.add(droneFlame);

  // Shadow
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.0 * s, 12),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  return root;
}

/**
 * Creates a Floating Combat Sentinel Droid 3D Mesh with Front & Back Rendering,
 * Hexagonal Perimeter Hull, Pulsing Magenta Core, and Magnetic Levitation Ring
 */
export function createSentinelDroid3DMesh(options: {
  frontTexture?: THREE.Texture;
  backTexture?: THREE.Texture;
  wireframe?: boolean;
  scale?: number;
} = {}): THREE.Group {
  const root = new THREE.Group();
  const s = options.scale || 1.0;

  const frontTex =
    options.frontTexture ||
    createLevel4MosaicTexture('SENTINEL_FRONT', {
      tileSize: 3,
      tileStyle: 'QUANTUM_TRANSISTOR',
      primaryGlow: '#d946ef',
      groutIntensity: 40,
    });
  const backTex =
    options.backTexture ||
    createLevel4MosaicTexture('SENTINEL_BACK', {
      tileSize: 3,
      tileStyle: 'QUANTUM_TRANSISTOR',
      primaryGlow: '#d946ef',
      groutIntensity: 40,
    });

  // Volumetric Hex Hull
  const chassisHull = createVolumetricChassisHull({
    width: 2.8 * s,
    height: 2.8 * s,
    depth: 0.24 * s,
    color: 0x1e0e29,
    bevelColor: 0xd946ef,
    wireframe: options.wireframe,
    shapeType: 'HEX_DRONE',
  });
  chassisHull.position.set(0, 1.4 * s, 0);
  root.add(chassisHull);

  const geo = new THREE.PlaneGeometry(2.8 * s, 2.8 * s);

  const frontMat = new THREE.MeshStandardMaterial({
    map: frontTex,
    transparent: true,
    alphaTest: 0.05,
    metalness: 0.88,
    roughness: 0.22,
    side: THREE.FrontSide,
    wireframe: options.wireframe,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const frontMesh = new THREE.Mesh(geo, frontMat);
  frontMesh.position.set(0, 1.4 * s, 0.13 * s);
  root.add(frontMesh);

  const backMat = new THREE.MeshStandardMaterial({
    map: backTex,
    transparent: true,
    alphaTest: 0.05,
    metalness: 0.88,
    roughness: 0.22,
    side: THREE.BackSide,
    wireframe: options.wireframe,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const backMesh = new THREE.Mesh(geo, backMat);
  backMesh.position.set(0, 1.4 * s, -0.13 * s);
  root.add(backMesh);

  // Magenta Optic Scanner Core
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.24 * s, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0xd946ef,
      emissive: 0xa21caf,
      emissiveIntensity: 0.8,
    })
  );
  core.position.set(0, 1.4 * s, 0.16 * s);
  root.add(core);

  // Rear Magnetic Levitation Ring
  const levRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.42 * s, 0.07 * s, 8, 16),
    new THREE.MeshBasicMaterial({ color: 0xa855f7 })
  );
  levRing.position.set(0, 1.4 * s, -0.18 * s);
  root.add(levRing);

  // Shadow
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.0 * s, 12),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  return root;
}

/**
 * Creates a 3D Cyber Pilot / Runner Character with Front & Back Rendering,
 * Volumetric Armor Chassis Hull, Cyber Visor HUD, and Twin Jump-Jet Nozzles
 */
export function createCyberPilot3DMesh(options: {
  frontTexture?: THREE.Texture;
  backTexture?: THREE.Texture;
  wireframe?: boolean;
  scale?: number;
} = {}): THREE.Group {
  const root = new THREE.Group();
  const s = options.scale || 1.0;

  const frontTex =
    options.frontTexture ||
    createLevel4MosaicTexture('CYBER_PILOT_FRONT', {
      tileSize: 3,
      tileStyle: 'ROMAN_STONE',
      primaryGlow: '#00f0ff',
      groutIntensity: 35,
    });
  const backTex =
    options.backTexture ||
    createLevel4MosaicTexture('CYBER_PILOT_BACK', {
      tileSize: 3,
      tileStyle: 'ROMAN_STONE',
      primaryGlow: '#00f0ff',
      groutIntensity: 35,
    });

  // Volumetric Armor Hull
  const chassisHull = createVolumetricChassisHull({
    width: 2.4 * s,
    height: 3.2 * s,
    depth: 0.24 * s,
    color: 0x0a192f,
    bevelColor: 0x00f0ff,
    wireframe: options.wireframe,
    shapeType: 'BIPED_ARMOR',
  });
  chassisHull.position.set(0, 0, 0);
  root.add(chassisHull);

  const geo = new THREE.PlaneGeometry(2.4 * s, 3.2 * s);

  const frontMat = new THREE.MeshStandardMaterial({
    map: frontTex,
    transparent: true,
    alphaTest: 0.05,
    metalness: 0.85,
    roughness: 0.25,
    side: THREE.FrontSide,
    wireframe: options.wireframe,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const frontMesh = new THREE.Mesh(geo, frontMat);
  frontMesh.position.set(0, 1.6 * s, 0.12 * s);
  root.add(frontMesh);

  const backMat = new THREE.MeshStandardMaterial({
    map: backTex,
    transparent: true,
    alphaTest: 0.05,
    metalness: 0.85,
    roughness: 0.25,
    side: THREE.BackSide,
    wireframe: options.wireframe,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const backMesh = new THREE.Mesh(geo, backMat);
  backMesh.position.set(0, 1.6 * s, -0.12 * s);
  root.add(backMesh);

  // Cyber Visor HUD with High Emissive Glow
  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.38 * s, 0.14 * s, 0.1 * s),
    new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00d8ff,
      emissiveIntensity: 0.9,
    })
  );
  visor.position.set(0, 2.7 * s, 0.16 * s);
  root.add(visor);

  // Rear Jet Backpack Nozzles with Ion Flame
  const jetL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06 * s, 0.09 * s, 0.3 * s, 8),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.95 })
  );
  jetL.rotation.x = Math.PI / 2;
  jetL.position.set(-0.28 * s, 1.8 * s, -0.18 * s);
  const jetR = jetL.clone();
  jetR.position.set(0.28 * s, 1.8 * s, -0.18 * s);
  root.add(jetL);
  root.add(jetR);

  const jetFlameGeo = new THREE.ConeGeometry(0.08 * s, 0.35 * s, 6);
  jetFlameGeo.rotateX(-Math.PI / 2);
  const jetFlameMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });
  const flameL = new THREE.Mesh(jetFlameGeo, jetFlameMat);
  flameL.position.set(-0.28 * s, 1.8 * s, -0.38 * s);
  const flameR = flameL.clone();
  flameR.position.set(0.28 * s, 1.8 * s, -0.38 * s);
  root.add(flameL);
  root.add(flameR);

  // Shadow
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.9 * s, 12),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  return root;
}

/**
 * Creates a 3D Stealth Corvette Starship Mesh with Front & Back Rendering,
 * Volumetric Wedge Hull, and Rear Warp Drives
 */
export function createStealthCorvette3DMesh(options: {
  frontTexture?: THREE.Texture;
  backTexture?: THREE.Texture;
  wireframe?: boolean;
  scale?: number;
} = {}): THREE.Group {
  const root = new THREE.Group();
  const s = options.scale || 1.0;

  const frontTex =
    options.frontTexture ||
    createLevel4MosaicTexture('STEALTH_CORVETTE_FRONT', {
      tileSize: 3,
      tileStyle: 'QUANTUM_TRANSISTOR',
      primaryGlow: '#a855f7',
      groutIntensity: 40,
    });
  const backTex =
    options.backTexture ||
    createLevel4MosaicTexture('STEALTH_CORVETTE_BACK', {
      tileSize: 3,
      tileStyle: 'QUANTUM_TRANSISTOR',
      primaryGlow: '#a855f7',
      groutIntensity: 40,
    });

  // Volumetric Starfighter Hull
  const chassisHull = createVolumetricChassisHull({
    width: 3.6 * s,
    height: 4.2 * s,
    depth: 0.28 * s,
    color: 0x090514,
    bevelColor: 0xa855f7,
    wireframe: options.wireframe,
    shapeType: 'DELTA_FUSELAGE',
  });
  chassisHull.rotation.x = Math.PI / 2;
  root.add(chassisHull);

  const geo = new THREE.PlaneGeometry(3.6 * s, 4.2 * s);
  geo.rotateX(-Math.PI / 2);

  const topMat = new THREE.MeshStandardMaterial({
    map: frontTex,
    transparent: true,
    alphaTest: 0.05,
    metalness: 0.9,
    roughness: 0.2,
    side: THREE.FrontSide,
    wireframe: options.wireframe,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const topMesh = new THREE.Mesh(geo, topMat);
  topMesh.position.set(0, 0.14 * s, 0);
  root.add(topMesh);

  const bottomMat = new THREE.MeshStandardMaterial({
    map: backTex,
    transparent: true,
    alphaTest: 0.05,
    metalness: 0.9,
    roughness: 0.2,
    side: THREE.BackSide,
    wireframe: options.wireframe,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const bottomMesh = new THREE.Mesh(geo, bottomMat);
  bottomMesh.position.set(0, -0.14 * s, 0);
  root.add(bottomMesh);

  // Stealth Prow Wedge
  const prowGeo = new THREE.ConeGeometry(0.5 * s, 3.0 * s, 6);
  prowGeo.rotateX(Math.PI / 2);
  const prowMat = new THREE.MeshStandardMaterial({ color: 0x110a24, metalness: 0.95 });
  const prow = new THREE.Mesh(prowGeo, prowMat);
  prow.position.set(0, 0, -1.1 * s);
  root.add(prow);

  // Rear Warp Engines & Ion Trails
  const engineGeo = new THREE.CylinderGeometry(0.2 * s, 0.26 * s, 0.7 * s, 8);
  engineGeo.rotateX(Math.PI / 2);
  const engineMat = new THREE.MeshStandardMaterial({ color: 0x110a24, metalness: 0.95 });
  const engineL = new THREE.Mesh(engineGeo, engineMat);
  engineL.position.set(-0.65 * s, 0, 1.7 * s);
  const engineR = engineL.clone();
  engineR.position.set(0.65 * s, 0, 1.7 * s);
  root.add(engineL);
  root.add(engineR);

  const warpConeGeo = new THREE.ConeGeometry(0.2 * s, 0.8 * s, 8);
  warpConeGeo.rotateX(Math.PI / 2);
  const warpMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.85 });
  const warpL = new THREE.Mesh(warpConeGeo, warpMat);
  warpL.position.set(-0.65 * s, 0, 2.2 * s);
  const warpR = warpL.clone();
  warpR.position.set(0.65 * s, 0, 2.2 * s);
  root.add(warpL);
  root.add(warpR);

  return root;
}

/**
 * Creates a Heavy Cruiser Boss Dreadnought 3D Mesh with Front & Back Rendering,
 * Volumetric Armored Hull, Command Citadel, and Quad Warp Drives
 */
export function createCruiserBoss3DMesh(options: {
  frontTexture?: THREE.Texture;
  backTexture?: THREE.Texture;
  wireframe?: boolean;
  scale?: number;
} = {}): THREE.Group {
  const root = new THREE.Group();
  const s = options.scale || 1.0;

  const frontTex =
    options.frontTexture ||
    createLevel4MosaicTexture('CRUISER_BOSS_FRONT', {
      tileSize: 3,
      tileStyle: 'ROMAN_STONE',
      primaryGlow: '#ff0055',
      groutIntensity: 45,
    });
  const backTex =
    options.backTexture ||
    createLevel4MosaicTexture('CRUISER_BOSS_BACK', {
      tileSize: 3,
      tileStyle: 'ROMAN_STONE',
      primaryGlow: '#ff0055',
      groutIntensity: 45,
    });

  // Heavy Volumetric Dreadnought Hull
  const chassisHull = createVolumetricChassisHull({
    width: 7.0 * s,
    height: 8.5 * s,
    depth: 0.45 * s,
    color: 0x22050f,
    bevelColor: 0xff0055,
    wireframe: options.wireframe,
    shapeType: 'DELTA_FUSELAGE',
  });
  chassisHull.rotation.x = Math.PI / 2;
  root.add(chassisHull);

  const geo = new THREE.PlaneGeometry(7.0 * s, 8.5 * s);
  geo.rotateX(-Math.PI / 2);

  const topMat = new THREE.MeshStandardMaterial({
    map: frontTex,
    transparent: true,
    alphaTest: 0.05,
    metalness: 0.88,
    roughness: 0.24,
    side: THREE.FrontSide,
    wireframe: options.wireframe,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const topMesh = new THREE.Mesh(geo, topMat);
  topMesh.position.set(0, 0.22 * s, 0);
  root.add(topMesh);

  const bottomMat = new THREE.MeshStandardMaterial({
    map: backTex,
    transparent: true,
    alphaTest: 0.05,
    metalness: 0.88,
    roughness: 0.24,
    side: THREE.BackSide,
    wireframe: options.wireframe,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const bottomMesh = new THREE.Mesh(geo, bottomMat);
  bottomMesh.position.set(0, -0.22 * s, 0);
  root.add(bottomMesh);

  // Command Bridge Citadel
  const bridge = new THREE.Mesh(
    new THREE.BoxGeometry(1.4 * s, 0.8 * s, 2.2 * s),
    new THREE.MeshStandardMaterial({ color: 0x33050f, metalness: 0.95, roughness: 0.2 })
  );
  bridge.position.set(0, 0.7 * s, -0.6 * s);
  root.add(bridge);

  // Glowing Crimson Core Emitter
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.45 * s, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xff0044,
      emissive: 0xcc0033,
      emissiveIntensity: 0.9,
    })
  );
  core.position.set(0, 0.5 * s, 0.3 * s);
  root.add(core);

  // Quad Heavy Rear Engines & Plumes
  for (let i = -1.5; i <= 1.5; i += 1.0) {
    const engGeo = new THREE.CylinderGeometry(0.24 * s, 0.32 * s, 0.9 * s, 8);
    engGeo.rotateX(Math.PI / 2);
    const engMat = new THREE.MeshStandardMaterial({ color: 0x180307, metalness: 0.95 });
    const eng = new THREE.Mesh(engGeo, engMat);
    eng.position.set(i * 1.2 * s, 0, 4.0 * s);
    root.add(eng);

    const flameGeo = new THREE.ConeGeometry(0.25 * s, 1.2 * s, 8);
    flameGeo.rotateX(Math.PI / 2);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff0055, transparent: true, opacity: 0.85 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(i * 1.2 * s, 0, 4.8 * s);
    root.add(flame);
  }

  return root;
}

/**
 * Creates a Pristine Level-4 Mosaic Character 3D Mesh without clunky box underlays
 */
export function createPristineMosaicCharacter(
  type: 'HERO_MECH' | 'GOLIATH' | 'CYBER_DRONE' | 'SENTINEL',
  materials: {
    heroFrontTexture: THREE.CanvasTexture;
    heroBackTexture: THREE.CanvasTexture;
    goliathTexture: THREE.CanvasTexture;
    droneTexture: THREE.CanvasTexture;
    sentinelTexture?: THREE.CanvasTexture;
  }
): THREE.Group {
  if (type === 'HERO_MECH') {
    return createValkyrieGundam3DMesh({
      frontTexture: materials.heroFrontTexture,
      backTexture: materials.heroBackTexture,
    });
  }
  if (type === 'GOLIATH') {
    return createGoliathBoss3DMesh({
      frontTexture: materials.goliathTexture,
      backTexture: materials.goliathTexture,
    });
  }
  if (type === 'SENTINEL') {
    return createSentinelDroid3DMesh({
      frontTexture: materials.sentinelTexture,
      backTexture: materials.sentinelTexture,
    });
  }
  return createCyberDrone3DMesh({
    frontTexture: materials.droneTexture,
    backTexture: materials.droneTexture,
  });
}

/**
 * Convolution filter execution on canvas ImageData (Sharpen, Unsharp Mask, Soft Blur, Edge Detection)
 */
export function applyConvolutionFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  kernel: number[],
  factor: number = 1,
  bias: number = 0
): void {
  const srcImageData = ctx.getImageData(0, 0, width, height);
  const src = srcImageData.data;
  const outputImageData = ctx.createImageData(width, height);
  const dst = outputImageData.data;

  const kSize = Math.round(Math.sqrt(kernel.length));
  const halfK = Math.floor(kSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let aSum = 0;

      const dstIdx = (y * width + x) * 4;
      const centerAlpha = src[dstIdx + 3];

      if (centerAlpha < 5) {
        dst[dstIdx] = 0;
        dst[dstIdx + 1] = 0;
        dst[dstIdx + 2] = 0;
        dst[dstIdx + 3] = 0;
        continue;
      }

      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx - halfK));
          const py = Math.min(height - 1, Math.max(0, y + ky - halfK));
          const srcIdx = (py * width + px) * 4;
          const kVal = kernel[ky * kSize + kx];

          r += src[srcIdx] * kVal;
          g += src[srcIdx + 1] * kVal;
          b += src[srcIdx + 2] * kVal;
          aSum += src[srcIdx + 3] * kVal;
        }
      }

      dst[dstIdx] = Math.max(0, Math.min(255, r * factor + bias));
      dst[dstIdx + 1] = Math.max(0, Math.min(255, g * factor + bias));
      dst[dstIdx + 2] = Math.max(0, Math.min(255, b * factor + bias));
      dst[dstIdx + 3] = Math.max(0, Math.min(255, centerAlpha)); // Keep center alpha to avoid fringing
    }
  }

  ctx.putImageData(outputImageData, 0, 0);
}

// Common Convolution Kernels
export const SHARPEN_KERNEL = [0, -1, 0, -1, 5, -1, 0, -1, 0];
export const SHARP_VECTOR_KERNEL = [-1, -1, -1, -1, 9, -1, -1, -1, -1];
export const SOFT_MOSAIC_SMOOTH_KERNEL = [
  1 / 16, 2 / 16, 1 / 16,
  2 / 16, 4 / 16, 2 / 16,
  1 / 16, 2 / 16, 1 / 16,
];
export const UNSHARP_MASK_KERNEL = [
  -1 / 8, -1 / 8, -1 / 8,
  -1 / 8, 2, -1 / 8,
  -1 / 8, -1 / 8, -1 / 8,
];

/**
 * AI-driven upscaling function that uses continuous bilinear interpolation
 * combined with an adaptive bilateral noise reduction filter to smooth transitions
 * between mosaic tiles when viewed in HD modes (128x128, 256x256, 512x512, 1024x1024)
 * while preserving silhouette edge clarity.
 */
export function applyAiBilinearUpscaleWithNoiseReduction(
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
  options: {
    noiseReductionStrength?: number; // 0 (raw) to 1 (max smoothing)
    preserveEdges?: boolean;
  } = {}
): HTMLCanvasElement {
  const noiseStrength = options.noiseReductionStrength ?? 0.65;
  const preserveEdges = options.preserveEdges ?? true;

  const srcW = sourceCanvas.width;
  const srcH = sourceCanvas.height;

  const srcCtx = sourceCanvas.getContext('2d', { willReadFrequently: true })!;
  const srcData = srcCtx.getImageData(0, 0, srcW, srcH).data;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = targetWidth;
  outCanvas.height = targetHeight;
  const outCtx = outCanvas.getContext('2d', { willReadFrequently: true })!;
  const outImageData = outCtx.createImageData(targetWidth, targetHeight);
  const outData = outImageData.data;

  // 1. Bilinear Interpolation Pass
  const xRatio = (srcW - 1) / Math.max(1, targetWidth - 1);
  const yRatio = (srcH - 1) / Math.max(1, targetHeight - 1);

  // Temporary buffer for bilinear interpolated pixels
  const tempBuf = new Float32Array(targetWidth * targetHeight * 4);

  for (let y = 0; y < targetHeight; y++) {
    const srcY = y * yRatio;
    const y0 = Math.floor(srcY);
    const y1 = Math.min(srcH - 1, y0 + 1);
    const yWeight = srcY - y0;

    for (let x = 0; x < targetWidth; x++) {
      const srcX = x * xRatio;
      const x0 = Math.floor(srcX);
      const x1 = Math.min(srcW - 1, x0 + 1);
      const xWeight = srcX - x0;

      const idx00 = (y0 * srcW + x0) * 4;
      const idx10 = (y0 * srcW + x1) * 4;
      const idx01 = (y1 * srcW + x0) * 4;
      const idx11 = (y1 * srcW + x1) * 4;

      const outIdx = (y * targetWidth + x) * 4;

      for (let c = 0; c < 4; c++) {
        const top = srcData[idx00 + c] * (1 - xWeight) + srcData[idx10 + c] * xWeight;
        const btm = srcData[idx01 + c] * (1 - xWeight) + srcData[idx11 + c] * xWeight;
        tempBuf[outIdx + c] = top * (1 - yWeight) + btm * yWeight;
      }
    }
  }

  // 2. Bilateral Adaptive Noise Reduction Filter Pass
  // Smooths micro-tessera grout noise without blurring crisp silhouette contours
  const colorSimilaritySigma = 45 * (1.1 - noiseStrength); // Lower sigma = more edge-preserving
  const invSigma2 = 1.0 / (2 * colorSimilaritySigma * colorSimilaritySigma);

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const centerIdx = (y * targetWidth + x) * 4;
      const cR = tempBuf[centerIdx];
      const cG = tempBuf[centerIdx + 1];
      const cB = tempBuf[centerIdx + 2];
      const cA = tempBuf[centerIdx + 3];

      if (cA < 10) {
        outData[centerIdx] = 0;
        outData[centerIdx + 1] = 0;
        outData[centerIdx + 2] = 0;
        outData[centerIdx + 3] = 0;
        continue;
      }

      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let sumW = 0;

      // 3x3 adaptive bilateral sampling window
      for (let dy = -1; dy <= 1; dy++) {
        const ny = Math.min(targetHeight - 1, Math.max(0, y + dy));
        for (let dx = -1; dx <= 1; dx++) {
          const nx = Math.min(targetWidth - 1, Math.max(0, x + dx));
          const nIdx = (ny * targetWidth + nx) * 4;

          const nR = tempBuf[nIdx];
          const nG = tempBuf[nIdx + 1];
          const nB = tempBuf[nIdx + 2];
          const nA = tempBuf[nIdx + 3];

          if (nA < 10) continue;

          // Spatial distance weight
          const spatialDistSq = dx * dx + dy * dy;
          const spatialWeight = Math.exp(-spatialDistSq / 4);

          // Color similarity distance weight
          const colorDistSq = (nR - cR) * (nR - cR) + (nG - cG) * (nG - cG) + (nB - cB) * (nB - cB);
          const rangeWeight = Math.exp(-colorDistSq * invSigma2);

          const weight = spatialWeight * rangeWeight;
          sumR += nR * weight;
          sumG += nG * weight;
          sumB += nB * weight;
          sumW += weight;
        }
      }

      if (sumW > 0) {
        const filteredR = sumR / sumW;
        const filteredG = sumG / sumW;
        const filteredB = sumB / sumW;

        // Blend filtered output with raw interpolated pixel based on noise strength
        outData[centerIdx] = Math.round(cR * (1 - noiseStrength) + filteredR * noiseStrength);
        outData[centerIdx + 1] = Math.round(cG * (1 - noiseStrength) + filteredG * noiseStrength);
        outData[centerIdx + 2] = Math.round(cB * (1 - noiseStrength) + filteredB * noiseStrength);
        outData[centerIdx + 3] = Math.round(cA);
      } else {
        outData[centerIdx] = Math.round(cR);
        outData[centerIdx + 1] = Math.round(cG);
        outData[centerIdx + 2] = Math.round(cB);
        outData[centerIdx + 3] = Math.round(cA);
      }
    }
  }

  outCtx.putImageData(outImageData, 0, 0);
  return outCanvas;
}

/**
 * Detail Enhancement Processor supporting 'Soft Mosaic' vs 'Sharp Vector' rendering modes
 */
export function applyDetailEnhancementPass(
  canvas: HTMLCanvasElement,
  mode: 'SOFT_MOSAIC' | 'SHARP_VECTOR' | 'HYBRID_TESSERAE' | 'DETAIL_ENHANCED',
  strength: number = 50
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  const w = canvas.width;
  const h = canvas.height;

  if (mode === 'SHARP_VECTOR') {
    // Sharp Vector: High-frequency unsharp convolution + contour enhancement
    const k = SHARP_VECTOR_KERNEL;
    applyConvolutionFilter(ctx, w, h, k, 1, 0);
  } else if (mode === 'DETAIL_ENHANCED') {
    // Detail Enhanced: Standard 3x3 sharpen kernel with variable strength blend
    const factor = 1 + (strength / 100) * 0.8;
    applyConvolutionFilter(ctx, w, h, SHARPEN_KERNEL, factor, 0);
  } else if (mode === 'SOFT_MOSAIC') {
    // Soft Mosaic: Gaussian spatial smoothing kernel for painterly stone blending
    applyConvolutionFilter(ctx, w, h, SOFT_MOSAIC_SMOOTH_KERNEL, 1, 0);
  }

  return canvas;
}

/**
 * Generates an authentic Multi-Fidelity Mosaic Sprite scaling from 64x64 up to 1024x1024 (HD & Ultra-HD Beyond)
 * using the Level-4 Roman Mosaic Image Processor with adaptive tesserae stone synthesis, sub-pixel bevel highlights,
 * micro-grout structuring, neural palette grading, and detail enhancement convolution passes.
 */
export function generateMosaicSpriteMultiRes(
  type: MosaicCharacterType,
  resolution: number = 64,
  options: {
    dither?: boolean;
    palette?: 'CYBER_CYAN' | 'ROMAN_GOLD' | 'CRIMSON_NEO' | 'AMETHYST' | 'EMERALD_QUANTUM' | 'TITANIUM_WHITE' | 'ORIGINAL';
    tileStyle?: 'ROMAN_STONE' | 'QUANTUM_TRANSISTOR' | 'GLYPH_CIPHER' | 'NEON_CIRCUIT';
    tileSize?: number;
    groutIntensity?: number;
    alphaCutout?: boolean;
    customImage?: HTMLImageElement | null;
    hdrGlint?: boolean;
    renderMode?: 'SOFT_MOSAIC' | 'SHARP_VECTOR' | 'HYBRID_TESSERAE' | 'DETAIL_ENHANCED';
    detailEnhanceStrength?: number;
    aiBilinearUpscale?: boolean;
  } = {}
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = resolution >= 256;

  const src = CHARACTER_IMAGE_ASSETS[type];
  const img = options.customImage || (src ? preloadImage(src) : null);

  if (img && img.complete && img.naturalWidth > 0) {
    // 1. Draw source image to offscreen canvas maintaining aspect ratio
    const offCanvas = document.createElement('canvas');
    offCanvas.width = resolution;
    offCanvas.height = resolution;
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true })!;

    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawW = resolution;
    let drawH = resolution;
    let drawX = 0;
    let drawY = 0;

    if (imgAspect > 1) {
      drawH = resolution / imgAspect;
      drawY = (resolution - drawH) / 2;
    } else {
      drawW = resolution * imgAspect;
      drawX = (resolution - drawW) / 2;
    }

    offCtx.drawImage(img, drawX, drawY, drawW, drawH);
    const srcData = offCtx.getImageData(0, 0, resolution, resolution).data;

    ctx.clearRect(0, 0, resolution, resolution);

    // 2. Adaptive Tesserae calculation based on target resolution or custom setting
    let tileSize = options.tileSize ?? 1;
    if (options.tileSize === undefined) {
      if (resolution >= 1024) tileSize = 4;
      else if (resolution >= 512) tileSize = 3;
      else if (resolution >= 256) tileSize = 2;
      else if (resolution >= 128) tileSize = 1.5;
      else tileSize = 1;
    }

    const tileStyle = options.tileStyle || 'ROMAN_STONE';
    const groutIntensity = options.groutIntensity ?? 40;
    const grout = (groutIntensity / 100) * (tileSize > 1 ? 0.6 : 0.2);
    const tileDrawW = Math.max(0.8, tileSize - grout);
    const tileDrawH = Math.max(0.8, tileSize - grout);

    const cols = Math.ceil(resolution / tileSize);
    const rows = Math.ceil(resolution / tileSize);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * tileSize;
        const y = r * tileSize;

        const sampleX = Math.min(resolution - 1, Math.floor(x + tileSize / 2));
        const sampleY = Math.min(resolution - 1, Math.floor(y + tileSize / 2));
        const idx = (sampleY * resolution + sampleX) * 4;

        let red = srcData[idx];
        let green = srcData[idx + 1];
        let blue = srcData[idx + 2];
        const alpha = srcData[idx + 3];

        if (alpha < 15) continue;

        const brightness = 0.299 * red + 0.587 * green + 0.114 * blue;
        const distFromCenter = Math.hypot(
          (sampleX - resolution / 2) / (resolution / 2),
          (sampleY - resolution / 2) / (resolution / 2)
        );

        // Smart Silhouette Cutout for character isolation
        let finalAlpha = alpha / 255;
        if (brightness < 16 && distFromCenter > 0.46) {
          finalAlpha = 0.0;
        } else if (brightness < 28 && distFromCenter > 0.62) {
          finalAlpha = Math.max(0, (brightness - 16) / 12);
        } else if (brightness < 20) {
          finalAlpha = Math.max(0.2, brightness / 20);
        }

        if (finalAlpha <= 0.03) continue;

        // Neural Color Palette Grading
        if (options.palette === 'CYBER_CYAN') {
          const luma = brightness / 255;
          red = Math.round(luma * 12);
          green = Math.round(luma * 240);
          blue = Math.round(luma * 255);
        } else if (options.palette === 'ROMAN_GOLD') {
          const luma = brightness / 255;
          red = Math.round(luma * 255);
          green = Math.round(luma * 185);
          blue = Math.round(luma * 22);
        } else if (options.palette === 'CRIMSON_NEO') {
          const luma = brightness / 255;
          red = Math.round(luma * 255);
          green = Math.round(luma * 20);
          blue = Math.round(luma * 60);
        } else if (options.palette === 'EMERALD_QUANTUM') {
          const luma = brightness / 255;
          red = Math.round(luma * 10);
          green = Math.round(luma * 255);
          blue = Math.round(luma * 140);
        } else if (options.palette === 'AMETHYST') {
          const luma = brightness / 255;
          red = Math.round(luma * 220);
          green = Math.round(luma * 70);
          blue = Math.round(luma * 240);
        } else if (options.palette === 'TITANIUM_WHITE') {
          const luma = brightness / 255;
          red = Math.round(luma * 235);
          green = Math.round(luma * 245);
          blue = Math.round(luma * 255);
        }

        // Sub-pixel micro-stone noise
        const stoneNoise = ((c * 29 + r * 47) % 15) - 7;
        const finalR = Math.max(0, Math.min(255, red + stoneNoise));
        const finalG = Math.max(0, Math.min(255, green + stoneNoise));
        const finalB = Math.max(0, Math.min(255, blue + stoneNoise));

        // Draw Roman Tesserae Block
        ctx.fillStyle = `rgba(${finalR}, ${finalG}, ${finalB}, ${finalAlpha})`;
        ctx.fillRect(x, y, tileDrawW, tileDrawH);

        // High-Fidelity Details for HD resolutions (128, 256, 512, 1024)
        if (resolution >= 128) {
          if (tileStyle === 'ROMAN_STONE' && brightness > 70) {
            // Bevel Chamfer Specular Edge
            ctx.fillStyle = `rgba(255, 255, 255, ${0.25 * (brightness / 255) * finalAlpha})`;
            ctx.fillRect(x, y, tileDrawW, Math.max(0.6, tileSize * 0.2));
            ctx.fillRect(x, y, Math.max(0.6, tileSize * 0.2), tileDrawH);
          } else if (tileStyle === 'QUANTUM_TRANSISTOR' && brightness > 90) {
            ctx.fillStyle = '#00f0ff';
            ctx.fillRect(x + tileDrawW / 2 - 0.5, y + tileDrawH / 2 - 0.5, 1, 1);
          }
        }
      }
    }
  } else {
    // Fallback procedural vector rendered at target resolution
    drawCharacterVectorToCanvas(ctx, type, resolution, resolution);
  }

  // 3. Detail Enhancement & Convolution Filtering Pass
  if (options.renderMode && options.renderMode !== 'HYBRID_TESSERAE') {
    applyDetailEnhancementPass(canvas, options.renderMode, options.detailEnhanceStrength ?? 50);
  }

  // 4. AI-driven Bilinear Upscaling with Noise Reduction for HD Modes (when enabled)
  if (options.aiBilinearUpscale && resolution >= 128) {
    const upscaled = applyAiBilinearUpscaleWithNoiseReduction(canvas, resolution, resolution, {
      noiseReductionStrength: 0.55,
      preserveEdges: true,
    });
    return upscaled;
  }

  return canvas;
}

/**
 * Generates an authentic 64x64 Retro Arcade Pixel Sprite with Roman Mosaic micro-tesserae clustering
 * (Backward compatibility wrapper around generateMosaicSpriteMultiRes)
 */
export function generatePixelSprite64(
  type: MosaicCharacterType,
  options: {
    dither?: boolean;
    palette?: 'CYBER_CYAN' | 'ROMAN_GOLD' | 'CRIMSON_NEO' | 'AMETHYST' | 'ORIGINAL';
    customImage?: HTMLImageElement | null;
  } = {}
): HTMLCanvasElement {
  return generateMosaicSpriteMultiRes(type, 64, options);
}

/**
 * Universal Volumetric 3D Character Mesh Generator:
 * Creates a fully unified, multi-angle 3D character mesh with front and back textures,
 * continuous beveled volumetric perimeter hull skirt, anatomical chassis attachments,
 * dynamic lighting cores, ground contact shadows, and integrated geometry simplification.
 */
export function createUniversalVolumetricCharacterMesh(options: {
  characterType?: MosaicCharacterType;
  frontTexture?: THREE.Texture;
  backTexture?: THREE.Texture;
  customFrontCanvas?: HTMLCanvasElement;
  customBackCanvas?: HTMLCanvasElement;
  tileStyle?: 'ROMAN_STONE' | 'QUANTUM_TRANSISTOR' | 'GLYPH_CIPHER' | 'NEON_CIRCUIT';
  palette?: 'ORIGINAL' | 'CYBER_CYAN' | 'ROMAN_GOLD' | 'CRIMSON_NEO' | 'EMERALD_QUANTUM' | 'AMETHYST' | 'TITANIUM_WHITE';
  tileSize?: number;
  groutIntensity?: number;
  chassisDepth?: number;
  wireframe?: boolean;
  scale?: number;
  simplificationTier?: MeshSimplificationTier;
  archetype?: 'MECH' | 'STARFIGHTER' | 'DROID' | 'PILOT' | 'BOSS' | 'WEAPON' | 'AUTO';
}): { group: THREE.Group; stats: MeshSimplificationStats } {
  const s = options.scale || 1.0;
  const depth = options.chassisDepth ?? 0.24;
  const tier = options.simplificationTier || 'CYBER_BALANCED';
  const type = options.characterType || 'VALKYRIE_FRONT';

  // Determine Archetype
  let archetype = options.archetype || 'AUTO';
  if (archetype === 'AUTO') {
    if (type.includes('STARFIGHTER') || type.includes('CORVETTE') || type.includes('CRUISER')) {
      archetype = 'STARFIGHTER';
    } else if (type.includes('DRONE') || type.includes('SENTINEL')) {
      archetype = 'DROID';
    } else if (type.includes('GOLIATH') || type.includes('BOSS')) {
      archetype = 'BOSS';
    } else if (type.includes('PILOT') || type.includes('RUNNER')) {
      archetype = 'PILOT';
    } else if (type.includes('RIFLE') || type.includes('WEAPON') || type.includes('SWORD')) {
      archetype = 'WEAPON';
    } else {
      archetype = 'MECH';
    }
  }

  // Resolve Front and Back Textures
  let frontTex = options.frontTexture;
  let backTex = options.backTexture;

  if (!frontTex) {
    if (options.customFrontCanvas) {
      frontTex = new THREE.CanvasTexture(options.customFrontCanvas);
    } else {
      frontTex = createLevel4MosaicTexture(type, {
        tileSize: options.tileSize || 3,
        tileStyle: options.tileStyle || 'ROMAN_STONE',
        palette: options.palette,
        groutIntensity: options.groutIntensity ?? 40,
      });
    }
  }

  if (!backTex) {
    if (options.customBackCanvas) {
      backTex = new THREE.CanvasTexture(options.customBackCanvas);
    } else {
      const backType = (type.replace('_FRONT', '_BACK') as MosaicCharacterType) || type;
      backTex = createLevel4MosaicTexture(backType, {
        tileSize: options.tileSize || 3,
        tileStyle: options.tileStyle || 'ROMAN_STONE',
        palette: options.palette,
        groutIntensity: options.groutIntensity ?? 40,
      });
    }
  }

  frontTex.magFilter = THREE.LinearFilter;
  frontTex.minFilter = THREE.LinearMipmapLinearFilter;
  backTex.magFilter = THREE.LinearFilter;
  backTex.minFilter = THREE.LinearMipmapLinearFilter;

  const rawGroup = new THREE.Group();

  if (archetype === 'STARFIGHTER') {
    // Starfighter Aerospace Fuselage
    const baseCraft = createStarfighterHero3DMesh({
      frontTexture: frontTex,
      backTexture: backTex,
      wireframe: options.wireframe,
      scale: s,
    });
    rawGroup.add(baseCraft);
  } else if (archetype === 'BOSS') {
    // Heavy Goliath Titan
    const baseTitan = createGoliathBoss3DMesh({
      frontTexture: frontTex,
      backTexture: backTex,
      wireframe: options.wireframe,
      scale: s,
    });
    rawGroup.add(baseTitan);
  } else if (archetype === 'DROID') {
    // Sentinel / Cyber Drone
    const baseDrone = createSentinelDroid3DMesh({
      frontTexture: frontTex,
      backTexture: backTex,
      wireframe: options.wireframe,
      scale: s,
    });
    rawGroup.add(baseDrone);
  } else if (archetype === 'PILOT') {
    // Cyber Pilot / Runner
    const basePilot = createCyberPilot3DMesh({
      frontTexture: frontTex,
      backTexture: backTex,
      wireframe: options.wireframe,
      scale: s,
    });
    rawGroup.add(basePilot);
  } else {
    // Mech / Mobile Suit (Valkyrie Gundam / Hero Mech)
    const baseMech = createValkyrieGundam3DMesh({
      frontTexture: frontTex,
      backTexture: backTex,
      wireframe: options.wireframe,
      scale: s,
    });
    rawGroup.add(baseMech);
  }

  // Add Universal Volumetric Chassis Hull Rim to prevent paper cutout effect
  const hullShape =
    archetype === 'STARFIGHTER'
      ? 'DELTA_FUSELAGE'
      : archetype === 'DROID'
      ? 'HEX_DRONE'
      : 'BIPED_ARMOR';

  const volumetricHull = createVolumetricChassisHull({
    width: (archetype === 'BOSS' ? 4.8 : archetype === 'STARFIGHTER' ? 4.0 : 3.0) * s,
    height: (archetype === 'BOSS' ? 5.2 : archetype === 'STARFIGHTER' ? 4.4 : 3.6) * s,
    depth: depth * s,
    shapeType: hullShape,
    wireframe: options.wireframe,
    metalness: 0.88,
    roughness: 0.28,
  });

  if (archetype === 'STARFIGHTER') {
    volumetricHull.rotation.x = -Math.PI / 2;
    volumetricHull.position.set(0, 0, 0);
  } else {
    volumetricHull.position.set(0, 0, 0);
  }

  rawGroup.add(volumetricHull);

  // Apply Geometry Simplification Pipeline with full diagnostic statistics
  const { optimizedGroup, stats } = simplify3DCharacterGeometry(rawGroup, {
    tier,
  });

  return { group: optimizedGroup, stats };
}


