import { Math as PhaserMath } from 'phaser'
import type { GameConfig } from '../config'
import type { RunResult, RunState } from '../state/RunState'

type MissionProgressConfig = GameConfig['missionProgress']

export class MissionProgress {
    private readonly config: MissionProgressConfig
    private readonly runState: RunState

    constructor(config: MissionProgressConfig, runState: RunState) {
        this.config = config
        this.runState = runState
    }

    update(delta: number, progressPerSecond: number): RunResult | undefined {
        const progressDelta = progressPerSecond * delta / 1000
        const progress = PhaserMath.Clamp(
            this.runState.getMissionProgress() + progressDelta,
            this.config.min,
            this.config.max,
        )

        this.runState.setMissionProgress(progress)

        if (progress <= this.config.min) {
            return 'defeat'
        }

        if (progress >= this.config.max) {
            return 'victory'
        }

        return undefined
    }
}
