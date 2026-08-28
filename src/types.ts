export type SimulationMode = 
  | 'SIMULATE' 
  | 'QUANTUM_SYNTHESIS' 
  | 'BIO_TACTICAL' 
  | 'NEURAL_LINK' 
  | 'SPECTRAL_SWEEP';

export type LightPreset = 
  | 'AURORA_VIOLET' 
  | 'CYBER_CYAN' 
  | 'SOLAR_AMBER' 
  | 'BIOLUMINESCENT' 
  | 'GAMMA_PULSE'
  | 'HEAT_TREATED'
  | 'SAKURA_PINK';

export interface LightProtocolData {
  preset: LightPreset;
  name: string;
  primaryColor: string;
  glowColor: string;
  wavelengthTHz: number;
  energyOutputMW: number;
  activePathways: string[];
}

export interface SubsystemStatus {
  health: { current: number; max: number; integrity: number; status: 'OPTIMAL' | 'REGENERATING' | 'CRITICAL' };
  aiCore: { load: number; neuralSync: number; temperatureC: number; promptTokens: number };
  shield: { strength: number; harmonics: number; chargeRate: number; locked: boolean };
  heatTreatedMetal: { alloyStrain: number; temperatureC: number; structuralPurity: number };
  cpuDashboard: { coreLoads: number[]; clockGhz: number; instructionMips: number };
  assetPacks: { loadedBuffers: number; matrixCacheMb: number; activeShaders: string[] };
  sensors: { emSpectrum: number; quantumResonance: number; thermalFlux: number };
  nutrientSys: { fluidPressurePsi: number; electrolyteBalance: number; bioPurity: number };
}

export interface HologramEngineState {
  visibleLayers: {
    holographicWireframe: boolean;
    siliconPcb: boolean;
    mechanicalGears: boolean;
  };
  meshType: 'CRYSTALLINE_FOLDER' | 'QUANTUM_PRISM' | 'NEURAL_LATTICE';
  viewMode: 'EXPLODED_3D' | 'ISOMETRIC' | 'TOP_DOWN' | 'CROSS_SECTION';
  gearRpm: number;
  gearRatio: number;
  prismaticRefraction: number;
}

export interface RadarAnomaly {
  id: string;
  label: string;
  angle: number; // degrees 0-360
  radius: number; // 0-100%
  severity: 'NOMINAL' | 'ELEVATED' | 'CRITICAL';
  coordinates: string;
  signature: string;
  category?: 'STELLAR' | 'FLEET' | 'ANOMALY' | 'MACRO_COSMIC' | 'RIVER_OF_STARS';
  distanceParsecs?: number; // Raw parsec distance (up to 10^15)
  distanceFormatted?: string; // Formatted distance
  energyYieldYw?: number; // Yottawatts yield
  redshiftZ?: number; // Cosmological redshift
}

export type CosmicRangeTier =
  | 'TACTICAL_AU' // 0 - 50 AU
  | 'OORT_LIGHTYEAR' // 1 Light Year (~0.306 Parsec)
  | 'GALACTIC_KPC' // 100 Kiloparsecs (Galactic Disk)
  | 'SUPERCLUSTER_MPC' // 50 Megaparsecs (Virgo Cluster & Filaments)
  | 'COSMIC_WEB_GPC' // 28.5 Gigaparsecs (Observable Universe Horizon)
  | 'TRILLION_PARSEC' // 10^12 - 10^14 Parsecs (Hyper-Cosmological Horizon)
  | 'MULTIVERSE_BRANE'; // 10^15+ Parsecs (Trans-Universal Bulk Dimension)

export interface CosmicCelestialEntity {
  id: string;
  name: string;
  category:
    | 'HYPERMASSIVE_QUASAR'
    | 'GALAXY_CLUSTER_MERGER'
    | 'COSMIC_STRING_FILAMENT'
    | 'TYPE_IV_DYSON_SWARM'
    | 'VACUUM_DECAY_FRONT'
    | 'TACHYONIC_RELIC_BURST'
    | 'DARK_FLOW_ATTRACTOR'
    | 'MULTIVERSE_BULK_RIFT'
    | 'PRIMORDIAL_BLACK_HOLE_RING'
    | 'FLEET_WARP_ARMADA';
  tier: CosmicRangeTier;
  distanceParsecs: number; // e.g. 4.82e12
  distanceDisplay: string; // e.g. "4.82 Trillion Parsecs"
  lightYearsDisplay: string; // e.g. "15.72 Trillion Light-Years"
  angleDeg: number;
  elevationDeg: number;
  radiusNorm: number; // 0.0 to 1.0 on radar circle
  redshiftZ: number; // e.g. 1100 (CMB) or 1.4e6 (super-horizon)
  energyOutputYw: number; // Energy in Yottawatts (10^24 W)
  severity: 'NOMINAL' | 'ELEVATED' | 'CRITICAL' | 'OMEGA_CATACLYSMIC';
  apparentLuminositySun: string; // e.g. "4.2 × 10^18 L☉"
  coordinates: string; // e.g. "RA 14h 29m / DEC +42° 18' (Z=4.82×10⁶)"
  spectralSignature: string; // e.g. "Tachyonic Cherenkov (λ=4.2×10⁻¹⁸ m)"
  simulatedTimeDelayYears: string; // e.g. "Compensated: Real-time via Quantum Tachyonic Relay"
  eventDescription: string;
  tacticalAnalysis: string;
  phenomenonAction: string;
}

