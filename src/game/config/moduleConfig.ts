export enum ModuleKind {
    Temporary = 'temporary',
    Permanent = 'permanent',
    Instant = 'instant',
}

export const MODULE_CONFIG = {
    slotCount: 3,
    duration: 8000,
    width: 64,
    height: 26,
    speed: 120,
    spawnRate: 4500,
    spawnChance: 15,
    color: 0x38bdf8,
    strokeWidth: 2,
    strokeColor: 0xffffff,
    labels: ['Rapid', 'Spread', 'Shield', 'Heal', 'Reset'],
    effects: {
        rapidFire: {
            type: 'Rapid',
            kind: ModuleKind.Temporary,
            fireRateMultiplier: 0.48,
        },
        spreadShot: {
            type: 'Spread',
            kind: ModuleKind.Temporary,
            bulletCount: 3,
            fanAngle: 30,
        },
        shield: {
            type: 'Shield',
            kind: ModuleKind.Temporary,
            radius: 46,
            strokeWidth: 3,
            color: 0x60a5fa,
            alpha: 0.85,
        },
        heal: {
            type: 'Heal',
            kind: ModuleKind.Instant,
            amount: 1,
        },
        resetTimers: {
            type: 'Reset',
            kind: ModuleKind.Instant,
        },
    },
} as const

export type ModuleConfig = typeof MODULE_CONFIG
