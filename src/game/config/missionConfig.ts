import { GAMEPLAY_CONFIG } from './gameplayConfig'
import type { MissionConfig } from '../types/mission'

export const PROTOTYPE_MISSION = {
    id: 'prototype',
    name: 'Prototype',
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
    initialProgress: GAMEPLAY_CONFIG.missionProgress.initial,
    victoryConditions: {
        missionProgressAtLeast: GAMEPLAY_CONFIG.missionProgress.max,
    },
    defeatConditions: {
        missionProgressAtMost: GAMEPLAY_CONFIG.missionProgress.min,
        playerDeath: true,
    },
    enemies: {
        availableTypes: ['basic', 'sturdy', 'heavy', 'carrier'],
    },
    difficulty: {
        initialEnemySpawnInterval: 1000,
        minimumEnemySpawnInterval: 450,
        enemySpawnRateDecreasePerSecond: 8,
        initialEnemySpeedMultiplier: 1,
        enemySpeedMultiplierIncreasePerSecond: 1 / 60,
    },
    rewards: {
        initialScore: 0,
        salvage: {
            initialThreshold: 12,
            thresholdGrowth: 4,
            enemyRewards: {
                basic: 1,
                sturdy: 2,
                heavy: 4,
                carrier: 5,
            },
        },
        bonuses: {
            victory: {
                score: 0,
            },
            time: {
                scorePerSecond: 0,
            },
            difficulty: {
                scoreMultiplier: 1,
            },
        },
    },
    environment: {
        starfieldEnabled: true,
    },
} as const satisfies MissionConfig
