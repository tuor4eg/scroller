export const GAMEPLAY_CONFIG = {
    game: {
        width: 480,
        height: 720,
    },
    player: {
        width: 80,
        height: 50,
        bottomOffset: 80,
        speed: 320,
        maxHealth: 3,
        damagePerHit: 1,
        invulnerabilityDuration: 1500,
    },
    bullet: {
        width: 6,
        height: 18,
        yOffset: 32,
        speed: 500,
        fireRate: 250,
        destroyY: -20,
        damage: 1,
    },
} as const

export type GameplayConfig = typeof GAMEPLAY_CONFIG
