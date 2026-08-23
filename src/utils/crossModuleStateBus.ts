/**
 * Cross-Module Unified State Bus & Interactivity Matrix
 * Enables bidirectional reactivity between all modules:
 * - Light Protocol PCB (Spectrum, Wavelength, Energy, Laser Perks)
 * - Hologram Gear Engine (RPM, Overclock, Chrono Escapement)
 * - Aurora Machine Console (Flux Frequency, Harmonics, Beam Power)
 * - Subsystems Matrix (8 Subsystems: Health, Shield, CPU, Heat, AI Core, etc.)
 * - Tactical Telemetry HUD (Radar Anomalies, Tubes, Matrix Stream)
 * - Roman Mosaic Engine & 3D Character Studio (Custom Assets, Tesserae Style)
 * - Armor Assembly Modal (Defense, Speed, Chassis Weight)
 * - All 3D & 2D Arcade Games (Space Sim, Mech TPS, Cyber FPS, Pixel Arcade)
 */

import { LightPreset, SubsystemStatus, HologramEngineState, TelemetryState, RadarAnomaly } from '../types';
import { CustomCharacterAsset, CharacterTargetSlot, MosaicTileStyle, ColorPaletteMode } from './customCharacterStore';

export interface CrossModulePerkEffect {
  weaponDamageMultiplier: number;
  fireRateMultiplier: number;
  shieldRechargeRate: number;
  engineThrustMultiplier: number;
  laserColor: string;
  engineGlowColor: string;
  hudThemeColor: string;
  perkName: string;
  perkDescription: string;
}

export interface CrossModuleState {
  // 1. Light Protocol Interactivity
  lightPreset: LightPreset;
  primaryColor: string;
  glowColor: string;
  wavelengthTHz: number;
  energyOutputMW: number;

  // 2. Hologram Gear Interactivity
  gearRpm: number;
  gearRatio: number;
  isOverclocked: boolean;
  overclockSpeedBoost: number;

  // 3. Aurora Machine Console
  fluxFrequency: number;
  beamHarmonics: number;
  thermalDissipation: number;

  // 4. Subsystems Shared State
  subsystems: SubsystemStatus;

  // 5. Tactical Telemetry & Radar
  activeRadarTarget: RadarAnomaly | null;
  radarAnomalies: RadarAnomaly[];
  radarScanSpeed: number;

  // 6. Mosaic & Character Customization
  tesseraeTileStyle: MosaicTileStyle;
  paletteMode: ColorPaletteMode;
  tesseraeTileSize: number;
  volumetricBevelDepth: number;

  // 7. Armor Assembly Stats
  armorIntegrityBonus: number;
  shieldCapBonus: number;
  chassisAgilityBonus: number;
  equippedWeaponType: 'PLASMA_RIFLE' | 'GAUSS_RAILGUN' | 'BEAM_SABER' | 'STARFIGHTER_CANNON';

  // 8. Virtual Screen Resolution Scaling
  virtualResolution: {
    width: number;
    height: number;
    id: string;
    aspect: '16:9' | '1:1';
    scaleMultiplier: number | 'AUTO';
    crispMode: 'PIXELATED' | 'BILINEAR_HD' | 'HDR_TESSERAE';
    crtFilter: boolean;
  };

  // Telemetry Feedback from Games
  inGameKillCount: number;
  inGameBossDefeated: boolean;
  lastCombatEvent: string | null;
}

