import { PlayerEntity } from '/Slopathon/src/Common/Models/Entities';

export class PlayerView {
    draw(ctx: CanvasRenderingContext2D, player: PlayerEntity, gameTime: number): void {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.tilt);

        const engineGlow = 0.5 + Math.sin(gameTime * 16) * 0.2;

        this.drawEngineFlame(ctx, -18, engineGlow);
        this.drawEngineFlame(ctx, 18, engineGlow);
        this.drawHelmet(ctx);

        ctx.fillStyle = '#ff4338';
        ctx.beginPath();
        ctx.roundRect(-20, 0, 40, 38, 12);
        ctx.fill();
        ctx.strokeStyle = '#ffcf7d';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffe7b0';
        ctx.fillRect(-7, 12, 14, 16);
        ctx.fillStyle = '#fff1dc';
        ctx.fillRect(-5, 15, 10, 5);

        this.drawWing(ctx, -28, false);
        this.drawWing(ctx, 28, true);

        ctx.fillStyle = '#1d1c2b';
        ctx.fillRect(-18, 36, 12, 12);
        ctx.fillRect(6, 36, 12, 12);

        ctx.restore();
    }

    private drawEngineFlame(ctx: CanvasRenderingContext2D, offsetX: number, engineGlow: number): void {
        ctx.save();
        ctx.translate(offsetX, 24);
        ctx.fillStyle = `rgba(255, 83, 54, ${0.55 + engineGlow * 0.25})`;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, 28);
        ctx.lineTo(10, 28);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    private drawHelmet(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(0, -12);

        ctx.fillStyle = '#f7f2e9';
        ctx.strokeStyle = '#cccbca';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#97dfff';
        ctx.beginPath();
        ctx.ellipse(2, -2, 10, 8, 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-5, -7, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    private drawWing(ctx: CanvasRenderingContext2D, offsetX: number, mirror: boolean): void {
        ctx.save();
        ctx.translate(offsetX, 2);

        if (mirror) {
            ctx.scale(-1, 1);
        }

        ctx.rotate(-0.4);
        ctx.fillStyle = '#f5efe7';
        ctx.strokeStyle = '#d8d2cb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-30, -20, -46, 6);
        ctx.quadraticCurveTo(-24, 24, -2, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
}
