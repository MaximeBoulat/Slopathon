import { GameState } from '/Slopathon/src/Common/Models/GameState';
import {
    PlayerEntity,
    DebrisEntity,
    HaloEntity,
    ParticleEntity,
    StarEntity,
} from '/Slopathon/src/Common/Models/Entities';

export interface PointerState {
    x: number;
    y: number;
    down: boolean;
}

const MESSAGES = [
    'ANGELIC SPEED',
    'BEEP BEEP AHHH',
    'THE CAN HAS WINGS',
    'RED FUEL FRENZY',
    'SPACE TAXI FROM HELL',
    'BLESSED AND FRAGILE',
    'THIS IS PROBABLY OSHA-ILLEGAL',
];

function rand(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export class GameService {
    private spawnTimer: number = 0;

    constructor(
        private player: PlayerEntity,
        private debris: DebrisEntity[],
        private halos: HaloEntity[],
        private particles: ParticleEntity[],
        private stars: StarEntity[]
    ) {}

    spawnStarField(w: number, h: number): void {
        this.stars.length = 0;
        for (let i = 0; i < 160; i++) {
            this.stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                z: rand(0.2, 1),
                size: rand(0.8, 2.8),
                hue: Math.random() < 0.15 ? 18 : 0,
            });
        }
    }

    startGame(w: number, h: number): void {
        this.debris.length = 0;
        this.halos.length = 0;
        this.particles.length = 0;
        this.spawnTimer = 0;
        this.player.x = w * 0.45;
        this.player.y = h * 0.6;
        this.player.vx = 0;
        this.player.vy = 0;
    }

    burst(x: number, y: number, amount: number, colorA: string, colorB: string, power: number): void {
        this.addParticles(x, y, amount, colorA, colorB, power);
    }

    update(
        dt: number,
        state: GameState,
        keys: Set<string>,
        pointer: PointerState,
        onMessage: (text: string, duration: number) => void,
        onGameOver: () => void
    ): void {
        state.time += dt;
        state.chaos = clamp(state.score * 0.02 + state.time * 0.015, 0, 10);

        if (state.shake > 0) {
            state.shake = Math.max(0, state.shake - dt * 18);
        }

        if (state.glitchTimer > 0) {
            state.glitchTimer -= dt;
        }

        this.updatePlayer(dt, state, keys, pointer);

        if (state.phase === 'playing') {
            this.updateSpawning(dt, state);
        }

        this.updateHalos(dt, state, onMessage);
        this.updateDebris(dt, state, onMessage, onGameOver);
        this.updateParticles(dt);
        this.updateStars(dt, state);

        if (Math.random() < 0.008 + state.chaos * 0.001) {
            state.glitchTimer = 0.15;
            state.shake = Math.min(18, state.shake + 1.5);
        }

        if (state.phase === 'playing') {
            state.score += dt * (1.5 + state.chaos * 0.4);
        }
    }

    private updatePlayer(dt: number, state: GameState, keys: Set<string>, pointer: PointerState): void {
        let ax = 0;
        let ay = 0;

        if (keys.has('ArrowLeft') || keys.has('KeyA')) { ax -= 1; }
        if (keys.has('ArrowRight') || keys.has('KeyD')) { ax += 1; }
        if (keys.has('ArrowUp') || keys.has('KeyW')) { ay -= 1; }
        if (keys.has('ArrowDown') || keys.has('KeyS')) { ay += 1; }

        if (!ax && !ay && pointer.down) {
            const dx = pointer.x - this.player.x;
            const dy = pointer.y - this.player.y;
            const dist = Math.hypot(dx, dy) || 1;
            ax = dx / dist;
            ay = dy / dist;
        }

        const targetSpeed = state.phase === 'playing' ? 380 + state.chaos * 50 : 0;
        const accel = 1240;

        this.player.vx += ax * accel * dt;
        this.player.vy += ay * accel * dt;

        const drag = Math.pow(0.0006, dt);
        this.player.vx *= drag;
        this.player.vy *= drag;

        const speed = Math.hypot(this.player.vx, this.player.vy);
        if (speed > targetSpeed) {
            const ratio = targetSpeed / speed;
            this.player.vx *= ratio;
            this.player.vy *= ratio;
        }

        this.player.x += this.player.vx * dt;
        this.player.y += this.player.vy * dt;
        this.player.x = clamp(this.player.x, 36, state.w - 36);
        this.player.y = clamp(this.player.y, 48, state.h - 36);
        this.player.tilt = clamp(this.player.vx * 0.0025, -0.5, 0.5);
        this.player.blink -= dt;
    }

    private updateSpawning(dt: number, state: GameState): void {
        this.spawnTimer -= dt;

        if (this.spawnTimer <= 0) {
            this.spawnHazard(state);
            if (Math.random() < 0.55) {
                this.spawnHazard(state);
            }
            this.spawnTimer = Math.max(0.12, 0.62 - state.chaos * 0.03);
        }

        if (Math.random() < 0.02 + state.chaos * 0.003) {
            this.spawnHalo(state);
        }
    }

    private updateHalos(dt: number, state: GameState, onMessage: (text: string, duration: number) => void): void {
        for (let i = this.halos.length - 1; i >= 0; i--) {
            const halo = this.halos[i];
            halo.pulse += dt * 6;

            if (Math.hypot(halo.x - this.player.x, halo.y - this.player.y) < halo.size + this.player.radius) {
                state.score += 10;
                state.shake = Math.min(18, state.shake + 1.8);
                this.addParticles(halo.x, halo.y, 30, '#fff2a1', '#87ffb5', 0.7);
                this.halos.splice(i, 1);

                if (Math.random() < 0.45) {
                    onMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)], 800);
                }
            }
        }
    }

    private updateDebris(
        dt: number,
        state: GameState,
        onMessage: (text: string, duration: number) => void,
        onGameOver: () => void
    ): void {
        let rockCollisionIndex = -1;

        for (let i = this.debris.length - 1; i >= 0; i--) {
            const d = this.debris[i];
            d.x += d.vx * dt;
            d.y += d.vy * dt;
            d.angle += d.spin * dt;
            d.wobble += dt * 5;

            if (Math.random() < 0.12) {
                this.particles.push({
                    x: d.x,
                    y: d.y,
                    vx: rand(-20, 20),
                    vy: rand(-20, 20),
                    life: rand(0.18, 0.45),
                    maxLife: 1,
                    size: rand(1, 3),
                    color: '#6d7a8a',
                    spin: rand(-4, 4),
                });
            }

            const pad = d.size + 90;
            if (d.x < -pad || d.x > state.w + pad || d.y < -pad || d.y > state.h + pad) {
                this.debris.splice(i, 1);
            } else if (d.kind === 'satellite') {
                const dist = Math.hypot(d.x - this.player.x, d.y - this.player.y);
                if (dist < d.size + this.player.radius + 8) {
                    state.score += 15;
                    state.shake = Math.min(18, state.shake + 1.8);
                    this.addParticles(d.x, d.y, 30, '#ffd24a', '#97dfff', 0.7);
                    this.debris.splice(i, 1);
                    if (Math.random() < 0.45) {
                        onMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)], 800);
                    }
                }
            } else {
                const dist = Math.hypot(d.x - this.player.x, d.y - this.player.y);
                if (dist < d.size + this.player.radius - 4 && rockCollisionIndex === -1) {
                    rockCollisionIndex = i;
                }
            }
        }

        if (rockCollisionIndex !== -1) {
            this.debris.splice(rockCollisionIndex, 1);
            state.hearts -= 1;
            state.score = Math.max(0, state.score - 4);
            this.addParticles(this.player.x, this.player.y, 50, '#ff6b6b', '#ffd24a', 1.1);
            state.glitchTimer = 0.14;
            state.shake = Math.min(28, state.shake + 1);

            if (state.hearts <= 0) {
                onGameOver();
            } else {
                onMessage('OW\nTHE CAN GOT BONKED', 700);
            }
        }
    }

    private updateParticles(dt: number): void {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= Math.pow(0.12, dt);
            p.vy *= Math.pow(0.12, dt);
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    private updateStars(dt: number, state: GameState): void {
        for (const s of this.stars) {
            s.x -= (12 + state.chaos * 14) * s.z * dt;
            if (s.x < -10) {
                s.x = state.w + 10;
                s.y = Math.random() * state.h;
            }
        }
    }

    private addParticles(x: number, y: number, count: number, colorA: string, colorB: string, power: number): void {
        for (let i = 0; i < count; i++) {
            const angle = rand(0, Math.PI * 2);
            const speed = rand(50, 420) * power;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: rand(0.25, 0.9),
                maxLife: 1,
                size: rand(1.5, 5.5),
                color: Math.random() < 0.5 ? colorA : colorB,
                spin: rand(-8, 8),
            });
        }
    }

    private spawnHazard(state: GameState): void {
        const side = Math.floor(rand(0, 4));
        const size = rand(18, 54);
        const speed = rand(90, 270) + state.chaos * 110;
        let x = 0;
        let y = 0;
        let vx = 0;
        let vy = 0;

        if (side === 0) {
            x = rand(0, state.w);
            y = -size - 10;
            vx = rand(-0.35, 0.35) * speed;
            vy = speed;
        } else if (side === 1) {
            x = state.w + size + 10;
            y = rand(0, state.h);
            vx = -speed;
            vy = rand(-0.35, 0.35) * speed;
        } else if (side === 2) {
            x = rand(0, state.w);
            y = state.h + size + 10;
            vx = rand(-0.35, 0.35) * speed;
            vy = -speed;
        } else {
            x = -size - 10;
            y = rand(0, state.h);
            vx = speed;
            vy = rand(-0.35, 0.35) * speed;
        }

        this.debris.push({
            x,
            y,
            vx,
            vy,
            size,
            spin: rand(-5, 5),
            angle: rand(0, Math.PI * 2),
            wobble: rand(0, Math.PI * 2),
            kind: Math.random() < 0.35 ? 'satellite' : 'rock',
        });
    }

    private spawnHalo(state: GameState): void {
        this.halos.push({
            x: rand(60, state.w - 60),
            y: rand(60, state.h - 140),
            size: rand(14, 22),
            pulse: rand(0, Math.PI * 2),
        });
    }
}