export interface CosmicTelemetryStream {
  bufferQubits: number; // Simulated processing state (e.g. 128 - 1024 Qubits)
  tachyonicResolutionPct: number; // e.g. 99.8%
  activeFilterTier: CosmicRangeTier;
  selectedEntity: CosmicCelestialEntity | null;
  sweepAngle: number;
  radarSpinSpeed: number;
  entities: CosmicCelestialEntity[];
  eventLog: Array<{
    id: string;
    timestamp: string;
    tier: CosmicRangeTier;
    title: string;
    parsecDist: string;
    threat: 'NOMINAL' | 'ELEVATED' | 'CRITICAL' | 'OMEGA_CATACLYSMIC';
  }>;
}

export interface TelemetryState {
  gauges: {
    primaryFlux: number; // 45 in reference
    harmonicEntropy: number; // 38 in reference
    capacitorLoad: number; // 33 in reference
  };
  testTubes: Array<{
    id: string;
    label: string;
    level: number;
    color: string;
    pulseSpeed: number;
  }>;
  radarAnomalies: RadarAnomaly[];
  radarAngle: number;
  hexGridActive: number[];
  matrixStreamActive: boolean;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  source: 'SYSTEM' | 'AURORA_CORE' | 'LIGHT_PROTOCOL' | 'AI_SIM' | 'GEAR_DRIVE';
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

export interface SimulationResult {
  simulationId: string;
  status: 'simulated_ai' | 'simulated_local';
  output: {
    title: string;
    description: string;
    metrics: {
      efficiency?: string;
      quantumCoherence?: string;
      entropyIndex?: string;
      thermalDissipation?: string;
      [key: string]: string | undefined;
    };
    recommendation: string;
    anomaliesDetected: number;
    events: string[];
  };
}

export type PowerChargeState =
  | 'CHARGING'
  | 'DISCHARGING'
  | 'OPTIMAL'
  | 'REGENERATING'
  | 'CRITICAL_DRAIN'
  | 'OVERDRIVE';

export type BatteryHealth = 'PRISTINE' | 'OPTIMAL' | 'DEGRADED' | 'WARNING';

export type PowerMode = 'BALANCED' | 'ECO_SAVER' | 'HYPER_OVERDRIVE' | 'SOLAR_REGEN';

export interface PowerManagementState {
  batteryLevel: number; // 0 - 100%
  chargeState: PowerChargeState;
  batteryHealth: BatteryHealth;
  healthPercentage: number; // e.g. 98.4%
  voltageVolts: number; // e.g. 48.2 V
  currentAmperes: number; // e.g. +3.4 A (charging) or -2.1 A (discharging)
  powerWattage: number; // e.g. 163.8 W
  cellTemperatureC: number; // e.g. 34.2 °C
  energyReserveMJ: number; // e.g. 44.2 MJ
  maxCapacityMJ: number; // 50.0 MJ
  powerMode: PowerMode;
  estimatedRuntimeMin: number; // e.g. 340 min
  solarFluxEfficiencyPct: number; // e.g. 94.5%
}

export type AlertSeverity = 'CRITICAL' | 'WARN' | 'INFO' | 'SUCCESS' | 'OMEGA';
export type AlertCategory =
  | 'RADAR'
  | 'SUBSYSTEM'
  | 'POWER'
  | 'AI_CORE'
  | 'COMBAT'
  | 'SIMULATION'
  | 'SYSTEM';

export interface AlertTickerItem {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: AlertCategory;
  source?: string;
  coordinates?: string;
  actionLabel?: string;
  actionPayload?: string;
  durationMs?: number;
}
