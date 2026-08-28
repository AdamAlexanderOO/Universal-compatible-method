import { AlertTickerItem, AlertSeverity, AlertCategory } from '../types';
import { sounds } from './soundEffects';
import { haptics } from './haptics';

type AlertListener = (alerts: AlertTickerItem[]) => void;
type AlertActionListener = (item: AlertTickerItem) => void;

let activeAlerts: AlertTickerItem[] = [];
const listeners = new Set<AlertListener>();
const actionListeners = new Set<AlertActionListener>();

const MAX_VISIBLE_ALERTS = 4;
const DEFAULT_ALERT_DURATION_MS = 6000;

export function subscribeToAlerts(callback: AlertListener): () => void {
  listeners.add(callback);
  callback([...activeAlerts]);
  return () => {
    listeners.delete(callback);
  };
}

export function subscribeToAlertActions(callback: AlertActionListener): () => void {
  actionListeners.add(callback);
  return () => {
    actionListeners.delete(callback);
  };
}

function notifyListeners() {
  const snapshot = [...activeAlerts];
  listeners.forEach((fn) => {
    try {
      fn(snapshot);
    } catch (e) {
      console.error('[AlertTickerBus] Error in listener callback', e);
    }
  });
}

export function dispatchAlert(
  params: {
    title: string;
    description: string;
    severity?: AlertSeverity;
    category?: AlertCategory;
    source?: string;
    coordinates?: string;
    actionLabel?: string;
    actionPayload?: string;
    durationMs?: number;
    silent?: boolean;
  }
): AlertTickerItem {
  const now = new Date();
  const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(
    now.getMilliseconds() / 10
  )
    .toString()
    .padStart(2, '0')}`;

  const severity = params.severity || 'INFO';
  const id = `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const alertItem: AlertTickerItem = {
    id,
    timestamp,
    title: params.title,
    description: params.description,
    severity,
    category: params.category || 'SYSTEM',
    source: params.source,
    coordinates: params.coordinates,
    actionLabel: params.actionLabel,
    actionPayload: params.actionPayload,
    durationMs: params.durationMs ?? (severity === 'CRITICAL' || severity === 'OMEGA' ? 8500 : DEFAULT_ALERT_DURATION_MS),
  };

  // Add to top of stack, capped at MAX_VISIBLE_ALERTS
  activeAlerts = [alertItem, ...activeAlerts].slice(0, MAX_VISIBLE_ALERTS);

  // Play audio chime and haptic feedback
  if (!params.silent) {
    sounds.playAlertChime(severity);
    if (severity === 'CRITICAL' || severity === 'OMEGA') {
      haptics.trigger('heavy');
    } else if (severity === 'WARN') {
      haptics.trigger('medium');
    } else {
      haptics.trigger('light');
    }
  }

  notifyListeners();
  return alertItem;
}

export function dismissAlert(id: string): void {
  const idx = activeAlerts.findIndex((a) => a.id === id);
  if (idx >= 0) {
    activeAlerts = activeAlerts.filter((a) => a.id !== id);
    notifyListeners();
  }
}

export function triggerAlertAction(item: AlertTickerItem): void {
  actionListeners.forEach((fn) => {
    try {
      fn(item);
    } catch (e) {
      console.error('[AlertTickerBus] Error triggering alert action', e);
    }
  });
  dismissAlert(item.id);
}

export function clearAllAlerts(): void {
  activeAlerts = [];
  notifyListeners();
}

export function getActiveAlerts(): AlertTickerItem[] {
  return [...activeAlerts];
}
