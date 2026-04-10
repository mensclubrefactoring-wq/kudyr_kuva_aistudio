class SoundManager {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // Simple synthesized scary sound
  playScaryAmbient() {
    this.init();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(40, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 2);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 2);
  }

  // Synthesized "laugh" (rapid pitch changes)
  playLaugh() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    for (let i = 0; i < 10; i++) {
      osc.frequency.setValueAtTime(200 + Math.random() * 400, now + i * 0.1);
    }

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + 1);
  }

  playAlert() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  // Simple synthesized background drone
  private musicGain: GainNode | null = null;
  playBackgroundMusic() {
    this.init();
    if (!this.ctx || this.musicGain) return;

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    this.musicGain.connect(this.ctx.destination);

    const playDrone = (freq: number, startTime: number) => {
      if (!this.ctx || !this.musicGain) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      g.gain.setValueAtTime(0, startTime);
      g.gain.linearRampToValueAtTime(0.5, startTime + 2);
      g.gain.linearRampToValueAtTime(0, startTime + 4);
      
      osc.connect(g);
      g.connect(this.musicGain);
      
      osc.start(startTime);
      osc.stop(startTime + 4);
    };

    const loop = () => {
      if (!this.musicGain) return;
      const now = this.ctx!.currentTime;
      playDrone(60, now);
      playDrone(62, now + 2);
      setTimeout(loop, 4000);
    };
    loop();
  }
}

export const soundManager = new SoundManager();