// Default Cross-Module Initial State
const initialCrossModuleState: CrossModuleState = {
  lightPreset: 'CYBER_CYAN',
  primaryColor: '#00f0ff',
  glowColor: '#00f0ff',
  wavelengthTHz: 620,
  energyOutputMW: 188.4,

  gearRpm: 1240,
  gearRatio: 3.6,
  isOverclocked: false,
  overclockSpeedBoost: 1.0,

  fluxFrequency: 68,
  beamHarmonics: 450,
  thermalDissipation: 88,

  subsystems: {
    health: { current: 980, max: 1000, integrity: 98, status: 'OPTIMAL' },
    aiCore: { load: 42, neuralSync: 99.4, temperatureC: 38.5, promptTokens: 1420 },
    shield: { strength: 88, harmonics: 450, chargeRate: 24.5, locked: true },
    heatTreatedMetal: { alloyStrain: 12, temperatureC: 62.4, structuralPurity: 99.9 },
    cpuDashboard: { coreLoads: [45, 62, 38, 54], clockGhz: 4.85, instructionMips: 94000 },
    assetPacks: { loadedBuffers: 14, matrixCacheMb: 512, activeShaders: ['Aurora_Shader', 'PCB_Traces', 'Brass_Gear_Reflect'] },
    sensors: { emSpectrum: 42.4, quantumResonance: 0.98, thermalFlux: 234.1 },
    nutrientSys: { fluidPressurePsi: 145, electrolyteBalance: 86, bioPurity: 97.5 },
  },

  activeRadarTarget: null,
  radarAnomalies: [
    { id: 'anom-1', label: 'SIG-ALPHA', angle: 45, radius: 60, severity: 'NOMINAL', coordinates: '34°N 118°W', signature: '0x4F92' },
    { id: 'anom-2', label: 'FLUX-ELEVATED', angle: 165, radius: 85, severity: 'ELEVATED', coordinates: '12°S 77°W', signature: '0x88A1' },
    { id: 'anom-3', label: 'QUANTUM-BURST', angle: 280, radius: 45, severity: 'CRITICAL', coordinates: '51°N 0°E', signature: '0xFF30' },
  ],
  radarScanSpeed: 1.0,

  tesseraeTileStyle: 'ROMAN_STONE',
  paletteMode: 'ORIGINAL',
  tesseraeTileSize: 3,
  volumetricBevelDepth: 0.26,

  armorIntegrityBonus: 0,
  shieldCapBonus: 0,
  chassisAgilityBonus: 0,
  equippedWeaponType: 'STARFIGHTER_CANNON',

  virtualResolution: {
    width: 320,
    height: 180,
    id: '320x180',
    aspect: '16:9',
    scaleMultiplier: 'AUTO',
    crispMode: 'PIXELATED',
    crtFilter: true,
  },

  inGameKillCount: 0,
  inGameBossDefeated: false,
  lastCombatEvent: null,
};

let currentBusState: CrossModuleState = { ...initialCrossModuleState };
const listeners: Set<(state: CrossModuleState) => void> = new Set();

/**
 * Subscribe to real-time Cross-Module Bus State updates
 */
