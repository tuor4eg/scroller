import type { EnemyType } from '../config/enemyConfig'

export type MissionLayerConfig = {
    id: string
    name: string
    backgroundColor: number
    missionProgressPerSecond: number
    enemySpawnIntervalMultiplier: number
    scoreRewardMultiplier: number
    enemyTypeWeights: {
        basic: number
        sturdy: number
        heavy: number
    }
}

export type MissionConfig = {
    id: string
    name: string
    layers: {
        initialLayerIndex: number
        items: readonly MissionLayerConfig[]
    }
    initialProgress: number
    victoryConditions: {
        missionProgressAtLeast: number
    }
    defeatConditions: {
        missionProgressAtMost: number
        playerDeath: boolean
    }
    enemies: {
        availableTypes: readonly EnemyType[]
    }
    difficulty: {
        initialEnemySpawnInterval: number
        minimumEnemySpawnInterval: number
        enemySpawnRateDecreasePerSecond: number
        initialEnemySpeedMultiplier: number
        enemySpeedMultiplierIncreasePerSecond: number
    }
    rewards: {
        initialScore: number
        bonuses: {
            victory: {
                score: number
            }
            time: {
                scorePerSecond: number
            }
            difficulty: {
                scoreMultiplier: number
            }
        }
    }
    environment: {
        starfieldEnabled: boolean
    }
}
