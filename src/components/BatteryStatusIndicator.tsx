import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  BatteryWarning,
  Zap,
  Flame,
  Sun,
  Shield,
  RefreshCw,
  Sliders,
  Check,
  ChevronDown,
  X,
  Activity,
  Gauge,
} from 'lucide-react';
import {
  PowerManagementState,
  PowerMode,
  PowerChargeState,
  BatteryHealth,
} from '../types';
import { AppThemeConfig, APP_THEMES } from '../utils/theme';
import { sounds } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';
import { dispatchAlert } from '../utils/alertTickerBus';

interface BatteryStatusIndicatorProps {
  powerState: PowerManagementState;
  onUpdatePowerState: (updater: (prev: PowerManagementState) => PowerManagementState) => void;
  theme?: AppThemeConfig;
  className?: string;
}

export const BatteryStatusIndicator: React.FC<BatteryStatusIndicatorProps> = ({
  powerState,
  onUpdatePowerState,
  theme = APP_THEMES.CRIMSON_CYBERPUNK,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const getBatteryIcon = () => {
    const { batteryLevel, chargeState, batteryHealth } = powerState;

    if (chargeState === 'CHARGING' || chargeState === 'REGENERATING') {
      return { Icon: BatteryCharging, isCharging: true, color: '#10b981' };
    }
    if (batteryHealth === 'WARNING' || batteryLevel < 18) {
      return { Icon: BatteryWarning, isCharging: false, color: '#ef4444' };
    }
    if (batteryLevel >= 80) {
      return { Icon: BatteryFull, isCharging: false, color: '#10b981' };
    }
    if (batteryLevel >= 35) {
      return { Icon: BatteryMedium, isCharging: false, color: '#00f0ff' };
    }
    return { Icon: BatteryLow, isCharging: false, color: '#f59e0b' };
  };

  const { Icon: BatteryIconComp, isCharging, color: iconColor } = getBatteryIcon();

  const handleSelectPowerMode = (mode: PowerMode) => {
    sounds.playSpectrumLoad();
    haptics.trigger('medium');

    onUpdatePowerState((prev) => {
      let nextChargeState: PowerChargeState = 'DISCHARGING';
      let nextAmperes = -2.1;
      let nextWattage = 145.0;

      if (mode === 'SOLAR_REGEN') {
        nextChargeState = 'REGENERATING';
        nextAmperes = +3.8;
        nextWattage = 188.5;
      } else if (mode === 'ECO_SAVER') {
        nextChargeState = 'OPTIMAL';
        nextAmperes = -0.8;
        nextWattage = 65.0;
      } else if (mode === 'HYPER_OVERDRIVE') {
        nextChargeState = 'OVERDRIVE';
        nextAmperes = -5.4;
        nextWattage = 290.0;
      }

      return {
        ...prev,
        powerMode: mode,
        chargeState: nextChargeState,
        currentAmperes: nextAmperes,
        powerWattage: nextWattage,
      };
    });

    dispatchAlert({
      title: `POWER BUS: ${mode.replace('_', ' ')}`,
      description: `Power management circuit switched to ${mode} mode (${
        mode === 'SOLAR_REGEN' ? '+3.8A Regen active' : mode === 'ECO_SAVER' ? '-60% energy draw' : 'Peak output enabled'
      }).`,
      severity: mode === 'HYPER_OVERDRIVE' ? 'WARN' : 'INFO',
      category: 'POWER',
      source: 'POWER_MANAGEMENT',
    });
  };

  const handleSuperchargeReactor = () => {
    sounds.playSimulatePulse();
    haptics.trigger('heavy');

    onUpdatePowerState((prev) => ({
      ...prev,
      batteryLevel: 100,
      energyReserveMJ: prev.maxCapacityMJ,
      chargeState: 'OPTIMAL',
      currentAmperes: -1.2,
      cellTemperatureC: 28.5,
      batteryHealth: 'PRISTINE',
      healthPercentage: 99.9,
    }));

    dispatchAlert({
      title: 'REACTOR SUPERCHARGE ENGAGED',
      description: `Auxiliary capacitor grid fully replenished. Battery reserves locked at 100% (50.0 MJ).`,
      severity: 'SUCCESS',
      category: 'POWER',
      source: 'REACTOR_TAP',
    });
  };

  const handlePurgeThermals = () => {
    sounds.playClick(680);
    haptics.trigger('medium');

    onUpdatePowerState((prev) => ({
      ...prev,
      cellTemperatureC: 22.4,
    }));

    dispatchAlert({
      title: 'THERMAL FLUID FLUSH',
      description: 'Cryo-coolant circulated through battery array. Cell temperature nominal at 22.4°C.',
      severity: 'INFO',
      category: 'POWER',
      source: 'THERMAL_SYS',
    });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Visual Battery Pill Button */}
      <button
        type="button"
        id="top-battery-indicator-btn"
        onClick={() => {
          sounds.playClick(780);
          haptics.trigger('click');
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/15 hover:bg-white/10 active:scale-95 transition-all text-xs font-mono select-none min-h-[34px]"
        style={{
          borderColor: isOpen ? theme.primary : 'rgba(255, 255, 255, 0.15)',
          boxShadow: isOpen ? `0 0 10px ${theme.primary}44` : undefined,
        }}
        title="Simulated Power Management Subsystem Telemetry"
      >
        {/* Dynamic Battery Icon */}
        <div className="relative flex items-center justify-center">
          <BatteryIconComp
            className={`w-4 h-4 transition-colors ${
              isCharging || powerState.batteryLevel < 18 ? 'animate-pulse' : ''
            }`}
            style={{ color: iconColor }}
          />
          {isCharging && (
            <span
              className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"
            />
          )}
        </div>

        {/* Battery Fill Bar & Text */}
        <div className="flex flex-col items-start leading-none">
          <div className="flex items-center gap-1">
            <span
              className="text-[10px] font-bold tracking-tight"
              style={{
                color:
                  powerState.batteryLevel < 20
                    ? '#ef4444'
                    : powerState.batteryLevel < 40
                    ? '#f59e0b'
                    : '#e2e8f0',
              }}
            >
              {Math.round(powerState.batteryLevel)}%
            </span>
            {isCharging ? (
              <span className="text-[8px] font-black text-emerald-400 tracking-tighter">⚡ REGEN</span>
            ) : (
              <span className="text-[8px] text-neutral-400 font-mono hidden xs:inline">
                {powerState.voltageVolts.toFixed(1)}V
              </span>
            )}
          </div>

          {/* Micro Progress Line */}
          <div className="w-10 h-1 bg-black/60 rounded-full overflow-hidden mt-0.5 border border-white/10">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.max(4, powerState.batteryLevel)}%`,
                backgroundColor: iconColor,
                boxShadow: `0 0 6px ${iconColor}`,
              }}
            />
          </div>
        </div>
      </button>

      {/* Popover / Telemetry Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop click to dismiss */}
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-full mt-2 w-[310px] sm:w-[360px] z-50 rounded-lg backdrop-blur-xl border shadow-2xl p-4 text-white font-mono select-none"
              style={{
                backgroundColor: '#090d16F8',
                borderColor: `${theme.primary}66`,
                boxShadow: `0 10px 30px rgba(0,0,0,0.8), 0 0 20px ${theme.primary}22`,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div
                    className="p-1.5 rounded"
                    style={{ backgroundColor: `${theme.primary}22`, color: theme.primary }}
                  >
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold tracking-wider uppercase text-white">
                      Power Management Matrix
                    </h3>
                    <p className="text-[9px] text-neutral-400">
                      Subsystem Node #09 • Micro-Grid Telemetry
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Battery Gauge Banner */}
              <div className="mt-3 p-3 rounded bg-black/50 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BatteryIconComp className="w-5 h-5" style={{ color: iconColor }} />
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{powerState.batteryLevel.toFixed(1)}%</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest bg-white/10 text-neutral-300">
                          {powerState.chargeState}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        {powerState.energyReserveMJ.toFixed(1)} / {powerState.maxCapacityMJ.toFixed(1)} MJ
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-bold text-neutral-300">
                      {powerState.powerWattage.toFixed(1)} W
                    </div>
                    <div
                      className="text-[9px] font-bold"
                      style={{
                        color: powerState.currentAmperes >= 0 ? '#10b981' : '#f59e0b',
                      }}
                    >
                      {powerState.currentAmperes >= 0 ? `+${powerState.currentAmperes.toFixed(1)} A` : `${powerState.currentAmperes.toFixed(1)} A`}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-black/80 rounded-full overflow-hidden mt-2.5 border border-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${powerState.batteryLevel}%`,
                      backgroundColor: iconColor,
                      boxShadow: `0 0 10px ${iconColor}`,
                    }}
                  />
                </div>
              </div>

              {/* 4 Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 mt-2.5 text-[10px]">
                <div className="p-2 rounded bg-white/5 border border-white/5 flex flex-col justify-between">
                  <span className="text-neutral-400 text-[9px]">VOLTAGE / BUS</span>
                  <span className="font-bold text-white mt-1">{powerState.voltageVolts.toFixed(2)} V</span>
                </div>
                <div className="p-2 rounded bg-white/5 border border-white/5 flex flex-col justify-between">
                  <span className="text-neutral-400 text-[9px]">CELL THERMALS</span>
                  <span
                    className={`font-bold mt-1 ${
                      powerState.cellTemperatureC > 45 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {powerState.cellTemperatureC.toFixed(1)} °C
                  </span>
                </div>
                <div className="p-2 rounded bg-white/5 border border-white/5 flex flex-col justify-between">
                  <span className="text-neutral-400 text-[9px]">CELL HEALTH</span>
                  <span className="font-bold text-cyan-300 mt-1">
                    {powerState.healthPercentage.toFixed(1)}% ({powerState.batteryHealth})
                  </span>
                </div>
                <div className="p-2 rounded bg-white/5 border border-white/5 flex flex-col justify-between">
                  <span className="text-neutral-400 text-[9px]">SOLAR HARVEST</span>
                  <span className="font-bold text-amber-300 mt-1">
                    {powerState.solarFluxEfficiencyPct.toFixed(1)}% EFF
                  </span>
                </div>
              </div>

              {/* Power Mode Switcher */}
              <div className="mt-3">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                  Operating Power Profile
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'BALANCED', label: 'Balanced', desc: 'Standard draw', icon: Sliders },
                      { id: 'ECO_SAVER', label: 'Eco Saver', desc: '-60% energy', icon: Shield },
                      { id: 'SOLAR_REGEN', label: 'Solar Regen', desc: 'Active charging', icon: Sun },
                      { id: 'HYPER_OVERDRIVE', label: 'Overdrive', desc: 'Peak output', icon: Flame },
                    ] as const
                  ).map((m) => {
                    const isSelected = powerState.powerMode === m.id;
                    const ModeIcon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectPowerMode(m.id)}
                        className={`p-2 rounded text-left border flex items-center gap-2 transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-white/15 text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                        }`}
                        style={{
                          borderColor: isSelected ? theme.primary : 'rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <ModeIcon
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: isSelected ? theme.primary : undefined }}
                        />
                        <div className="min-w-0 flex-1 leading-tight">
                          <div className="text-[10px] font-bold text-white truncate">{m.label}</div>
                          <div className="text-[8px] text-neutral-400 truncate">{m.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSuperchargeReactor}
                  className="flex-1 py-1.5 px-2 rounded text-[10px] font-bold uppercase tracking-wider text-black bg-emerald-400 hover:bg-emerald-300 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1"
                >
                  <Zap className="w-3 h-3 fill-black" />
                  <span>Reactor Boost</span>
                </button>
                <button
                  type="button"
                  onClick={handlePurgeThermals}
                  className="py-1.5 px-2.5 rounded text-[10px] font-bold uppercase tracking-wider text-neutral-300 bg-white/10 hover:bg-white/15 border border-white/15 active:scale-95 transition-all"
                  title="Flush battery cooling fluid"
                >
                  Cryo-Flush
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
