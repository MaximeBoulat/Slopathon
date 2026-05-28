export class SoundService {
    private ctx: AudioContext | null = null;
    private ambientNodes: AudioScheduledSourceNode[] = [];
    private ambientInterval: number | null = null;

    private getCtx(): AudioContext {
        if (!this.ctx) {
            this.ctx = new AudioContext();
        }
        return this.ctx;
    }

    private distort(ctx: AudioContext, amount: number): WaveShaperNode {
        const shaper = ctx.createWaveShaper();
        const samples = 256;
        const curve = new Float32Array(samples);
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
        }
        shaper.curve = curve;
        shaper.oversample = '4x';
        return shaper;
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
        filter.Q.value = 0.4;

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

        // Loud fizz explosion
        this.noise(ctx, 0.18, 1.8, 1800, 12000);
        this.noise(ctx, 0.09, 1.2, 400, 3000);

        // Screaming pitch sweep up
        const sweep = ctx.createOscillator();
        const sweepGain = ctx.createGain();
        const dist = this.distort(ctx, 300);
        sweep.type = 'sawtooth';
        sweep.frequency.setValueAtTime(120, ctx.currentTime);
        sweep.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.14);
        sweepGain.gain.setValueAtTime(1.1, ctx.currentTime);
        sweepGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
        sweep.connect(dist);
        dist.connect(sweepGain);
        sweepGain.connect(ctx.destination);
        sweep.start();
        sweep.stop(ctx.currentTime + 0.22);

        // Punchy double chime
        [880, 1760, 2640].forEach((f, i) => {
            this.tone(ctx, f, 'square', 0.3 - i * 0.06, 0.7 - i * 0.15);
        });
    }

    playCollectHalo(): void {
        const ctx = this.getCtx();

        // Blasting angelic chord stab
        const freqs = [523, 659, 784, 1047, 1319];
        freqs.forEach((f, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = i % 2 === 0 ? 'square' : 'sawtooth';
            osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.03);
            osc.detune.setValueAtTime(Math.random() * 30 - 15, ctx.currentTime);
            g.gain.setValueAtTime(0, ctx.currentTime + i * 0.03);
            g.gain.linearRampToValueAtTime(0.55, ctx.currentTime + i * 0.03 + 0.015);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.03 + 0.4);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.03);
            osc.stop(ctx.currentTime + i * 0.03 + 0.45);
        });

        // Noise burst up top
        this.noise(ctx, 0.12, 1.0, 3000, 10000);
    }

    playRockHit(): void {
        const ctx = this.getCtx();

        // Massive thud
        this.noise(ctx, 0.4, 2.5, 40, 300);
        this.noise(ctx, 0.25, 1.8, 300, 2000);
        this.noise(ctx, 0.12, 1.2, 2000, 8000);

        // Distorted sub crash
        const osc = ctx.createOscillator();
        const dist = this.distort(ctx, 500);
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.35);
        osc.detune.linearRampToValueAtTime(2400, ctx.currentTime + 0.35);
        g.gain.setValueAtTime(1.4, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
        osc.connect(dist);
        dist.connect(g);
        g.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);

        // Screech layer
        const screech = ctx.createOscillator();
        const sg = ctx.createGain();
        screech.type = 'square';
        screech.frequency.setValueAtTime(900, ctx.currentTime);
        screech.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.18);
        sg.gain.setValueAtTime(0.8, ctx.currentTime);
        sg.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
        screech.connect(sg);
        sg.connect(ctx.destination);
        screech.start();
        screech.stop(ctx.currentTime + 0.18);
    }

    playGameOver(): void {
        const ctx = this.getCtx();

        const melody = [
            { f: 523, t: 0 },
            { f: 494, t: 0.22 },
            { f: 440, t: 0.44 },
            { f: 349, t: 0.66 },
        ];

        melody.forEach(({ f, t }) => {
            const osc = ctx.createOscillator();
            const dist = this.distort(ctx, 400);
            const g = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, ctx.currentTime + t);
            osc.detune.setValueAtTime(-200, ctx.currentTime + t);
            g.gain.setValueAtTime(1.4, ctx.currentTime + t);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.38);
            osc.connect(dist);
            dist.connect(g);
            g.connect(ctx.destination);
            osc.start(ctx.currentTime + t);
            osc.stop(ctx.currentTime + t + 0.4);

            // Harmony a fifth below, also distorted
            const low = ctx.createOscillator();
            const lg = ctx.createGain();
            low.type = 'square';
            low.frequency.setValueAtTime(f * 0.666, ctx.currentTime + t);
            lg.gain.setValueAtTime(0.9, ctx.currentTime + t);
            lg.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.38);
            low.connect(lg);
            lg.connect(ctx.destination);
            low.start(ctx.currentTime + t);
            low.stop(ctx.currentTime + t + 0.4);
        });

        // Prolonged earth-shaking rumble
        this.noise(ctx, 1.2, 3.0, 30, 180);
        this.noise(ctx, 0.5, 2.0, 800, 4000);
    }

    startAmbient(): void {
        const ctx = this.getCtx();
        this.stopAmbient();

        // Looping white noise through resonant LFO-swept bandpass
        const bufferSize = ctx.sampleRate * 4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 500;
        noiseFilter.Q.value = 10;

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.35 + Math.random() * 0.25;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 700;
        lfo.connect(lfoGain);
        lfoGain.connect(noiseFilter.frequency);

        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.14;

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noiseSource.start();
        lfo.start();
        this.ambientNodes.push(noiseSource, lfo);

        // Second noise layer - high crackle
        const crackleBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const crackleData = crackleBuffer.getChannelData(0);
        for (let i = 0; i < crackleData.length; i++) {
            crackleData[i] = Math.random() < 0.04 ? (Math.random() * 2 - 1) * 6 : 0;
        }
        const crackleSource = ctx.createBufferSource();
        crackleSource.buffer = crackleBuffer;
        crackleSource.loop = true;
        const crackleFilter = ctx.createBiquadFilter();
        crackleFilter.type = 'highpass';
        crackleFilter.frequency.value = 2000;
        const crackleGain = ctx.createGain();
        crackleGain.gain.value = 0.09;
        crackleSource.connect(crackleFilter);
        crackleFilter.connect(crackleGain);
        crackleGain.connect(ctx.destination);
        crackleSource.start();
        this.ambientNodes.push(crackleSource);

        // Garbled square oscillator with random pitch jumps
        const glitchOsc = ctx.createOscillator();
        glitchOsc.type = 'square';
        const glitchDist = this.distort(ctx, 200);
        const glitchGain = ctx.createGain();
        glitchGain.gain.value = 0.07;
        glitchOsc.connect(glitchDist);
        glitchDist.connect(glitchGain);
        glitchGain.connect(ctx.destination);
        glitchOsc.start();
        this.ambientNodes.push(glitchOsc);

        // Second detuned sawtooth running alongside
        const sawOsc = ctx.createOscillator();
        sawOsc.type = 'sawtooth';
        sawOsc.detune.value = 18;
        const sawGain = ctx.createGain();
        sawGain.gain.value = 0.045;
        sawOsc.connect(sawGain);
        sawGain.connect(ctx.destination);
        sawOsc.start();
        this.ambientNodes.push(sawOsc);

        // Sub drone
        const subOsc = ctx.createOscillator();
        subOsc.type = 'sawtooth';
        subOsc.frequency.value = 36;
        const subGain = ctx.createGain();
        subGain.gain.value = 0.09;
        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.start();
        this.ambientNodes.push(subOsc);

        this.scheduleGlitches(glitchOsc, sawOsc, ctx);
        this.ambientInterval = window.setInterval(() => {
            this.scheduleGlitches(glitchOsc, sawOsc, ctx);
        }, 25000);
    }

    private scheduleGlitches(osc: OscillatorNode, saw: OscillatorNode, ctx: AudioContext): void {
        const freqs = [37, 49, 55, 73, 82, 110, 146, 165, 220, 28, 41];
        let t = ctx.currentTime + 0.05;
        while (t < ctx.currentTime + 30) {
            const f = freqs[Math.floor(Math.random() * freqs.length)];
            osc.frequency.setValueAtTime(f, t);
            saw.frequency.setValueAtTime(f * 1.013, t);
            t += 0.04 + Math.random() * 0.55;
        }
    }

    stopAmbient(): void {
        for (const node of this.ambientNodes) {
            node.stop();
            node.disconnect();
        }
        this.ambientNodes = [];
        if (this.ambientInterval !== null) {
            clearInterval(this.ambientInterval);
            this.ambientInterval = null;
        }
    }

    resume(): void {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
}
