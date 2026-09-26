/**
 * Synthesizes realistic heavy machinery diesel engine sound using Web Audio API.
 * Provides reliable, zero-latency engine idle & acceleration simulation.
 */

class DieselEngineSoundEngine {
  private audioCtx: AudioContext | null = null;
  private isRunning: boolean = false;
  private masterGain: GainNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;

  public init() {
    try {
      if (this.audioCtx && this.audioCtx.state !== 'closed') return;
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    } catch (e) {
      console.warn('AudioContext initialization failed or prevented:', e);
      this.audioCtx = null;
    }
  }

  public async resume(): Promise<boolean> {
    try {
      this.init();
      if (!this.audioCtx) return false;
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
      return this.audioCtx.state === 'running';
    } catch (err) {
      console.warn('AudioContext resume was prevented or encountered an error:', err);
      return false;
    }
  }

  public async start(type: 'excavator' | 'backhoe' | 'tractor' | 'loader' = 'excavator', volume: number = 0.25): Promise<boolean> {
    try {
      this.init();
      if (!this.audioCtx) return false;

      // Handle suspended state safely without unhandled rejections
      if (this.audioCtx.state === 'suspended') {
        try {
          await this.audioCtx.resume();
        } catch (resumeErr) {
          console.warn('AudioContext resume prevented by autoplay policy:', resumeErr);
          return false;
        }
      }

      if (this.audioCtx.state === 'closed') {
        this.audioCtx = null;
        this.init();
        if (!this.audioCtx) return false;
      }

      this.stop(); // Stop any previous instance

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);

      // Low pass filter to simulate heavy diesel block resonance
      this.filter = this.audioCtx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(type === 'tractor' ? 240 : 180, this.audioCtx.currentTime);
      this.filter.Q.setValueAtTime(4, this.audioCtx.currentTime);
      this.filter.connect(this.masterGain);

      // Base diesel pulse frequencies (idle rpm ~750 RPM = ~12.5 Hz base firing rate, harmonic richness)
      const baseFreq = type === 'tractor' ? 28 : type === 'loader' ? 22 : 24;

      this.osc1 = this.audioCtx.createOscillator();
      this.osc1.type = 'sawtooth';
      this.osc1.frequency.setValueAtTime(baseFreq, this.audioCtx.currentTime);

      this.osc2 = this.audioCtx.createOscillator();
      this.osc2.type = 'triangle';
      this.osc2.frequency.setValueAtTime(baseFreq * 2, this.audioCtx.currentTime);

      this.subOsc = this.audioCtx.createOscillator();
      this.subOsc.type = 'sine';
      this.subOsc.frequency.setValueAtTime(baseFreq / 2, this.audioCtx.currentTime);

      const oscGain1 = this.audioCtx.createGain();
      oscGain1.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
      this.osc1.connect(oscGain1);
      oscGain1.connect(this.filter);

      const oscGain2 = this.audioCtx.createGain();
      oscGain2.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      this.osc2.connect(oscGain2);
      oscGain2.connect(this.filter);

      const subGain = this.audioCtx.createGain();
      subGain.gain.setValueAtTime(0.6, this.audioCtx.currentTime);
      this.subOsc.connect(subGain);
      subGain.connect(this.filter);

      // Turbo & intake air noise (subtle filtered white noise)
      const bufferSize = this.audioCtx.sampleRate * 2;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.noiseNode = this.audioCtx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      const noiseFilter = this.audioCtx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1400, this.audioCtx.currentTime);
      noiseFilter.Q.setValueAtTime(3, this.audioCtx.currentTime);

      this.noiseGain = this.audioCtx.createGain();
      this.noiseGain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);

      this.noiseNode.connect(noiseFilter);
      noiseFilter.connect(this.noiseGain);
      this.noiseGain.connect(this.masterGain);

      this.osc1.start();
      this.osc2.start();
      this.subOsc.start();
      this.noiseNode.start();

      this.isRunning = true;
      return true;
    } catch (e) {
      console.warn('Could not start diesel audio synthesizer:', e);
      this.isRunning = false;
      return false;
    }
  }

  public stop() {
    try {
      if (this.osc1) {
        this.osc1.stop();
        this.osc1.disconnect();
        this.osc1 = null;
      }
      if (this.osc2) {
        this.osc2.stop();
        this.osc2.disconnect();
        this.osc2 = null;
      }
      if (this.subOsc) {
        this.subOsc.stop();
        this.subOsc.disconnect();
        this.subOsc = null;
      }
      if (this.noiseNode) {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
        this.noiseNode = null;
      }
      if (this.masterGain) {
        this.masterGain.disconnect();
        this.masterGain = null;
      }
      this.isRunning = false;
    } catch {
      // Ignored cleanup errors
    }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.audioCtx.currentTime);
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }
}

export const dieselAudio = new DieselEngineSoundEngine();
