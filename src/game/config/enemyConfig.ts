export enum EnemyMovementType {
    Straight = 'straight',
    Sine = 'sine',
}

export enum EnemyAttackType {
    SingleShot = 'singleShot',
}

export const ENEMY_CONFIG = {
    spawnRate: 1000,
    minSpawnRate: 450,
    spawnRateDecreasePerSecond: 8,
    speedTimeMultiplierIncreasePerSecond: 1 / 60,
    carrierSpawnChance: 25,
    sturdySpawnChance: 25,
    heavySpawnChance: 12,
    baseWidth: 48,
    baseHeight: 36,
    baseScale: 0.7,
    strokeWidth: 3,
    strokeColor: 0xffffff,
    healthBarWidth: 42,
    healthBarHeight: 5,
    healthBarOffsetY: 8,
    healthBarColor: 0x22c55e,
    healthBarBackgroundColor: 0x14532d,
    types: {
        basic: {
            width: 48 * 0.7,
            height: 36 * 0.7,
            speed: 180,
            movement: {
                type: EnemyMovementType.Straight,
            },
            hitPoints: 1,
            scoreReward: 1,
            color: 0xef4444,
        },
        sturdy: {
            width: 40,
            height: 30,
            speed: 160,
            movement: {
                type: EnemyMovementType.Sine,
                amplitude: 32,
                speed: 0.004,
            },
            attack: {
                type: EnemyAttackType.SingleShot,
                cooldown: 1000,
                bulletSpeed: 300,
                bulletWidth: 6,
                bulletHeight: 10,
                bulletColor: 0xf87175,
                damage: 1,
            },
            hitPoints: 2,
            scoreReward: 2,
            color: 0xf97316,
        },
        heavy: {
            width: 48,
            height: 36,
            speed: 140,
            movement: {
                type: EnemyMovementType.Straight,
            },
            attack: {
                type: EnemyAttackType.SingleShot,
                cooldown: 1500,
                bulletSpeed: 260,
                bulletWidth: 6,
                bulletHeight: 14,
                bulletColor: 0xf87171,
                damage: 2,
            },
            hitPoints: 3,
            scoreReward: 3,
            color: 0xdc2626,
        },
        carrier: {
            width: 48,
            height: 36,
            speed: 140,
            movement: {
                type: EnemyMovementType.Straight,
            },
            hitPoints: 3,
            scoreReward: 3,
            color: 0xa78bfa,
            label: 'M',
        },
    },
} as const

export type EnemyConfig = typeof ENEMY_CONFIG
export type EnemyType = keyof EnemyConfig['types']
