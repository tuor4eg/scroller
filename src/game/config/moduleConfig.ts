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
    labels: ['Rapid', 'Spread', 'Shield'],
    effects: {
        rapidFire: {
            type: 'Rapid',
            fireRateMultiplier: 0.48,
        },
        spreadShot: {
            type: 'Spread',
            bulletCount: 3,
            fanAngle: 30,
        },
        shield: {
            type: 'Shield',
            radius: 46,
            strokeWidth: 3,
            color: 0x60a5fa,
            alpha: 0.85,
        },
    },
} as const

export type ModuleConfig = typeof MODULE_CONFIG
