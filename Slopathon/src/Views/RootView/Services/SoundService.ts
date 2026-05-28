export class SoundService {
    private ctx: AudioContext | null = null;

    private getCtx(): AudioContext {
        if (!this.ctx) {
            this.ctx = new AudioContext();
        }
        return this.ctx;
    }

    private noise(ctx: AudioContext, duration: number, gain: number, bandLow: number, bandHigh: number): void {
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = (bandLow + bandHigh) / 2;
        filter.Q.value = 0.6;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(gain, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start();
        source.stop(ctx.currentTime + duration);
    }

    private tone(ctx: AudioContext, freq: number, type: OscillatorType, duration: number, gain: number, detune: number = 0): void {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.detune.setValueAtTime(detune, ctx.currentTime);
        gainNode.gain.setValueAtTime(gain, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    }

    playCollectCan(): void {
        const ctx = this.getCtx();
        this.noise(ctx, 0.09, 0.35, 2000, 8000);
        this.tone(ctx, 880, 'sine', 0.18, 0.22);
        this.tone(ctx, 1320, 'sine', 0.12, 0.14);

        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);
        g.gain.setValueAtTime(0.18, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
    }

    playCollectHalo(): void {
        const ctx = this.getCtx();
        const freqs = [523, 659, 784, 1047];
        freqs.forEach((f, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.055);
            g.gain.setValueAtTime(0, ctx.currentTime + i * 0.055);
            g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.055 + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.055 + 0.28);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.055);
            osc.stop(ctx.currentTime + i * 0.055 + 0.3);
        });
    }

    playRockHit(): void {
        const ctx = this.getCtx();
        this.noise(ctx, 0.22, 0.7, 60, 400);
        this.noise(ctx, 0.12, 0.4, 400, 1200);

        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.22);
        osc.detune.setValueAtTime(0, ctx.currentTime);
        osc.detune.linearRampToValueAtTime(1200, ctx.currentTime + 0.22);
        g.gain.setValueAtTime(0.5, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
    }

    playGameOver(): void {
        const ctx = this.getCtx();
        const melody = [
            { f: 523, t: 0 },
            { f: 494, t: 0.18 },
            { f: 440, t: 0.36 },
            { f: 349, t: 0.54 },
        ];

        melody.forEach(({ f, t }) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, ctx.currentTime + t);
            g.gain.setValueAtTime(0.28, ctx.currentTime + t);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.32);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(ctx.currentTime + t);
            osc.stop(ctx.currentTime + t + 0.35);
        });

        this.noise(ctx, 0.6, 0.5, 50, 300);
    }

    resume(): void {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
}
