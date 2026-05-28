export type GamePhase = 'title' | 'playing' | 'gameOver';

export interface GameState {
    phase: GamePhase;
    score: number;
    hearts: number;
    chaos: number;
    time: number;
    shake: number;
    glitchTimer: number;
    w: number;
    h: number;
    dpr: number;
}
