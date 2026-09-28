/**
 * TMD Dominicana - Industrial Cabin Telemetry Audio Synthesizer (Task #48)
 * Synthesizes discrete, high-fidelity heavy machinery cabin alerts (JCB LiveLink / CAT Advisor style)
 * via Web Audio API without requiring bulky external MP3/WAV audio files.
 */

class IndustrialCabinAudioSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tmd-cabin-audio-muted');
        this.isMuted = saved === 'true';
      } catch {
        this.isMuted = false;
      }
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      } catch (e) {
        console.warn('TMD Cabin Audio: Web Audio API not supported or restricted', e);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('tmd-cabin-audio-muted', String(muted));
    } catch {
      // ignore storage restriction
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Play an industrial cabin alert synthesized via oscillators
   */
  public async playAlarm(severity: 'critical' | 'warning' | 'chime'): Promise<void> {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const now = ctx.currentTime;

      if (severity === 'critical') {
        // Urgent 3-pulse cabin buzzer (high coolant temp, oil pressure, high DTC)
        for (let i = 0; i < 3; i++) {
          const startTime = now + (i * 0.16);
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(1760, startTime); // A6
          osc.frequency.exponentialRampToValueAtTime(1200, startTime + 0.1);

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.11);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.12);
        }
      } else if (severity === 'warning') {
        // Double alert beep (geofence warning, low DEF, scheduled service)
        for (let i = 0; i < 2; i++) {
          const startTime = now + (i * 0.14);
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(987.77, startTime); // B5
          osc.frequency.setValueAtTime(880, startTime + 0.05);

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.09);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.1);
        }
      } else {
        // Confirmation chime (ping, horn test, immobilizer acknowledged)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.26);
      }
    } catch (e) {
      console.warn('TMD Cabin Audio playback error:', e);
    }
  }
}

export const industrialCabinAudio = new IndustrialCabinAudioSystem();