export function subscribeToCrossModuleBus(callback: (state: CrossModuleState) => void): () => void {
  listeners.add(callback);
  callback(currentBusState);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Get the current instantaneous snapshot of Cross-Module State
 */
export function getCrossModuleState(): CrossModuleState {
  return currentBusState;
}

/**
 * Update partial Cross-Module State and broadcast to all subscribing modules
 */
export function updateCrossModuleState(partial: Partial<CrossModuleState>): void {
  currentBusState = { ...currentBusState, ...partial };
  listeners.forEach((listener) => listener(currentBusState));
}

/**
 * Compute Active Tactical Combat Perks derived from Light Protocol & Gear Overclock
 */
export function calculateCrossModulePerks(state: CrossModuleState): CrossModulePerkEffect {
  const isOverclocked = state.isOverclocked || state.gearRpm > 2000;
  const overclockMultiplier = isOverclocked ? 1.45 : 1.0;
  const fluxFactor = (state.fluxFrequency / 68);

  switch (state.lightPreset) {
    case 'GAMMA_PULSE':
      return {
        weaponDamageMultiplier: 1.4 * fluxFactor * overclockMultiplier,
        fireRateMultiplier: 1.5 * overclockMultiplier,
        shieldRechargeRate: 1.0,
        engineThrustMultiplier: 1.25,
        laserColor: '#a855f7',
        engineGlowColor: '#c084fc',
        hudThemeColor: '#a855f7',
        perkName: 'GAMMA SURGE (+40% DMG / +50% FIRE RATE)',
        perkDescription: 'Photon traces supercharged at 780 THz. Hyper-dense particle barrage unlocked.',
      };

    case 'SOLAR_AMBER':
      return {
        weaponDamageMultiplier: 1.15 * fluxFactor,
        fireRateMultiplier: 1.1,
        shieldRechargeRate: 1.65,
        engineThrustMultiplier: 1.1,
        laserColor: '#ffaa00',
        engineGlowColor: '#fbbf24',
        hudThemeColor: '#f59e0b',
        perkName: 'SOLAR AEGIS (+65% SHIELD REGEN)',
        perkDescription: 'Heat-treated thermite matrix reinforces barrier harmonics and plasma absorption.',
      };

    case 'AURORA_VIOLET':
      return {
        weaponDamageMultiplier: 1.35 * fluxFactor,
        fireRateMultiplier: 1.2,
        shieldRechargeRate: 1.3,
        engineThrustMultiplier: 1.45 * overclockMultiplier,
        laserColor: '#ff007f',
        engineGlowColor: '#f43f5e',
        hudThemeColor: '#ec4899',
        perkName: 'AURORA OVERDRIVE (+45% THRUST SPEED)',
        perkDescription: '430 THz plasma slipstream minimizes spatial drag and supercharges maneuver thrusters.',
      };

    case 'BIOLUMINESCENT':
      return {
        weaponDamageMultiplier: 1.1 * fluxFactor,
        fireRateMultiplier: 1.15,
        shieldRechargeRate: 1.4,
        engineThrustMultiplier: 1.2,
        laserColor: '#00ffaa',
        engineGlowColor: '#34d399',
        hudThemeColor: '#10b981',
        perkName: 'BIO-NANITE REPAIR (PASSIVE HULL REGEN)',
        perkDescription: 'Electrolyte fluid pressure channels self-healing nanites into active combat chassis.',
      };

    case 'HEAT_TREATED':
      return {
        weaponDamageMultiplier: 1.5 * fluxFactor,
        fireRateMultiplier: 0.95,
        shieldRechargeRate: 1.1,
        engineThrustMultiplier: 1.15,
        laserColor: '#ff5500',
        engineGlowColor: '#ea580c',
        hudThemeColor: '#f97316',
        perkName: 'THERMITE IMPACT (+50% KINETIC CRUSH)',
        perkDescription: 'Hardened metallic alloy imparts crushing kinetic energy to heavy projectile strikes.',
      };

    case 'SAKURA_PINK':
      return {
        weaponDamageMultiplier: 1.25 * fluxFactor,
        fireRateMultiplier: 1.35,
        shieldRechargeRate: 1.25,
        engineThrustMultiplier: 1.35,
        laserColor: '#ff2a85',
        engineGlowColor: '#fb7185',
        hudThemeColor: '#f43f5e',
        perkName: 'SAKURA CIPHER HARMONICS (CRIT BOOST)',
        perkDescription: 'Mosaic tesserae matrix emits chromatic diffraction beams with multi-target penetration.',
      };

    case 'CYBER_CYAN':
    default:
      return {
        weaponDamageMultiplier: 1.2 * fluxFactor * overclockMultiplier,
        fireRateMultiplier: 1.25 * overclockMultiplier,
        shieldRechargeRate: 1.25,
        engineThrustMultiplier: 1.3 * overclockMultiplier,
        laserColor: '#00f0ff',
        engineGlowColor: '#38bdf8',
        hudThemeColor: '#00f0ff',
        perkName: 'CYBER PHOTON MATRIX (+25% BALANCED)',
        perkDescription: '620 THz silicon bus synchronization provides optimal combat balance across all systems.',
      };
  }
}

/**
 * Report an In-Game Combat Action back to Deck Subsystems & Telemetry
 */
export function dispatchGameCombatEvent(event: {
  type: 'ENEMY_KILL' | 'BOSS_DEFEATED' | 'PLAYER_DAMAGE' | 'SHIELD_DEPLETED' | 'OVERHEAT';
  damageTaken?: number;
  scoreGained?: number;
  sourceGame: string;
}): void {
  const state = currentBusState;

  if (event.type === 'ENEMY_KILL') {
    const updatedCount = state.inGameKillCount + 1;
    updateCrossModuleState({
      inGameKillCount: updatedCount,
      lastCombatEvent: `Enemy destroyed in ${event.sourceGame} (Total: ${updatedCount})`,
    });
  } else if (event.type === 'BOSS_DEFEATED') {
    updateCrossModuleState({
      inGameBossDefeated: true,
      lastCombatEvent: `CRITICAL VICTORY: Capital Boss eradicated in ${event.sourceGame}!`,
    });
  } else if (event.type === 'PLAYER_DAMAGE') {
    const dmg = event.damageTaken || 10;
    const currentHealth = state.subsystems.health.current;
    const newHealth = Math.max(0, currentHealth - dmg);
    const integrity = Math.round((newHealth / state.subsystems.health.max) * 100);

    const updatedSubsystems: SubsystemStatus = {
      ...state.subsystems,
      health: {
        ...state.subsystems.health,
        current: newHealth,
        integrity,
        status: integrity < 30 ? 'CRITICAL' : integrity < 70 ? 'REGENERATING' : 'OPTIMAL',
      },
    };

    updateCrossModuleState({
      subsystems: updatedSubsystems,
      lastCombatEvent: `Chassis damage sustained (-${dmg} HP) in ${event.sourceGame}`,
    });
  }
}

/**
 * Convenient Cross-Module Direct Modifiers for in-game HUDs and Modals
 */
export function cycleCrossModuleLightPreset(): LightPreset {
  const presets: LightPreset[] = [
    'CYBER_CYAN',
    'AURORA_VIOLET',
    'SOLAR_AMBER',
    'BIOLUMINESCENT',
    'GAMMA_PULSE',
    'HEAT_TREATED',
    'SAKURA_PINK',
  ];
  const curIdx = presets.indexOf(currentBusState.lightPreset);
  const next = presets[(curIdx + 1) % presets.length];
  updateCrossModuleState({ lightPreset: next });
  return next;
}

export function toggleCrossModuleOverclock(): boolean {
  const next = !currentBusState.isOverclocked;
  updateCrossModuleState({
    isOverclocked: next,
    gearRpm: next ? Math.max(2400, currentBusState.gearRpm * 1.5) : 1240,
  });
  return next;
}

export function setCrossModuleGearRpm(rpm: number): void {
  updateCrossModuleState({
    gearRpm: rpm,
    isOverclocked: rpm > 2000,
  });
}

export function setCrossModuleFluxFrequency(flux: number): void {
  updateCrossModuleState({
    fluxFrequency: flux,
  });
}

export function setCrossModuleEquippedWeapon(
  weapon: 'PLASMA_RIFLE' | 'GAUSS_RAILGUN' | 'BEAM_SABER' | 'STARFIGHTER_CANNON'
): void {
  updateCrossModuleState({
    equippedWeaponType: weapon,
    lastCombatEvent: `Primary armament set to ${weapon}`,
  });
}

export function boostCrossModuleSubsystem(nodeKey: string): void {
  const state = currentBusState;
  const copy = { ...state.subsystems };
  if (nodeKey === 'HEALTH') copy.health.integrity = 100;
  if (nodeKey === 'SHIELD') copy.shield.strength = 100;
  if (nodeKey === 'HEAT_TREATED_METAL')
    copy.heatTreatedMetal.alloyStrain = Math.max(2, copy.heatTreatedMetal.alloyStrain - 8);
  if (nodeKey === 'NUTRIENT_SYS') copy.nutrientSys.bioPurity = 99.8;
  if (nodeKey === 'AI_CORE') copy.aiCore.neuralSync = 99.9;

  updateCrossModuleState({
    subsystems: copy,
    lastCombatEvent: `Subsystem [${nodeKey}] boosted via photon injection.`,
  });
}
