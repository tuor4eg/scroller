import { Input, Scene } from 'phaser'
import type { RunEndReason, RunResult, RunState } from '../state/RunState'
import type { MissionConfig } from '../types/mission'

export class RunSystem {
    private readonly scene: Scene
    private readonly runState: RunState
    private readonly restartKey: Input.Keyboard.Key
    private readonly onFinish: () => void
    private readonly missionConfig: MissionConfig

    constructor(
        scene: Scene,
        runState: RunState,
        missionConfig: MissionConfig,
        onFinish: () => void,
    ) {
        this.scene = scene
        this.runState = runState
        this.onFinish = onFinish
        this.missionConfig = missionConfig
        this.restartKey = scene.input.keyboard!.addKey(
            Input.Keyboard.KeyCodes.ENTER,
        )
    }

    update(delta: number) {
        if (!this.runState.hasStarted()) {
            return false
        }

        if (this.runState.isGameOver()) {
            if (this.restartKey.isDown) {
                this.restart()
            }

            return false
        }

        if (Input.Keyboard.JustDown(this.restartKey)) {
            this.runState.togglePause()
        }

        if (this.runState.isPaused()) {
            return false
        }

        this.runState.advanceTime(delta)

        return true
    }

    start() {
        this.runState.start()
    }

    finish(result: RunResult, reason: RunEndReason) {
        if (this.runState.finish(result, reason)) {
            this.onFinish()
        }
    }

    restart() {
        this.scene.scene.restart({
            autoStart: true,
            missionConfig: this.missionConfig,
        })
    }
}
