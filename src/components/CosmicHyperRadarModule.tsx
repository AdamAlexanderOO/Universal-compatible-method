import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio,
  Crosshair,
  Sparkles,
  Zap,
  Globe,
  Compass,
  Layers,
  Activity,
  AlertTriangle,
  Flame,
  Shield,
  Eye,
  Sliders,
  Play,
  RotateCcw,
  RefreshCw,
  Search,
  Filter,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CosmicCelestialEntity, CosmicRangeTier } from '../types';
import { COSMIC_RANGE_TIERS, INITIAL_COSMIC_ENTITIES } from '../data/cosmicRadarData';
import { AppThemeConfig, APP_THEMES } from '../utils/theme';
import { sounds } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

interface CosmicHyperRadarModuleProps {
  powerOn?: boolean;
  theme?: AppThemeConfig;
  onEventSimulated?: (event: CosmicCelestialEntity) => void;
  className?: string;
}

export const CosmicHyperRadarModule: React.FC<CosmicHyperRadarModuleProps> = ({
  powerOn = true,
  theme = APP_THEMES.CRIMSON_CYBERPUNK,
  onEventSimulated,
  className = '',
}) => {
  // State
  const [activeTier, setActiveTier] = useState<CosmicRangeTier>('TRILLION_PARSEC');
  const [entities, setEntities] = useState<CosmicCelestialEntity[]>(INITIAL_COSMIC_ENTITIES);
  const [selectedEntity, setSelectedEntity] = useState<CosmicCelestialEntity | null>(
    INITIAL_COSMIC_ENTITIES.find((e) => e.tier === 'TRILLION_PARSEC') || INITIAL_COSMIC_ENTITIES[0]
  );
  const [sweepAngle, setSweepAngle] = useState<number>(0);
  const [radarSpinSpeed, setRadarSpinSpeed] = useState<number>(1.2);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [simulatedQubits, setSimulatedQubits] = useState<number>(512);
  const [tachyonicBufferLoad, setTachyonicBufferLoad] = useState<number>(34);
  const [isSimulatingEvent, setIsSimulatingEvent] = useState<boolean>(false);
  const [simulationActionNotice, setSimulationActionNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'RADAR_VIEW' | 'EVENT_SIMULATOR' | 'SPECTROMETER' | 'EVENT_LOG'>('RADAR_VIEW');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Custom simulation form state
  const [customName, setCustomName] = useState<string>('Omega-Cluster Singularity Core');
  const [customCategory, setCustomCategory] = useState<CosmicCelestialEntity['category']>('HYPERMASSIVE_QUASAR');
  const [customDistanceTpc, setCustomDistanceTpc] = useState<number>(45.8);
  const [customEnergyYw, setCustomEnergyYw] = useState<number>(9.8e15);
  const [customThreat, setCustomThreat] = useState<CosmicCelestialEntity['severity']>('CRITICAL');

  // Logs stream
  const [eventLogs, setEventLogs] = useState<Array<{ id: string; time: string; text: string; threat: string; tier: string }>>([
    {
      id: 'log-1',
      time: '14:28:02',
      text: 'Tachyonic Relay Matrix linked to Trillion-Parsec Horizon (10¹⁴ pc). Zero-lag photon compensation active.',
      threat: 'NOMINAL',
      tier: 'TRILLION_PARSEC',
    },
    {
      id: 'log-2',
      time: '14:28:15',
      text: 'Detected massive gravitational wave ripple from Void of Chronos (4.82 Trillion Parsecs).',
      threat: 'CRITICAL',
      tier: 'TRILLION_PARSEC',
    },
    {
      id: 'log-3',
      time: '14:28:40',
      text: 'Higgs field phase transition wave tracked at 82.1 Trillion Parsecs. Receding beyond event horizon.',
      threat: 'OMEGA_CATACLYSMIC',
      tier: 'TRILLION_PARSEC',
    },
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spectroCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filtered entities based on tier and category
  const filteredEntities = useMemo(() => {
    return entities.filter((ent) => {
      const matchTier = ent.tier === activeTier;
      const matchCat = categoryFilter === 'ALL' || ent.category === categoryFilter;
      return matchTier && matchCat;
    });
  }, [entities, activeTier, categoryFilter]);

  // Radar beam continuous sweep
  useEffect(() => {
    if (!powerOn) return;
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      setSweepAngle((prev) => (prev + radarSpinSpeed * 45 * delta) % 360);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [powerOn, radarSpinSpeed]);

  // Periodic simulated buffer jitter
  useEffect(() => {
    if (!powerOn) return;
    const interval = setInterval(() => {
      setTachyonicBufferLoad((prev) => Math.min(98, Math.max(12, prev + (Math.random() * 8 - 4))));
    }, 2000);
    return () => clearInterval(interval);
  }, [powerOn]);

  // Canvas 2D / 3D Radar renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 500);
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(cx, cy) * 0.88 * zoomLevel;

    // Background deep space clearing
    ctx.fillStyle = '#050914';
    ctx.fillRect(0, 0, width, height);

    // Deep space grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 32;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Concentric Logarithmic Distance Rings
    const currentTierConfig = COSMIC_RANGE_TIERS.find((t) => t.id === activeTier) || COSMIC_RANGE_TIERS[5];
    const ringFractions = [0.25, 0.5, 0.75, 1.0];
    const ringDistances = ringFractions.map((f) => {
      const dist = currentTierConfig.maxDistanceParsecs * f;
      if (activeTier === 'TACTICAL_AU') return `${(f * 50).toFixed(0)} AU`;
      if (activeTier === 'OORT_LIGHTYEAR') return `${(f * 5).toFixed(1)} LY`;
      if (activeTier === 'GALACTIC_KPC') return `${(f * 100).toFixed(0)} kpc`;
      if (activeTier === 'SUPERCLUSTER_MPC') return `${(f * 50).toFixed(0)} Mpc`;
      if (activeTier === 'COSMIC_WEB_GPC') return `${(f * 28.5).toFixed(1)} Gpc`;
      if (activeTier === 'TRILLION_PARSEC') return `${(f * 100).toFixed(0)} Tpc`;
      return `${(f * 1).toFixed(2)} Qpc`;
    });

    ringFractions.forEach((frac, i) => {
      const r = maxRadius * frac;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = i === ringFractions.length - 1 ? 'rgba(0, 240, 255, 0.4)' : 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = i === ringFractions.length - 1 ? 1.5 : 1;
      ctx.stroke();

      // Ring distance labels
      ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
      ctx.font = '9px monospace';
      ctx.fillText(ringDistances[i], cx + 6, cy - r + 11);
    });

    // Crosshair axes
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(cx - maxRadius, cy);
    ctx.lineTo(cx + maxRadius, cy);
    ctx.moveTo(cx, cy - maxRadius);
    ctx.lineTo(cx, cy + maxRadius);
    ctx.stroke();

    // Cosmic web filaments representation in background for hyper scales
    if (activeTier === 'COSMIC_WEB_GPC' || activeTier === 'TRILLION_PARSEC' || activeTier === 'MULTIVERSE_BRANE') {
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.12)';
      ctx.lineWidth = 1.2;
      for (let a = 0; a < 6; a++) {
        ctx.beginPath();
        const startAngle = (a * Math.PI) / 3;
        ctx.moveTo(cx, cy);
        const midX = cx + Math.cos(startAngle + 0.3) * maxRadius * 0.6;
        const midY = cy + Math.sin(startAngle + 0.3) * maxRadius * 0.6;
        const endX = cx + Math.cos(startAngle) * maxRadius;
        const endY = cy + Math.sin(startAngle) * maxRadius;
        ctx.quadraticCurveTo(midX, midY, endX, endY);
        ctx.stroke();
      }
    }

    // Sweeping Radar Cone Beam
    const sweepRad = (sweepAngle * Math.PI) / 180;
    const sweepSpread = Math.PI / 4; // 45 degrees spread
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
    grad.addColorStop(0.8, 'rgba(0, 240, 255, 0.08)');
    grad.addColorStop(1, 'transparent');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, maxRadius, sweepRad - sweepSpread, sweepRad);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Leading sweep line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweepRad) * maxRadius, cy + Math.sin(sweepRad) * maxRadius);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Render Celestial Entities
    filteredEntities.forEach((entity) => {
      const angleRad = (entity.angleDeg * Math.PI) / 180;
      const r = entity.radiusNorm * maxRadius;
      const x = cx + Math.cos(angleRad) * r;
      const y = cy + Math.sin(angleRad) * r;

      const isSelected = selectedEntity?.id === entity.id;

      // Color coding by severity
      let color = '#38bdf8';
      if (entity.severity === 'CRITICAL') color = '#f59e0b';
      if (entity.severity === 'OMEGA_CATACLYSMIC') color = '#ef4444';
      if (entity.category === 'TYPE_IV_DYSON_SWARM') color = '#10b981';
      if (entity.category === 'MULTIVERSE_BULK_RIFT') color = '#d946ef';

      // Pulse ring for entities near sweep beam
      const angleDiff = Math.abs(((sweepAngle - entity.angleDeg + 180) % 360) - 180);
      const isLitBySweep = angleDiff < 30;

      if (isLitBySweep || isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 16 : 10, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? '#ffffff' : color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Core entity dot
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = isSelected ? 12 : 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label text
      ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
      ctx.font = isSelected ? 'bold 10px monospace' : '9px monospace';
      ctx.fillText(entity.name.split(' ')[0], x + 8, y + 3);

      // Distance tag
      ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
      ctx.font = '8px monospace';
      ctx.fillText(entity.distanceDisplay, x + 8, y + 13);
    });

    // Central Observer Hub (Our Ship / Quantum Sensor Vertex)
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 8, cy - 8, 16, 16);
  }, [powerOn, sweepAngle, filteredEntities, selectedEntity, activeTier, zoomLevel]);

  // Spectrometer waveform visualizer
  useEffect(() => {
    const canvas = spectroCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const renderSpectro = () => {
      phase += 0.05;
      const w = (canvas.width = canvas.parentElement?.clientWidth || 300);
      const h = (canvas.height = 100);

      ctx.fillStyle = '#050b18';
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
      for (let i = 0; i < w; i += 25) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }

      // Sine waveforms for Gravitational & Tachyonic signatures
      const waves = [
        { color: '#00f0ff', freq: 0.04, amp: 22, offset: 0, label: 'Tachyonic Carrier' },
        { color: '#ef4444', freq: 0.02, amp: 14, offset: Math.PI / 2, label: 'Graviton Flux' },
        { color: '#10b981', freq: 0.08, amp: 8, offset: Math.PI, label: 'Quantum Entropy' },
      ];

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 1.8;
        for (let x = 0; x < w; x++) {
          const y = h / 2 + Math.sin(x * wave.freq + phase + wave.offset) * wave.amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animId = requestAnimationFrame(renderSpectro);
    };

    animId = requestAnimationFrame(renderSpectro);
    return () => cancelAnimationFrame(animId);
  }, [selectedEntity]);

  // Trigger Manual Cosmic Event Simulation
  const handleSimulateCustomEvent = () => {
    setIsSimulatingEvent(true);
    if (audioEnabled) {
      sounds.playCosmicSonar();
      sounds.playTachyonicScan();
    }
    haptics.trigger('success');

    const newId = `anom-sim-${Date.now()}`;
    const newEntity: CosmicCelestialEntity = {
      id: newId,
      name: customName || 'Simulated Hyper-Cosmic Anomaly',
      category: customCategory,
      tier: 'TRILLION_PARSEC',
      distanceParsecs: customDistanceTpc * 1e12,
      distanceDisplay: `${customDistanceTpc.toFixed(2)} Trillion Parsecs`,
      lightYearsDisplay: `${(customDistanceTpc * 3.26).toFixed(2)} Trillion Light-Years`,
      angleDeg: Math.floor(Math.random() * 360),
      elevationDeg: Math.floor(Math.random() * 60 - 30),
      radiusNorm: Math.min(0.92, Math.max(0.2, customDistanceTpc / 100)),
      redshiftZ: Math.floor(customDistanceTpc * 1e6),
      energyOutputYw: customEnergyYw,
      severity: customThreat,
      apparentLuminositySun: `${(customDistanceTpc * 2.4).toFixed(1)} × 10²⁴ L☉`,
      coordinates: `RA ${(Math.random() * 24).toFixed(0)}h ${(Math.random() * 60).toFixed(0)}m / DEC +${(Math.random() * 90).toFixed(0)}° (Z=${(customDistanceTpc * 1e6).toFixed(0)})`,
      spectralSignature: `Simulated Synthetic Pulse (λ=${(Math.random() * 5).toFixed(2)}×10⁻¹⁸ m)`,
      simulatedTimeDelayYears: `Photon Lag: ${(customDistanceTpc * 3.26).toFixed(1)} Trillion Yrs | Tachyonic Relay: REAL-TIME (0.00ms)`,
      eventDescription: `User-simulated macro-cosmological event injected into the Trillion-Parsec quantum radar buffer at ${customDistanceTpc} Trillion Parsecs.`,
      tacticalAnalysis:
        'Sensor array dynamically collapsed the tachyonic event horizon. Synthetic telemetry waveform logged to system buffer.',
      phenomenonAction: 'COLLAPSE_SYNTHETIC_EVENT',
    };

    setTimeout(() => {
      setEntities((prev) => [newEntity, ...prev]);
      setSelectedEntity(newEntity);
      setActiveTier('TRILLION_PARSEC');
      setIsSimulatingEvent(false);
      setSimulationActionNotice(`Injected ${newEntity.name} at ${newEntity.distanceDisplay}!`);

      const now = new Date().toTimeString().split(' ')[0];
      setEventLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          time: now,
          text: `[SIMULATED EVENT] Injected ${newEntity.name} at ${newEntity.distanceDisplay} (${newEntity.energyOutputYw.toExponential(2)} YW).`,
          threat: newEntity.severity,
          tier: newEntity.tier,
        },
        ...prev,
      ]);

      if (onEventSimulated) onEventSimulated(newEntity);
      setTimeout(() => setSimulationActionNotice(null), 3500);
    }, 1200);
  };

  // Quick Preset Simulator Action
  const handleTriggerPreset = (presetName: string, category: CosmicCelestialEntity['category'], distTpc: number, threat: CosmicCelestialEntity['severity']) => {
    setCustomName(presetName);
    setCustomCategory(category);
    setCustomDistanceTpc(distTpc);
    setCustomThreat(threat);
    handleSimulateCustomEvent();
  };

  // Handle Action execution on Selected Anomaly
  const handleExecutePhenomenonAction = (entity: CosmicCelestialEntity) => {
    if (audioEnabled) {
      sounds.playQuantumWarp();
    }
    haptics.trigger('warning');
    setSimulationActionNotice(`Executing Protocol: ${entity.phenomenonAction} across ${entity.distanceDisplay}...`);

    const now = new Date().toTimeString().split(' ')[0];
    setEventLogs((prev) => [
      {
        id: `log-act-${Date.now()}`,
        time: now,
        text: `Tachyonic Probe dispatched to ${entity.name}. Telemetry synchronized with zero lag.`,
        threat: entity.severity,
        tier: entity.tier,
      },
      ...prev,
    ]);

    setTimeout(() => {
      setSimulationActionNotice(`Telemetry Locked: ${entity.name} probe active.`);
      setTimeout(() => setSimulationActionNotice(null), 2500);
    }, 1500);
  };

  return (
    <div
      id="cosmic-hyper-radar-module"
      className={`relative w-full rounded-xl border border-white/10 overflow-hidden font-mono select-none flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 p-4 sm:p-6 bg-neutral-950' : 'min-h-[700px] bg-[#040814]'
      } ${className}`}
    >
      {/* Background Starfield Grid Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Top Header & Range Scale Telemetry */}
      <div className="relative z-10 p-3 sm:p-4 border-b border-white/10 bg-neutral-950/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg border border-cyan-500/30 bg-cyan-950/40 flex items-center justify-center text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black tracking-wider text-white">
                MACRO-QUANTUM COSMIC RADAR ENGINE
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                TRILLION-PARSEC HYPER-ARRAY
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                {simulatedQubits} QUBITS REAL-TIME
              </span>
            </div>
            <div className="text-[10px] text-neutral-400">
              TACHYONIC RESOLUTION: 99.98% | BUFFER LOAD: {tachyonicBufferLoad.toFixed(1)}% | TIME-DELAY: 0.00ms
              (COMPENSATED)
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              sounds.playClick(600);
            }}
            className={`p-1.5 rounded border text-xs flex items-center gap-1 transition-all ${
              audioEnabled
                ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-400'
                : 'border-neutral-700 bg-neutral-900 text-neutral-500'
            }`}
            title="Toggle Cosmic Sonar Audio"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => {
              if (audioEnabled) sounds.playCosmicSonar();
              haptics.trigger('radar');
              setSweepAngle((a) => (a + 90) % 360);
            }}
            className="px-2.5 py-1.5 rounded border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all hover:bg-cyan-900/50"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
            <span>PULSE SCAN</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded border border-white/10 bg-neutral-900 text-neutral-300 text-xs hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Cosmological Range Tier Selector Bar */}
      <div className="relative z-10 px-3 py-2 border-b border-white/10 bg-neutral-900/60 overflow-x-auto flex items-center gap-2">
        <span className="text-[10px] text-neutral-400 uppercase font-bold whitespace-nowrap flex items-center gap-1">
          <Globe className="w-3 h-3 text-cyan-400" />
          RANGE SCALE:
        </span>
        {COSMIC_RANGE_TIERS.map((tier) => {
          const isActive = activeTier === tier.id;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => {
                setActiveTier(tier.id);
                if (audioEnabled) sounds.playClick(800);
                haptics.trigger('click');
                const firstInTier = entities.find((e) => e.tier === tier.id);
                if (firstInTier) setSelectedEntity(firstInTier);
              }}
              className={`px-2.5 py-1 rounded text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'bg-neutral-950/80 text-neutral-300 border-white/10 hover:border-cyan-500/40 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tier.color }} />
              <span>{tier.shortLabel}</span>
              {tier.id === 'TRILLION_PARSEC' && (
                <span className="px-1 py-0.2 text-[8px] bg-red-500 text-white rounded font-black">10¹⁴ pc</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Module Layout (Split Screen) */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 sm:p-4 overflow-hidden">
        {/* Left Column: Interactive Radar Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col border border-white/10 bg-neutral-950/80 rounded-lg p-3 relative overflow-hidden">
          {/* Radar Top Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white uppercase">
                {COSMIC_RANGE_TIERS.find((t) => t.id === activeTier)?.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <span>BEARING: {sweepAngle.toFixed(0)}°</span>
              <span>•</span>
              <span>ENTITIES: {filteredEntities.length}</span>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="relative flex-1 w-full min-h-[360px] sm:min-h-[420px] flex items-center justify-center my-2 rounded border border-white/5 overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />

            {/* Radar Corner Telemetry Overlay */}
            <div className="absolute top-2 left-2 pointer-events-none text-[9px] text-cyan-400/80 bg-black/60 p-1.5 rounded border border-cyan-500/20">
              <div>FREQ: 4.82 THz [TACHYONIC]</div>
              <div>SCALE: {COSMIC_RANGE_TIERS.find((t) => t.id === activeTier)?.rangeDisplay}</div>
              <div>HORIZON: EXPANDING (H₀=67.4)</div>
            </div>

            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 p-1 rounded border border-white/10">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                className="px-2 py-0.5 text-xs font-bold text-neutral-300 hover:text-white bg-neutral-900 rounded"
              >
                -
              </button>
              <span className="text-[10px] text-cyan-400 px-1 font-bold">{(zoomLevel * 100).toFixed(0)}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
                className="px-2 py-0.5 text-xs font-bold text-neutral-300 hover:text-white bg-neutral-900 rounded"
              >
                +
              </button>
            </div>

            {/* Floating Simulation Notice Banner */}
            <AnimatePresence>
              {simulationActionNotice && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="absolute bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-cyan-950/95 border border-cyan-400 text-cyan-200 text-xs font-bold rounded-lg shadow-lg backdrop-blur flex items-center gap-2 z-20"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span>{simulationActionNotice}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-[10px]">
            <span className="text-neutral-400 flex items-center gap-1">
              <Filter className="w-3 h-3 text-cyan-400" />
              FILTER:
            </span>
            {['ALL', 'HYPERMASSIVE_QUASAR', 'COSMIC_STRING_FILAMENT', 'TYPE_IV_DYSON_SWARM', 'VACUUM_DECAY_FRONT', 'FLEET_WARP_ARMADA'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-0.5 rounded whitespace-nowrap font-bold border transition-all ${
                  categoryFilter === cat
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                    : 'bg-neutral-900/60 border-white/5 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Deep Telemetry & Event Simulation Console (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Sub-Tabs for Right Console */}
          <div className="flex items-center border-b border-white/10 bg-neutral-950/80 rounded-t-lg p-1 gap-1">
            {[
              { id: 'RADAR_VIEW', label: 'Telemetry Details', icon: Activity },
              { id: 'EVENT_SIMULATOR', label: 'Hyper-Event Lab', icon: Zap },
              { id: 'SPECTROMETER', label: 'Tachyonic Wave', icon: Sliders },
              { id: 'EVENT_LOG', label: 'Cosmic Log', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (audioEnabled) sounds.playClick(700);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: Selected Entity Telemetry */}
          {activeTab === 'RADAR_VIEW' && (
            <div className="flex-1 border border-white/10 bg-neutral-950/80 rounded-b-lg p-3 sm:p-4 flex flex-col justify-between overflow-y-auto space-y-3">
              {selectedEntity ? (
                <>
                  <div>
                    <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
                      <div>
                        <div className="text-xs font-black text-white tracking-wide">{selectedEntity.name}</div>
                        <div className="text-[10px] text-cyan-400 font-bold">
                          {selectedEntity.category.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          selectedEntity.severity === 'OMEGA_CATACLYSMIC'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : selectedEntity.severity === 'CRITICAL'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        }`}
                      >
                        {selectedEntity.severity}
                      </span>
                    </div>

                    {/* Metric Grid */}
                    <div className="grid grid-cols-2 gap-2 my-3 text-[11px]">
                      <div className="bg-neutral-900/80 p-2 rounded border border-white/5">
                        <div className="text-[9px] text-neutral-400 uppercase">Parsec Distance</div>
                        <div className="font-bold text-white">{selectedEntity.distanceDisplay}</div>
                        <div className="text-[9px] text-cyan-400">{selectedEntity.distanceParsecs.toExponential(2)} pc</div>
                      </div>
                      <div className="bg-neutral-900/80 p-2 rounded border border-white/5">
                        <div className="text-[9px] text-neutral-400 uppercase">Light-Year Horizon</div>
                        <div className="font-bold text-white">{selectedEntity.lightYearsDisplay}</div>
                        <div className="text-[9px] text-purple-400">z = {selectedEntity.redshiftZ.toLocaleString()}</div>
                      </div>
                      <div className="bg-neutral-900/80 p-2 rounded border border-white/5">
                        <div className="text-[9px] text-neutral-400 uppercase">Energy Output</div>
                        <div className="font-bold text-amber-300">{selectedEntity.energyOutputYw.toExponential(2)} YW</div>
                        <div className="text-[9px] text-neutral-400">{selectedEntity.apparentLuminositySun}</div>
                      </div>
                      <div className="bg-neutral-900/80 p-2 rounded border border-white/5">
                        <div className="text-[9px] text-neutral-400 uppercase">Vector & Bearing</div>
                        <div className="font-bold text-white">
                          θ={selectedEntity.angleDeg}° | EL={selectedEntity.elevationDeg}°
                        </div>
                        <div className="text-[9px] text-cyan-400 truncate">{selectedEntity.coordinates}</div>
                      </div>
                    </div>

                    {/* Photon Lag vs Tachyonic Relay */}
                    <div className="bg-cyan-950/30 p-2.5 rounded border border-cyan-500/30 text-[10px] space-y-1 mb-3">
                      <div className="font-bold text-cyan-300 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        <span>EVENT HORIZON DELAY COMPENSATION:</span>
                      </div>
                      <div className="text-neutral-300">{selectedEntity.simulatedTimeDelayYears}</div>
                      <div className="text-neutral-400">Signature: {selectedEntity.spectralSignature}</div>
                    </div>

                    {/* Scientific Analysis */}
                    <div className="text-[11px] text-neutral-300 bg-neutral-900/60 p-2.5 rounded border border-white/5 leading-relaxed">
                      <div className="font-bold text-white mb-1">ASTROPHYSICAL EVENT RECONSTRUCTION:</div>
                      {selectedEntity.eventDescription}
                    </div>
                  </div>

                  {/* Tactical Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleExecutePhenomenonAction(selectedEntity)}
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider rounded-lg shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Crosshair className="w-4 h-4" />
                      <span>{selectedEntity.phenomenonAction.replace(/_/g, ' ')}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center text-neutral-500 py-12 text-xs">
                  Select an anomaly or blip from the radar canvas to inspect deep astronomical telemetry.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HYPER-EVENT SIMULATOR LAB */}
          {activeTab === 'EVENT_SIMULATOR' && (
            <div className="flex-1 border border-white/10 bg-neutral-950/80 rounded-b-lg p-3 sm:p-4 flex flex-col justify-between overflow-y-auto space-y-3">
              <div className="space-y-3">
                <div className="border-b border-white/10 pb-2">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>SIMULATED EVENT GENERATION LABORATORY</span>
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    Inject and project hyper-cosmological events up to trillions of parsecs into the radar matrix.
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">Quick Macro Presets:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        handleTriggerPreset(
                          'Hyper-Cluster Singularity Burst',
                          'HYPERMASSIVE_QUASAR',
                          4.82,
                          'CRITICAL'
                        )
                      }
                      className="p-2 rounded bg-neutral-900 border border-white/10 text-left hover:border-cyan-500/50 hover:bg-neutral-800 transition-all"
                    >
                      <div className="font-bold text-cyan-300 truncate">Hyper-Cluster Collapse</div>
                      <div className="text-[9px] text-neutral-400">4.82 Trillion Parsecs</div>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleTriggerPreset(
                          'Vacuum Decay Phase Shockwave',
                          'VACUUM_DECAY_FRONT',
                          82.1,
                          'OMEGA_CATACLYSMIC'
                        )
                      }
                      className="p-2 rounded bg-neutral-900 border border-white/10 text-left hover:border-red-500/50 hover:bg-neutral-800 transition-all"
                    >
                      <div className="font-bold text-red-300 truncate">Vacuum Decay Shock</div>
                      <div className="text-[9px] text-neutral-400">82.10 Trillion Parsecs</div>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleTriggerPreset(
                          'Type IV Civilization Beacon',
                          'TYPE_IV_DYSON_SWARM',
                          38.7,
                          'ELEVATED'
                        )
                      }
                      className="p-2 rounded bg-neutral-900 border border-white/10 text-left hover:border-emerald-500/50 hover:bg-neutral-800 transition-all"
                    >
                      <div className="font-bold text-emerald-300 truncate">Type IV Dyson Swarm</div>
                      <div className="text-[9px] text-neutral-400">38.70 Trillion Parsecs</div>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleTriggerPreset(
                          'Primordial String Whiplash',
                          'COSMIC_STRING_FILAMENT',
                          12.4,
                          'ELEVATED'
                        )
                      }
                      className="p-2 rounded bg-neutral-900 border border-white/10 text-left hover:border-purple-500/50 hover:bg-neutral-800 transition-all"
                    >
                      <div className="font-bold text-purple-300 truncate">Cosmic String Defect</div>
                      <div className="text-[9px] text-neutral-400">12.40 Trillion Parsecs</div>
                    </button>
                  </div>
                </div>

                {/* Custom Synthesizer Inputs */}
                <div className="bg-neutral-900/60 p-3 rounded border border-white/5 space-y-2 text-xs">
                  <div className="font-bold text-white text-[11px]">CUSTOM HYPER-EVENT SYNTHESIZER:</div>

                  <div>
                    <label className="text-[9px] text-neutral-400 block mb-1">EVENT DESIGNATION / TITLE</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full bg-neutral-950 border border-white/10 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-neutral-400 block mb-1">PHENOMENON CLASSIFICATION</label>
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value as any)}
                        className="w-full bg-neutral-950 border border-white/10 rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="HYPERMASSIVE_QUASAR">Hypermassive Quasar</option>
                        <option value="VACUUM_DECAY_FRONT">Vacuum Decay Front</option>
                        <option value="TYPE_IV_DYSON_SWARM">Type IV Dyson Swarm</option>
                        <option value="COSMIC_STRING_FILAMENT">Cosmic String</option>
                        <option value="MULTIVERSE_BULK_RIFT">Multiverse Bulk Rift</option>
                        <option value="DARK_FLOW_ATTRACTOR">Dark Flow Attractor</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] text-neutral-400 block mb-1">
                        DISTANCE: {customDistanceTpc} TRILLION PARSECS
                      </label>
                      <input
                        type="range"
                        min={0.1}
                        max={100}
                        step={0.5}
                        value={customDistanceTpc}
                        onChange={(e) => setCustomDistanceTpc(parseFloat(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={isSimulatingEvent}
                onClick={handleSimulateCustomEvent}
                className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider rounded-lg shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSimulatingEvent ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>COLLAPSING QUANTUM TACHYONIC HORIZON...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>INJECT & SIMULATE HYPER-EVENT</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 3: TACHYONIC SPECTROMETER */}
          {activeTab === 'SPECTROMETER' && (
            <div className="flex-1 border border-white/10 bg-neutral-950/80 rounded-b-lg p-3 sm:p-4 flex flex-col justify-between overflow-y-auto space-y-3">
              <div className="space-y-3">
                <div className="border-b border-white/10 pb-2">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span>TACHYONIC SPECTROGRAM & HARMONIC FILTER</span>
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    Real-time quantum waveform decomposition of incoming trillion-parsec energy fluxes.
                  </div>
                </div>

                {/* Live Spectro Canvas */}
                <div className="w-full h-[110px] rounded border border-white/10 overflow-hidden bg-black relative">
                  <canvas ref={spectroCanvasRef} className="w-full h-full" />
                </div>

                {/* Spectrogram Metrics */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-neutral-900/60 p-2 rounded border border-white/5">
                    <span className="text-neutral-400">Tachyonic Carrier Frequency:</span>
                    <span className="font-bold text-cyan-400">142.85 EHz (λ=2.1 pm)</span>
                  </div>
                  <div className="flex justify-between items-center bg-neutral-900/60 p-2 rounded border border-white/5">
                    <span className="text-neutral-400">Gravitational Wave Strain (h):</span>
                    <span className="font-bold text-amber-400">1.42 × 10⁻²¹ [LIGO-QUANTUM]</span>
                  </div>
                  <div className="flex justify-between items-center bg-neutral-900/60 p-2 rounded border border-white/5">
                    <span className="text-neutral-400">Quantum Phase Coherence:</span>
                    <span className="font-bold text-emerald-400">99.994% Locked</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (audioEnabled) sounds.playTachyonicScan();
                  haptics.trigger('medium');
                  setSimulationActionNotice('Spectrogram calibration harmonic normalized.');
                  setTimeout(() => setSimulationActionNotice(null), 2000);
                }}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded border border-white/10 active:scale-95 transition-all"
              >
                RE-CALIBRATE TACHYONIC FILTERS
              </button>
            </div>
          )}

          {/* TAB 4: EVENT LOG */}
          {activeTab === 'EVENT_LOG' && (
            <div className="flex-1 border border-white/10 bg-neutral-950/80 rounded-b-lg p-3 sm:p-4 flex flex-col justify-between overflow-hidden space-y-3">
              <div className="border-b border-white/10 pb-2">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>COSMIC TELEMETRY STREAM LOG</span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  Chronological recording of all macro-horizon events and simulated horizon collapsers.
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px]">
                {eventLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2 rounded bg-neutral-900/70 border border-white/5 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between text-[9px] text-neutral-400">
                      <span>[{log.time}]</span>
                      <span
                        className={`font-bold ${
                          log.threat === 'OMEGA_CATACLYSMIC'
                            ? 'text-red-400'
                            : log.threat === 'CRITICAL'
                            ? 'text-amber-400'
                            : 'text-cyan-400'
                        }`}
                      >
                        {log.threat}
                      </span>
                    </div>
                    <div className="text-neutral-200 text-[11px] leading-snug">{log.text}</div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setEventLogs([]);
                  if (audioEnabled) sounds.playClick(500);
                }}
                className="w-full py-1.5 bg-neutral-900 text-neutral-400 hover:text-white text-[11px] rounded border border-white/10"
              >
                CLEAR EVENT LOGS
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Banner */}
      <div className="relative z-10 p-2.5 px-4 border-t border-white/10 bg-neutral-950 text-[10px] text-neutral-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            SYNCHRONIZED WITH TACHYONIC HORIZON
          </span>
          <span className="hidden sm:inline text-neutral-500">|</span>
          <span className="hidden sm:inline">SPEED: {radarSpinSpeed.toFixed(1)}x</span>
          <span className="hidden sm:inline text-neutral-500">|</span>
          <span className="hidden sm:inline">PARSEC LIMIT: 1.0 × 10¹⁸ pc</span>
        </div>
        <div className="text-neutral-500">
          POWERED BY SIMULATED QUANTUM EVENT COLLAPSE ENGINE
        </div>
      </div>
    </div>
  );
};
