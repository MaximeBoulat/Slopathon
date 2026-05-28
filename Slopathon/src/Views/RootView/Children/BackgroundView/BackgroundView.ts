import { GameState } from '/Slopathon/src/Common/Models/GameState';
import { StarEntity } from '/Slopathon/src/Common/Models/Entities';

export class BackgroundView {
    draw(ctx: CanvasRenderingContext2D, state: GameState, stars: StarEntity[], perfNow: number): void {
        this.drawGradient(ctx, state.w, state.h);
        this.drawNebula(ctx, state.w, state.h, perfNow);
        this.drawStars(ctx, stars);
    }

    private drawGradient(ctx: CanvasRenderingContext2D, w: number, h: number): void {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#07070d');
        grad.addColorStop(0.45, '#180912');
        grad.addColorStop(1, '#2e1116');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    }

    private drawNebula(ctx: CanvasRenderingContext2D, w: number, h: number, perfNow: number): void {
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#ff6d6d';
        for (let i = 0; i < 6; i++) {
            const x = w * 0.5 + Math.sin(perfNow * 0.0006 + i) * 260;
            const y = 90 + i * 68 + Math.cos(perfNow * 0.0004 + i) * 20;
            ctx.beginPath();
            ctx.arc(x, y, 46 + i * 12, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    private drawStars(ctx: CanvasRenderingContext2D, stars: StarEntity[]): void {
        ctx.save();
        for (const s of stars) {
            if (s.hue) {
                ctx.fillStyle = `rgba(255, 170, 120, ${0.25 + s.z * 0.5})`;
            } else {
                ctx.fillStyle = `rgba(255, 255, 255, ${0.25 + s.z * 0.6})`;
            }
            ctx.fillRect(s.x, s.y, s.size * s.z, s.size * s.z);
        }
        ctx.restore();
    }
}
