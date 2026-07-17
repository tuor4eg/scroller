import { Math as PhaserMath } from 'phaser'
import type { RunResult, RunState } from '../state/RunState'
import type { MissionConfig } from '../types/mission'

export class MissionProgress {
    private readonly config: MissionConfig
    private readonly runState: RunState

    constructor(config: MissionConfig, runState: RunState) {
        this.config = config
        this.runState = runState
    }

    update(delta: number, progressPerSecond: number): RunResult | undefined {
        const progressDelta = progressPerSecond * delta / 1000
        const progress = PhaserMath.Clamp(
            this.runState.getMissionProgress() + progressDelta,
            this.config.defeatConditions.missionProgressAtMost,
            this.config.victoryConditions.missionProgressAtLeast,
        )

        this.runState.setMissionProgress(progress)

        if (progress <= this.config.defeatConditions.missionProgressAtMost) {
            return 'defeat'
        }

        if (progress >= this.config.victoryConditions.missionProgressAtLeast) {
            return 'victory'
        }

        return undefined
    }
}
