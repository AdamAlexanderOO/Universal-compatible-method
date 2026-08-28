import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  ShieldAlert,
  Radio,
  Zap,
  Activity,
  Cpu,
  CheckCircle2,
  X,
  ChevronRight,
  Flame,
  Globe,
  Crosshair,
  Sparkles,
} from 'lucide-react';
import { AlertTickerItem, AlertSeverity, AlertCategory } from '../types';
import {
  subscribeToAlerts,
  dismissAlert,
  triggerAlertAction,
  clearAllAlerts,
} from '../utils/alertTickerBus';
import { AppThemeConfig, APP_THEMES } from '../utils/theme';
import { sounds } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

interface AlertTickerProps {
  theme?: AppThemeConfig;
  onNavigateTab?: (tabId: string) => void;
}

export const AlertTicker: React.FC<AlertTickerProps> = ({
  theme = APP_THEMES.CRIMSON_CYBERPUNK,
  onNavigateTab,
}) => {
  const [alerts, setAlerts] = useState<AlertTickerItem[]>([]);
  const [pausedAlertId, setPausedAlertId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToAlerts((updated) => {
      setAlerts(updated);
    });
    return () => unsub();
  }, []);

  const getSeverityStyle = (severity: AlertSeverity) => {
    switch (severity) {
      case 'OMEGA':
      case 'CRITICAL':
        return {
          borderColor: '#ef4444',
          badgeBg: 'rgba(239, 68, 68, 0.2)',
          badgeText: '#f87171',
          accentColor: '#ef4444',
          glow: '0 0 16px rgba(239, 68, 68, 0.4)',
          icon: ShieldAlert,
          label: severity === 'OMEGA' ? 'OMEGA ALERT' : 'CRITICAL THREAT',
        };
      case 'WARN':
        return {
          borderColor: '#f59e0b',
          badgeBg: 'rgba(245, 158, 11, 0.2)',
          badgeText: '#fbbf24',
          accentColor: '#f59e0b',
          glow: '0 0 14px rgba(245, 158, 11, 0.3)',
          icon: AlertTriangle,
          label: 'ANOMALY WARNING',
        };
      case 'SUCCESS':
        return {
          borderColor: '#10b981',
          badgeBg: 'rgba(16, 185, 129, 0.2)',
          badgeText: '#34d399',
          accentColor: '#10b981',
          glow: '0 0 14px rgba(16, 185, 129, 0.3)',
          icon: CheckCircle2,
          label: 'SYSTEM SYNCED',
        };
      case 'INFO':
      default:
        return {
          borderColor: theme.primary,
          badgeBg: `${theme.primary}22`,
          badgeText: theme.primary,
          accentColor: theme.primary,
          glow: `0 0 14px ${theme.primary}44`,
          icon: Activity,
          label: 'TELEMETRY EVENT',
        };
    }
  };

  const getCategoryIcon = (category: AlertCategory) => {
    switch (category) {
      case 'RADAR':
        return Radio;
      case 'POWER':
        return Zap;
      case 'AI_CORE':
        return Cpu;
      case 'SUBSYSTEM':
        return Activity;
      case 'COMBAT':
        return Crosshair;
      case 'SIMULATION':
        return Sparkles;
      case 'SYSTEM':
      default:
        return Globe;
    }
  };

  return (
    <div
      id="alert-ticker-container"
      className="fixed top-3 sm:top-4 right-3 sm:right-4 z-50 flex flex-col gap-2.5 max-w-[360px] sm:max-w-[400px] w-full pointer-events-none select-none"
      style={{ perspective: 1000 }}
    >
      <AnimatePresence mode="popLayout">
        {alerts.map((item) => (
          <AlertToastCard
            key={item.id}
            item={item}
            config={getSeverityStyle(item.severity)}
            CategoryIcon={getCategoryIcon(item.category)}
            isPaused={pausedAlertId === item.id}
            onMouseEnter={() => setPausedAlertId(item.id)}
            onMouseLeave={() => setPausedAlertId(null)}
            onDismiss={() => {
              sounds.playClick(900);
              haptics.trigger('click');
              dismissAlert(item.id);
            }}
            onAction={() => {
              sounds.playClick(1100);
              haptics.trigger('medium');
              triggerAlertAction(item);
              if (item.actionPayload && onNavigateTab) {
                onNavigateTab(item.actionPayload);
              }
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface AlertToastCardProps {
  item: AlertTickerItem;
  config: {
    borderColor: string;
    badgeBg: string;
    badgeText: string;
    accentColor: string;
    glow: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  };
  CategoryIcon: React.ComponentType<{ className?: string }>;
  isPaused: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDismiss: () => void;
  onAction: () => void;
}

const AlertToastCard: React.FC<AlertToastCardProps> = ({
  item,
  config,
  CategoryIcon,
  isPaused,
  onMouseEnter,
  onMouseLeave,
  onDismiss,
  onAction,
}) => {
  const [progress, setProgress] = useState<number>(100);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(item.durationMs || 6000);
  const timerRef = useRef<number | null>(null);

  const duration = item.durationMs || 6000;

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      return;
    }

    const start = Date.now();
    const initialRemaining = remainingTimeRef.current;

    const tick = () => {
      const elapsed = Date.now() - start;
      const currentRemaining = Math.max(0, initialRemaining - elapsed);
      remainingTimeRef.current = currentRemaining;
      const pct = (currentRemaining / duration) * 100;
      setProgress(pct);

      if (currentRemaining <= 0) {
        dismissAlert(item.id);
      } else {
        timerRef.current = requestAnimationFrame(tick);
      }
    };

    timerRef.current = requestAnimationFrame(tick);
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [isPaused, duration, item.id]);

  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 120, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 140, scale: 0.88, transition: { duration: 0.22 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="pointer-events-auto relative rounded-md backdrop-blur-xl overflow-hidden shadow-2xl transition-all duration-200"
      style={{
        backgroundColor: '#090d16F2',
        border: `1px solid ${config.borderColor}`,
        boxShadow: `${config.glow}, inset 0 0 20px rgba(0,0,0,0.6)`,
      }}
    >
      {/* Telemetry Corner Accents */}
      <div
        className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 pointer-events-none"
        style={{ borderColor: config.accentColor }}
      />
      <div
        className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 pointer-events-none"
        style={{ borderColor: config.accentColor }}
      />
      <div
        className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 pointer-events-none"
        style={{ borderColor: config.accentColor }}
      />
      <div
        className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 pointer-events-none"
        style={{ borderColor: config.accentColor }}
      />

      {/* Cyber Scanline Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-40" />

      {/* Top Header Strip */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b text-[10px] font-mono tracking-wider"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest animate-pulse"
            style={{
              backgroundColor: config.badgeBg,
              color: config.badgeText,
            }}
          >
            <Icon className="w-2.5 h-2.5" />
            {config.label}
          </span>
          <span className="text-neutral-400 font-bold">[{item.category}]</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neutral-500 font-mono text-[9px]">[{item.timestamp}]</span>
          <button
            type="button"
            onClick={onDismiss}
            className="text-neutral-400 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors"
            title="Dismiss Alert"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-3">
        <div className="flex items-start gap-2.5">
          <div
            className="w-7 h-7 rounded flex items-center justify-center shrink-0 border mt-0.5"
            style={{
              borderColor: `${config.accentColor}66`,
              backgroundColor: `${config.accentColor}18`,
              color: config.accentColor,
            }}
          >
            <CategoryIcon className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold font-mono tracking-tight text-white flex items-center gap-1.5 truncate">
              {item.title}
            </h4>
            <p className="text-[11px] text-neutral-300 leading-snug mt-1 font-sans">
              {item.description}
            </p>

            {/* Coordinates / Details if present */}
            {item.coordinates && (
              <div className="mt-1.5 text-[9px] font-mono text-neutral-400 flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-white/5 w-fit">
                <Crosshair className="w-2.5 h-2.5 text-cyan-400" />
                <span>COORD: {item.coordinates}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button Strip if configured */}
        {item.actionLabel && (
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onAction}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider text-black active:scale-95 transition-all shadow-md"
              style={{
                backgroundColor: config.accentColor,
                boxShadow: `0 0 10px ${config.accentColor}88`,
              }}
            >
              <span>{item.actionLabel}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Countdown Duration Bar */}
      <div className="h-0.5 w-full bg-white/10 overflow-hidden">
        <div
          className="h-full transition-all duration-75"
          style={{
            width: `${progress}%`,
            backgroundColor: config.accentColor,
            boxShadow: `0 0 6px ${config.accentColor}`,
          }}
        />
      </div>
    </motion.div>
  );
};
