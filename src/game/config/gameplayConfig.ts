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
    layers: {
        initialLayerIndex: 1,
        items: [
            {
                id: 'upper-air',
                name: 'Upper air',
                backgroundColor: 0x0b1026,
                missionProgressPerSecond: -0.15,
                enemySpawnIntervalMultiplier: 0.7,
                scoreRewardMultiplier: 1,
                enemyTypeWeights: {
                    basic: 75,
                    sturdy: 18,
                    heavy: 7,
                },
            },
            {
                id: 'fog-boundary',
                name: 'Fog boundary',
                backgroundColor: 0x334155,
                missionProgressPerSecond: 0.2,
                enemySpawnIntervalMultiplier: 1.3,
                scoreRewardMultiplier: 1.5,
                enemyTypeWeights: {
                    basic: 20,
                    sturdy: 55,
                    heavy: 25,
                },
            },
        ],
    },
    missionProgress: {
        initial: 50,
        min: 0,
        max: 100,
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
