import { Scene, Scenes } from 'phaser'
import { GAME_CONFIG, type GameConfig } from '../config'
import type { Player } from '../entities/Player'
import type { RunState } from '../state/RunState'
import type { ModuleSystem } from '../systems/ModuleSystem'
import { countEventListeners } from '../helpers/countEventListeners'
import {
    createHud,
    setGameOverVisible,
    setPauseVisible,
    setStartVisible,
    updateHealthBar,
    updateMissionProgress,
    updateModuleSlotTexts,
    updateScoreText,
    updateLayerText,
    type Hud,
} from '../ui/hud'

type UISceneData = {
    gameScene: Scene
    runState: RunState
    player: Player
    moduleSystem: ModuleSystem
    getCurrentLayerName: () => string
    startGame: () => void
    restartGame: () => void
}

export class UIScene extends Scene {
    private readonly config: GameConfig = GAME_CONFIG
    private runState!: RunState
    private player!: Player
    private moduleSystem!: ModuleSystem
    private getCurrentLayerName!: () => string
    private hud!: Hud

    constructor() {
        super('UI')
    }

    create(data: UISceneData) {
        this.runState = data.runState
        this.player = data.player
        this.moduleSystem = data.moduleSystem
        this.getCurrentLayerName = data.getCurrentLayerName
        this.hud = createHud(
            this,
            this.config,
            this.runState.getScore(),
        )

        this.hud.startButton.on('pointerdown', () => {
            if (this.runState.isGameOver()) {
                data.restartGame()

                return
            }

            data.startGame()
        })

        const stopUi = () => {
            this.scene.stop()
        }

        data.gameScene.events.once(Scenes.Events.SHUTDOWN, stopUi)
        this.events.once(Scenes.Events.SHUTDOWN, () => {
            data.gameScene.events.off(Scenes.Events.SHUTDOWN, stopUi)
            this.hud.startButton.removeAllListeners()
        })
    }

    update() {
        updateScoreText(this.hud, this.runState.getScore())
        updateHealthBar(
            this.hud,
            this.player.getHealth(),
            this.player.getMaxHealth(),
        )
        updateMissionProgress(
            this.hud,
            this.runState.getMissionProgress(),
            this.config.missionProgress.min,
            this.config.missionProgress.max,
        )
        updateModuleSlotTexts(
            this.hud,
            this.moduleSystem.getActiveModules(),
        )
        updateLayerText(this.hud, this.getCurrentLayerName())
        setPauseVisible(this.hud, this.runState.isPaused())

        if (this.runState.isGameOver()) {
            setGameOverVisible(
                this.hud,
                true,
                this.runState.getScore(),
                this.runState.getResult(),
            )

            return
        }

        setStartVisible(this.hud, !this.runState.hasStarted())
    }

    getActiveGameObjectCount() {
        return this.children.list.filter((gameObject) => gameObject.active).length
    }

    getEventHandlerCount() {
        return countEventListeners(this.events) +
            countEventListeners(this.input) +
            countEventListeners(this.input.keyboard ?? undefined) +
            countEventListeners(this.hud.startButton)
    }
}
