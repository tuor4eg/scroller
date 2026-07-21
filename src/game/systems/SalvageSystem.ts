import type { EnemyType } from '../config/enemyConfig'
import type { MissionConfig } from '../types/mission'

type SalvageSystemCallbacks = {
    grantModuleReward: () => void
}

export class SalvageSystem {
    private readonly config: MissionConfig['rewards']['salvage']
    private readonly callbacks: SalvageSystemCallbacks
    private salvage = 0
    private threshold: number

    constructor(
        config: MissionConfig['rewards']['salvage'],
        callbacks: SalvageSystemCallbacks,
    ) {
        this.config = config
        this.callbacks = callbacks
        this.threshold = config.initialThreshold
    }

    collectFromEnemy(type: EnemyType) {
        this.salvage += this.config.enemyRewards[type]

        if (this.salvage < this.threshold) {
            return false
        }

        this.salvage = 0
        this.threshold += this.config.thresholdGrowth
        this.callbacks.grantModuleReward()

        return true
    }

    getSalvage() {
        return this.salvage
    }

    getThreshold() {
        return this.threshold
    }
}
