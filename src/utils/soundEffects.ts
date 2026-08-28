/**
 * Web Audio API Sound Synthesizer for the Cyber-Deck
 * Provides tactile sci-fi feedback for buttons, sliders, servos, reactor pulses, and radar.
 */

class CyberSoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private ambientGain: GainNode | null = null;
  private lastLaserTime: number = 0;
  private lastDamageTime: number = 0;
  private lastExplosionTime: number = 0;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch (e) {}
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        this.ctx.resume().catch(() => {});
      } catch (e) {}
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (!val && this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Tactile Cyber Button Click (Neon relay contact)
   */
  public playClick(freq = 880, type: OscillatorType = 'sine') {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  /**
   * Aurora Machine Primary SIMULATE Laser/Quantum Pulse
   */
  public playSimulatePulse() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.35);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.frequency.linearRampToValueAtTime(300, now + 0.35);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);

      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(160, now + 0.05);
      subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.4);
      subGain.gain.setValueAtTime(0.2, now + 0.05);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now + 0.05);
      subOsc.stop(now + 0.41);
    } catch (e) {}
  }

  /**
   * Light-Protocol Photon Discharge / Spectrum Change
   */
  public playSpectrumLoad() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [440, 659.25, 880, 1318.5].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.08, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.16);
      });
    } catch (e) {}
  }

  /**
   * Cyber Deck Reactor Power Up / Equipment Surge
   */
  public playPowerUp() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [220, 330, 440, 660, 880].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.08, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.19);
      });
    } catch (e) {}
  }

  /**
   * Mechanical Gear Ratchet / RPM adjustment tick
   */
  public playGearTick() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(320 + Math.random() * 80, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.025);
    } catch (e) {}
  }

  /**
   * Radar Anomaly Ping
   */
  public playRadarPing() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2093, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.42);
    } catch (e) {}
  }

  /**
   * Action Game: High-tech Plasma Laser Pew (Rate limited)
   */
  public playLaserPew() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;
    if (now - this.lastLaserTime < 0.08) return;
    this.lastLaserTime = now;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } catch (e) {}
  }

  /**
   * Action Game: Armor Damage / Shield Impact Blip
   */
  public playDamageBlip() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;
    if (now - this.lastDamageTime < 0.08) return;
    this.lastDamageTime = now;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.07);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  /**
   * Action Game: Power-Up / Kill Combo Chime
   */
  public playPowerUpChime() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(659.25, now + 0.06);
      osc.frequency.setValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.23);
    } catch (e) {}
  }

  /**
   * Action Game: Deep Explosion Boom
   */
  public playExplosionBoom() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;
    if (now - this.lastExplosionTime < 0.12) return;
    this.lastExplosionTime = now;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.35);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } catch (e) {}
  }

  /**
   * System Power On / Boot Sequence
   */
  public playPowerToggle(turningOn: boolean) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';

      if (turningOn) {
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.02, now + 0.4);
      } else {
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.42);
    } catch (e) {}
  }

  /**
   * Trillion-Parsec Macro Cosmic Sonar Ping (Deep Sub-Bass + High Reverb Harmonic)
   */
  public playCosmicSonar() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime;
      // Sub-bass carrier
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(65, now);
      osc1.frequency.exponentialRampToValueAtTime(32, now + 0.9);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.92);

      // High crystal cosmic overtone
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(3135.96, now + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(1567.98, now + 0.6);
      gain2.gain.setValueAtTime(0.08, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.62);
    } catch (e) {}
  }

  /**
   * Tachyonic Spectrogram Scan Sweep
   */
  public playTachyonicScan() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.linearRampToValueAtTime(1800, now + 0.35);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } catch (e) {}
  }

  /**
   * Quantum Warp / Hyper-Parsec Vector Collapse
   */
  public playQuantumWarp() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.62);
    } catch (e) {}
  }

  /**
   * Hyper-Horizon Anomaly Alert
   */
  public playMacroAnomalyAlert() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.12, 0.24].forEach((offset, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880 + idx * 220, now + offset);
        gain.gain.setValueAtTime(0.1, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.11);
      });
    } catch (e) {}
  }

  /**
   * Real-time Alert Ticker Notification Chime
   */
  public playAlertChime(severity: 'CRITICAL' | 'WARN' | 'INFO' | 'SUCCESS' | 'OMEGA' = 'INFO') {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime;
      if (severity === 'CRITICAL' || severity === 'OMEGA') {
        // High urgency two-tone alert
        [0, 0.08, 0.16].forEach((offset, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(idx % 2 === 0 ? 1174.66 : 1480.0, now + offset);
          gain.gain.setValueAtTime(0.12, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.08);
        });
      } else if (severity === 'WARN') {
        // Warning chime
        [0, 0.09].forEach((offset, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(783.99 + idx * 196, now + offset);
          gain.gain.setValueAtTime(0.1, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.09);
        });
      } else if (severity === 'SUCCESS') {
        // Soft positive chime
        [0, 0.08].forEach((offset, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880 + idx * 440, now + offset);
          gain.gain.setValueAtTime(0.09, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.13);
        });
      } else {
        // Subtle futuristic HUD ping
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.5, now);
        osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      }
    } catch (e) {}
  }

  /**
   * Battery Power State Shift or Low Power Alert Sound
   */
  public playBatteryAlert(isLow: boolean = false) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isLow ? 'sawtooth' : 'triangle';
      if (isLow) {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      } else {
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      }
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }
}

export const sounds = new CyberSoundEngine();
