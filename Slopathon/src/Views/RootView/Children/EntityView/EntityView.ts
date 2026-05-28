import {
    DebrisEntity,
    HaloEntity,
    ParticleEntity,
} from '/Slopathon/src/Common/Models/Entities';

const REDBULL_IMAGE = new Image();
REDBULL_IMAGE.src = '/Redbull.png';

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export class EntityView {
    drawHalos(ctx: CanvasRenderingContext2D, halos: HaloEntity[]): void {
        for (const halo of halos) {
            this.drawHalo(ctx, halo);
        }
    }

    drawDebrisAll(ctx: CanvasRenderingContext2D, debris: DebrisEntity[]): void {
        for (const d of debris) {
            this.drawDebris(ctx, d);
        }
    }

    drawParticles(ctx: CanvasRenderingContext2D, particles: ParticleEntity[]): void {
        for (const p of particles) {
            const alpha = clamp(p.life / p.maxLife, 0, 1);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 12;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.spin * p.life);
            ctx.beginPath();
            ctx.arc(0, 0, p.size * (0.6 + alpha), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    private drawHalo(ctx: CanvasRenderingContext2D, halo: HaloEntity): void {
        const pulse = 1 + Math.sin(halo.pulse) * 0.12;
        ctx.save();
        ctx.translate(halo.x, halo.y);
        ctx.scale(pulse, pulse);

        ctx.strokeStyle = '#fff6a2';
        ctx.lineWidth = 5;
        ctx.shadowColor = '#ffd44d';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(0, 0, halo.size, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, halo.size - 5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    private drawDebris(ctx: CanvasRenderingContext2D, d: DebrisEntity): void {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.angle + Math.sin(d.wobble) * 0.12);

        if (d.kind === 'satellite') {
            this.drawSatellite(ctx, d.size);
        } else {
            this.drawRock(ctx, d.size);
        }

        ctx.restore();
    }

    private drawSatellite(ctx: CanvasRenderingContext2D, size: number): void {
        const w = size * 1.95;
        const h = w * REDBULL_IMAGE.naturalHeight / REDBULL_IMAGE.naturalWidth;
        ctx.drawImage(REDBULL_IMAGE, -w / 2, -h / 2, w, h);
    }

    private drawRock(ctx: CanvasRenderingContext2D, size: number): void {
        ctx.fillStyle = '#50424a';
        ctx.beginPath();
        ctx.moveTo(-size, -size * 0.4);
        ctx.lineTo(-size * 0.4, -size);
        ctx.lineTo(size * 0.8, -size * 0.7);
        ctx.lineTo(size, size * 0.4);
        ctx.lineTo(0, size);
        ctx.lineTo(-size * 0.8, size * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#7b6675';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
