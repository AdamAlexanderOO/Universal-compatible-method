/**
 * Centralized Cyber-Deck & Roman Mosaic Asset Registry
 * Resolves images using Vite URL bundling with fallback endpoints
 */

export const IMAGE_ASSETS = {
  beamSaber: new URL('../assets/images/beam_saber_1787434660618.jpg', import.meta.url).href,
  cyberMechArmor: new URL('../assets/images/cyber_mech_armor_1787089900058.jpg', import.meta.url).href,
  cyberPilotHero: new URL('../assets/images/cyber_pilot_hero_1787089924400.jpg', import.meta.url).href,
  cyberPlasmaRifle: new URL('../assets/images/cyber_plasma_rifle_1787089913135.jpg', import.meta.url).href,
  deepSpaceNebula: new URL('../assets/images/deep_space_nebula_1787434647356.jpg', import.meta.url).href,
  enemyCruiserBoss: new URL('../assets/images/enemy_cruiser_boss_1787090414452.jpg', import.meta.url).href,
  enemyDroneFighter: new URL('../assets/images/enemy_drone_fighter_1787090400681.jpg', import.meta.url).href,
  enemyFpsSentinel: new URL('../assets/images/enemy_fps_sentinel_1787090428781.jpg', import.meta.url).href,
  enemyTpsMech: new URL('../assets/images/enemy_tps_mech_1787090446411.jpg', import.meta.url).href,
  gaussRailgun: new URL('../assets/images/gauss_railgun_1787434622054.jpg', import.meta.url).href,
  playerMechHero: new URL('../assets/images/player_mech_hero_1787187990637.jpg', import.meta.url).href,
  playerMechRear: new URL('../assets/images/player_mech_rear_1787188006708.jpg', import.meta.url).href,
  romanCyberMosaic: new URL('../assets/images/roman_cyber_mosaic_1787188021928.jpg', import.meta.url).href,
  spaceStarfighterHero: new URL('../assets/images/space_starfighter_hero_1787089887255.jpg', import.meta.url).href,
  stealthCorvette: new URL('../assets/images/stealth_corvette_1787434635548.jpg', import.meta.url).href,
  valkyrieGundam: new URL('../assets/images/valkyrie_gundam_1787434609815.jpg', import.meta.url).href,
};

// Global in-memory cache for pre-decoded images and canvas elements
const globalImageCache = new Map<string, HTMLImageElement>();

/**
 * Procedural fallback canvas generator if any image asset fails to load
 */
function createProceduralPlaceholder(filename: string): HTMLImageElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Cyber dark radial background
  const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 260);
  grad.addColorStop(0, '#162238');
  grad.addColorStop(1, '#080d18');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Grid lines
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 512; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  // Neon Emblem Circle
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(256, 256, 120, 0, Math.PI * 2);
  ctx.stroke();

  // Crosshair
  ctx.beginPath();
  ctx.moveTo(256, 100);
  ctx.lineTo(256, 412);
  ctx.moveTo(100, 256);
  ctx.lineTo(412, 256);
  ctx.stroke();

  // Text
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CYBER MATRIX ASSET', 256, 250);
  ctx.fillStyle = '#00f0ff';
  ctx.font = '14px monospace';
  const cleanName = filename.replace(/_\d+\.jpg$/, '').replace(/_/g, ' ').toUpperCase();
  ctx.fillText(cleanName || 'NEURAL EMISSARY', 256, 280);

  const img = new Image();
  img.src = canvas.toDataURL('image/png');
  return img;
}

/**
 * Robust image loader with multi-path resolution and procedural fallback
 */
export function loadAppImage(
  src: string,
  onSuccess: (img: HTMLImageElement) => void,
  onError?: () => void
): () => void {
  // Check if image is already cached and loaded
  if (globalImageCache.has(src)) {
    const cached = globalImageCache.get(src)!;
    if (cached.complete && cached.naturalWidth > 0) {
      onSuccess(cached);
      return () => {};
    }
  }

  const filename = src.split('/').pop()?.split('?')[0] || 'asset.jpg';

  const candidatePaths = [
    src,
    `/images/${filename}`,
    `/assets/images/${filename}`,
    `/src/assets/images/${filename}`,
    `/public/images/${filename}`,
  ];

  let currentAttempt = 0;
  let isCancelled = false;
  let activeImg: HTMLImageElement | null = null;

  const tryNextPath = () => {
    if (isCancelled) return;

    if (currentAttempt >= candidatePaths.length) {
      // Create guaranteed procedural cyber graphic
      const placeholder = createProceduralPlaceholder(filename);
      globalImageCache.set(src, placeholder);
      onSuccess(placeholder);
      return;
    }

    const testUrl = candidatePaths[currentAttempt];
    currentAttempt++;

    const img = new Image();
    activeImg = img;

    img.onload = () => {
      if (isCancelled) return;
      if (img.naturalWidth > 0) {
        globalImageCache.set(src, img);
        onSuccess(img);
      } else {
        tryNextPath();
      }
    };

    img.onerror = () => {
      if (!isCancelled) {
        tryNextPath();
      }
    };

    img.src = testUrl;

    if (img.complete && img.naturalWidth > 0) {
      if (!isCancelled) {
        globalImageCache.set(src, img);
        onSuccess(img);
      }
    }
  };

  tryNextPath();

  return () => {
    isCancelled = true;
    if (activeImg) {
      activeImg.onload = null;
      activeImg.onerror = null;
    }
  };
}

/**
 * Pre-warm all app image assets into memory
 */
export function prewarmImageAssets(): void {
  if (typeof window === 'undefined') return;
  Object.values(IMAGE_ASSETS).forEach((url) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    globalImageCache.set(url, img);
  });
}
