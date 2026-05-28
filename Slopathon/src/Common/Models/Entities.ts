export type DebrisKind = 'rock' | 'satellite';

export interface PlayerEntity {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    tilt: number;
    blink: number;
}

export interface DebrisEntity {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    spin: number;
    angle: number;
    wobble: number;
    kind: DebrisKind;
}

export interface HaloEntity {
    x: number;
    y: number;
    size: number;
    pulse: number;
}

export interface ParticleEntity {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
    spin: number;
}

export interface StarEntity {
    x: number;
    y: number;
    z: number;
    size: number;
    hue: number;
}
