"use client";

/**
 * Programmatic sound effects using Web Audio API.
 * No external files required.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;

    // Generate white noise buffer for realistic friction/clap texture
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * 0.4; // 0.4 seconds
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    // Create bandpass filter centered around natural handclap frequency (1200Hz)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.Q.setValueAtTime(2.5, ctx.currentTime);

    const now = ctx.currentTime;
    
    // Helper function to trigger a single noise burst with rapid linear attack and exponential decay
    const playBurst = (startTime: number, duration: number, startVolume: number) => {
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, startTime);
      gainNode.gain.linearRampToValueAtTime(startVolume, startTime + 0.003);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      noiseSource.connect(gainNode);
      gainNode.connect(filter);
      
      noiseSource.start(startTime);
      noiseSource.stop(startTime + duration);
    };

    // Synthesize the acoustic footprint of a handclap: 3 rapid pre-echo transients followed by main impact
    playBurst(now, 0.015, 0.18);
    playBurst(now + 0.010, 0.015, 0.14);
    playBurst(now + 0.020, 0.015, 0.10);
    playBurst(now + 0.030, 0.22, 0.22); // Main decay burst

    // Synthesize a warm, low-frequency triangle thump to mimic the physical impact of the palms
    const thumpOsc = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    
    thumpOsc.type = 'triangle';
    thumpOsc.frequency.setValueAtTime(160, now + 0.030);
    thumpOsc.frequency.exponentialRampToValueAtTime(50, now + 0.030 + 0.07);
    
    thumpGain.gain.setValueAtTime(0.12, now + 0.030);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.030 + 0.07);
    
    thumpOsc.connect(thumpGain);
    thumpGain.connect(ctx.destination);
    
    thumpOsc.start(now + 0.030);
    thumpOsc.stop(now + 0.030 + 0.07);

    // Connect the bandpass filtered noise to the destination
    filter.connect(ctx.destination);
  }

  playError() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
    osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2); // A2

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  playPop() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }
}

export const sfx = new SoundEngine();
