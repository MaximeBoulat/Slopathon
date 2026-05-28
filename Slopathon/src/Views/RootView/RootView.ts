import { GameState } from '/Slopathon/src/Common/Models/GameState';
import {
    PlayerEntity,
    DebrisEntity,
    HaloEntity,
    ParticleEntity,
    StarEntity,
} from '/Slopathon/src/Common/Models/Entities';
import { GameService, PointerState } from './Services/GameService';
import { SoundService } from './Services/SoundService';
import { BackgroundView } from './Children/BackgroundView/BackgroundView';
import { PlayerView } from './Children/PlayerView/PlayerView';
import { EntityView } from './Children/EntityView/EntityView';
import '/Slopathon/src/Common/CSS/Global.css';
import './RootView.css';

function rand(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

export class RootView {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private statsEl: HTMLElement;
    private toastEl: HTMLElement;
    private state: GameState;
    private player: PlayerEntity;
    private debris: DebrisEntity[];
    private halos: HaloEntity[];
    private particles: ParticleEntity[];
    private stars: StarEntity[];
    private keys: Set<string>;
    private pointer: PointerState;
    private last: number;
    private messageTimer: number;
    private gameService: GameService;
    private soundService: SoundService;
    private backgroundView: BackgroundView;
    private playerView: PlayerView;
    private entityView: EntityView;
    private boundLoop: FrameRequestCallback;

    constructor() {
        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d')!;

        const hud = document.createElement('div');
        hud.className = 'hud';

        const titleEl = document.createElement('div');
        titleEl.className = 'title';
        titleEl.textContent = 'RED ORBIT ASTRONAUT';

        const subtitleEl = document.createElement('div');
        subtitleEl.className = 'subtitle';
        subtitleEl.textContent = 'Angel wings, red fuel, bad decisions, zero dignity.';

        const statsEl = document.createElement('div');
        statsEl.className = 'stats';
        statsEl.innerHTML = 'Score: 0<br />Chaos: 0%<br />Hearts: 3';

        const toastEl = document.createElement('div');
        toastEl.className = 'toast';

        const bottomEl = document.createElement('div');
        bottomEl.className = 'bottom';
        bottomEl.textContent = 'Move with WASD or arrow keys. Collect halos & satellites. Avoid asteroids. The screen gets worse on purpose.';

        hud.appendChild(titleEl);
        hud.appendChild(subtitleEl);
        hud.appendChild(statsEl);
        hud.appendChild(toastEl);
        hud.appendChild(bottomEl);
        document.body.appendChild(hud);

        this.debris = [];
        this.halos = [];
        this.particles = [];
        this.stars = [];
        this.player = { x: 0, y: 0, vx: 0, vy: 0, radius: 24, tilt: 0, blink: 0 };

        this.state = {
            phase: 'title',
            score: 0,
            hearts: 3,
            chaos: 0,
            time: 0,
            shake: 0,
            glitchTimer: 0,
            w: 0,
            h: 0,
            dpr: 1,
        };

        this.keys = new Set();
        this.pointer = { x: 0, y: 0, down: false };
        this.last = performance.now();
        this.messageTimer = 0;

        this.canvas = canvas;
        this.ctx = ctx;
        this.statsEl = statsEl;
        this.toastEl = toastEl;

        this.backgroundView = new BackgroundView();
        this.playerView = new PlayerView();
        this.entityView = new EntityView();
        this.soundService = new SoundService();
        this.gameService = new GameService(
            this.player,
            this.debris,
            this.halos,
            this.particles,
            this.stars,
            this.soundService
        );

        this.boundLoop = (now: DOMHighResTimeStamp) => { this.loop(now); };

        this.configureControls();
        this.resize();
        this.gameService.spawnStarField(this.state.w, this.state.h);
        this.showMessage('PRESS SPACE\nOR CLICK TO BEGIN', 999999);
        window.requestAnimationFrame(this.boundLoop);
    }

    private configureControls(): void {
        window.addEventListener('resize', () => {
            this.resize();
            this.gameService.spawnStarField(this.state.w, this.state.h);
        });

        window.addEventListener('keydown', (event) => {
            this.keys.add(event.code);
            this.soundService.resume();

            if ((event.code === 'Space' || event.code === 'Enter') && this.state.phase !== 'playing') {
                this.startGame();
                event.preventDefault();
            }
        });

        window.addEventListener('keyup', (event) => {
            this.keys.delete(event.code);
        });

        window.addEventListener('pointermove', (event) => {
            this.pointer.x = event.clientX;
            this.pointer.y = event.clientY;
        });

        window.addEventListener('pointerdown', (event) => {
            this.pointer.down = true;
            this.pointer.x = event.clientX;
            this.pointer.y = event.clientY;
            this.soundService.resume();

            if (this.state.phase !== 'playing') {
                this.startGame();
            }
        });

        window.addEventListener('pointerup', () => {
            this.pointer.down = false;
        });
    }

    private resize(): void {
        this.state.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        this.state.w = window.innerWidth;
        this.state.h = window.innerHeight;
        this.canvas.width = Math.floor(this.state.w * this.state.dpr);
        this.canvas.height = Math.floor(this.state.h * this.state.dpr);
        this.canvas.style.width = this.state.w + 'px';
        this.canvas.style.height = this.state.h + 'px';
        this.ctx.setTransform(this.state.dpr, 0, 0, this.state.dpr, 0, 0);

        if (this.state.phase !== 'playing') {
            this.player.x = this.state.w * 0.5;
            this.player.y = this.state.h * 0.6;
        }
    }

    private startGame(): void {
        this.state.phase = 'playing';
        this.state.score = 0;
        this.state.hearts = 3;
        this.state.chaos = 0;
        this.state.shake = 0;
        this.state.time = 0;
        this.state.glitchTimer = 0;
        this.gameService.startGame(this.state.w, this.state.h);
        this.soundService.startAmbient();
        this.showMessage('GO GO GO', 900);
    }

    private endGame(): void {
        this.state.phase = 'gameOver';
        this.soundService.stopAmbient();
        this.showMessage('DECAPITATED BY COSMIC CARGO\nPRESS SPACE OR CLICK TO RESTART', 999999);
    }

    private showMessage(text: string, duration: number): void {
        this.toastEl.textContent = text;
        this.toastEl.classList.add('visible');
        this.messageTimer = duration;
    }

    private clearMessage(): void {
        this.toastEl.classList.remove('visible');
        this.messageTimer = 0;
    }

    private updateHUD(): void {
        this.statsEl.innerHTML =
            `Score: ${Math.floor(this.state.score)}<br />` +
            `Chaos: ${Math.min(999, Math.floor(this.state.chaos * 10))}%<br />` +
            `Hearts: ${this.state.hearts}`;
    }

    private loop(now: DOMHighResTimeStamp): void {
        const dt = Math.min(0.033, (now - this.last) / 1000);
        this.last = now;

        if (this.messageTimer > 0) {
            this.messageTimer -= dt * 1000;
            if (this.messageTimer <= 0) {
                this.clearMessage();
            }
        }

        this.gameService.update(
            dt,
            this.state,
            this.keys,
            this.pointer,
            (text, duration) => { this.showMessage(text, duration); },
            () => { this.endGame(); }
        );

        this.updateHUD();
        this.draw();
        window.requestAnimationFrame(this.boundLoop);
    }

    private draw(): void {
        const perfNow = performance.now();
        const xShake = this.state.shake ? rand(-this.state.shake, this.state.shake) : 0;
        const yShake = this.state.shake ? rand(-this.state.shake, this.state.shake) : 0;
        const glitchX = this.state.glitchTimer > 0 ? rand(-8, 8) : 0;
        const glitchY = this.state.glitchTimer > 0 ? rand(-4, 4) : 0;

        this.ctx.save();
        this.ctx.translate(xShake + glitchX, yShake + glitchY);

        this.backgroundView.draw(this.ctx, this.state, this.stars, perfNow);
        this.entityView.drawHalos(this.ctx, this.halos);
        this.entityView.drawDebrisAll(this.ctx, this.debris);
        this.entityView.drawParticles(this.ctx, this.particles);
        this.playerView.draw(this.ctx, this.player, this.state.time);

        if (this.state.glitchTimer > 0) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.1;
            this.ctx.fillStyle = '#fff';
            for (let i = 0; i < 18; i++) {
                this.ctx.fillRect(rand(0, this.state.w), rand(0, this.state.h), rand(40, 300), rand(1, 4));
            }
            this.ctx.restore();
        }

        this.ctx.restore();
    }
}
