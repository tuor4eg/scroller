import { GameObjects, Math as PhaserMath, Scene } from 'phaser'
import type { GameConfig } from '../config'
import type { RunResult } from '../state/RunState'

export type Hud = {
    scoreText: GameObjects.Text
    healthBarBackground: GameObjects.Rectangle
    healthBarFill: GameObjects.Rectangle
    missionProgressBackground: GameObjects.Rectangle
    missionProgressFill: GameObjects.Rectangle
    missionProgressText: GameObjects.Text
    moduleSlotBackgrounds: GameObjects.Rectangle[]
    moduleSlotTexts: GameObjects.Text[]
    pauseText: GameObjects.Text
    gameOverText: GameObjects.Text
    startOverlay: GameObjects.Rectangle
    startTitleText: GameObjects.Text
    startHintText: GameObjects.Text
    startButton: GameObjects.Rectangle
    startButtonText: GameObjects.Text
}

export const createHud = (scene: Scene, config: GameConfig): Hud => {
    const scoreText = scene.add.text(
        scene.scale.width - config.hud.x,
        config.hud.scoreY,
        formatScore(config.score.initial),
        {
            fontFamily: config.hud.fontFamily,
            fontSize: config.hud.fontSize,
            fontStyle: 'bold',
            color: '#ffffff',
        },
    ).setOrigin(1, 0)

    scoreText.setStroke('#1d4ed8', 3)
    scoreText.setShadow(2, 2, '#000000', 0, false, true)

    const healthBarBackground = scene.add.rectangle(
        config.hud.healthBarX,
        config.hud.healthBarY,
        config.hud.healthBarWidth,
        config.hud.healthBarHeight,
        config.hud.healthBarBackgroundColor,
        0.9,
    ).setOrigin(0)

    healthBarBackground.setStrokeStyle(1, config.hud.healthBarStrokeColor, 0.8)

    const healthBarFill = scene.add.rectangle(
        config.hud.healthBarX,
        config.hud.healthBarY,
        config.hud.healthBarWidth,
        config.hud.healthBarHeight,
        config.hud.healthBarFillColor,
    ).setOrigin(0)

    const missionProgressBackground = scene.add.rectangle(
        config.hud.missionProgressX,
        config.hud.missionProgressY,
        config.hud.missionProgressWidth,
        config.hud.missionProgressHeight,
        config.hud.missionProgressBackgroundColor,
        0.9,
    ).setOrigin(0)

    missionProgressBackground.setStrokeStyle(
        1,
        config.hud.missionProgressStrokeColor,
        0.8,
    )

    const missionProgressFill = scene.add.rectangle(
        config.hud.missionProgressX,
        config.hud.missionProgressY,
        config.hud.missionProgressWidth,
        config.hud.missionProgressHeight,
        config.hud.missionProgressFillColor,
    ).setOrigin(0)

    const missionProgressText = scene.add.text(
        config.hud.missionProgressX + config.hud.missionProgressWidth / 2,
        config.hud.missionProgressY + config.hud.missionProgressHeight / 2,
        '',
        {
            fontFamily: config.hud.fontFamily,
            fontSize: '11px',
            fontStyle: 'bold',
            color: '#ffffff',
        },
    ).setOrigin(0.5)

    const moduleSlotBackgrounds = []
    const moduleSlotTexts = []

    for (let i = 0; i < config.module.slotCount; i++) {
        const slotY = config.hud.moduleSlotsY + i * config.hud.moduleSlotGap

        const moduleSlotBackground = scene.add.rectangle(
            config.hud.moduleSlotsX,
            slotY,
            config.hud.moduleSlotWidth,
            config.hud.moduleSlotHeight,
            0x111827,
            0.65,
        ).setOrigin(0)

        moduleSlotBackground.setStrokeStyle(1, 0xffffff, 0.45)

        const moduleSlotText = scene.add.text(
            config.hud.moduleSlotsX + config.hud.moduleSlotTextXOffset,
            slotY + config.hud.moduleSlotTextYOffset,
            formatModuleSlot(i),
            {
                fontFamily: config.hud.fontFamily,
                fontSize: config.hud.moduleFontSize,
                fontStyle: 'bold',
                color: '#ffffff',
            },
        )

        moduleSlotBackgrounds.push(moduleSlotBackground)
        moduleSlotTexts.push(moduleSlotText)
    }

    const pauseText = scene.add.text(
        scene.scale.width / 2,
        scene.scale.height / 2,
        'PAUSE\nPress Enter to continue',
        {
            fontFamily: 'Arial',
            fontSize: config.message.fontSize,
            color: '#ffffff',
            align: 'center',
        },
    ).setOrigin(0.5)

    pauseText.setVisible(false)

    const gameOverText = scene.add.text(
        scene.scale.width / 2,
        scene.scale.height / 2,
        'GAME OVER\nPress Enter to restart',
        {
            fontFamily: 'Arial',
            fontSize: config.message.fontSize,
            color: '#ffffff',
            align: 'center',
        },
    ).setOrigin(0.5)

    gameOverText.setVisible(false)

    const startOverlay = scene.add.rectangle(
        0,
        0,
        scene.scale.width,
        scene.scale.height,
        0x020617,
        0.86,
    ).setOrigin(0)

    const startTitleText = scene.add.text(
        scene.scale.width / 2,
        scene.scale.height / 2 - 128,
        'SCROLLER',
        {
            fontFamily: config.hud.fontFamily,
            fontSize: '38px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center',
        },
    ).setOrigin(0.5)

    startTitleText.setStroke('#1d4ed8', 4)
    startTitleText.setShadow(2, 2, '#000000', 0, false, true)

    const startHintText = scene.add.text(
        scene.scale.width / 2,
        scene.scale.height / 2 - 46,
        'Move: A/D or Left/Right\nSwitch layer: Up/Down\nShoot: Space\nPause: Enter\nCollect modules and dodge fire',
        {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#dbeafe',
            align: 'center',
            lineSpacing: 8,
        },
    ).setOrigin(0.5)

    const startButton = scene.add.rectangle(
        scene.scale.width / 2,
        scene.scale.height / 2 + 82,
        150,
        44,
        0x22c55e,
    ).setInteractive({ useHandCursor: true })

    startButton.setStrokeStyle(2, 0xffffff, 0.9)

    const startButtonText = scene.add.text(
        startButton.x,
        startButton.y,
        'START',
        {
            fontFamily: config.hud.fontFamily,
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#052e16',
        },
    ).setOrigin(0.5)

    return {
        scoreText,
        healthBarBackground,
        healthBarFill,
        missionProgressBackground,
        missionProgressFill,
        missionProgressText,
        moduleSlotBackgrounds,
        moduleSlotTexts,
        pauseText,
        gameOverText,
        startOverlay,
        startTitleText,
        startHintText,
        startButton,
        startButtonText,
    }
}

export const updateScoreText = (hud: Hud, score: number) => {
    hud.scoreText.setText(formatScore(score))
}

export const updateHealthBar = (
    hud: Hud,
    health: number,
    maxHealth: number,
) => {
    const healthRatio = PhaserMath.Clamp(health / maxHealth, 0, 1)

    hud.healthBarFill.setDisplaySize(
        hud.healthBarBackground.width * healthRatio,
        hud.healthBarBackground.height,
    )
}

export const updateMissionProgress = (
    hud: Hud,
    progress: number,
    min: number,
    max: number,
) => {
    const progressRatio = PhaserMath.Clamp(
        (progress - min) / (max - min),
        0,
        1,
    )

    hud.missionProgressFill.setDisplaySize(
        hud.missionProgressBackground.width * progressRatio,
        hud.missionProgressBackground.height,
    )
    hud.missionProgressText.setText(`MISSION ${Math.round(progress)}`)
}

export const updateModuleSlotTexts = (
    hud: Hud,
    modules: { label: string, remainingMs?: number }[],
) => {
    hud.moduleSlotTexts.forEach((slotText, index) => {
        const module = modules[index]

        if (!module) {
            slotText.setText(formatModuleSlot(index))

            return
        }

        if (module.remainingMs === undefined) {
            slotText.setText(formatModuleSlot(index, module.label))

            return
        }

        const remainingSeconds = Math.ceil(module.remainingMs / 1000)

        slotText.setText(formatModuleSlot(index, module.label, remainingSeconds))
    })
}

export const setPauseVisible = (hud: Hud, isVisible: boolean) => {
    hud.pauseText.setVisible(isVisible)
}

export const setGameOverVisible = (
    hud: Hud,
    isVisible: boolean,
    score = 0,
    result?: RunResult,
) => {
    hud.gameOverText.setVisible(false)

    if (!isVisible) {
        setStartVisible(hud, false)

        return
    }

    hud.startTitleText.setText(result === 'victory' ? 'VICTORY' : 'DEFEAT')
    hud.startHintText.setText(`Score: ${score}\nPress Enter to restart`)
    hud.startButtonText.setText('RESTART')
    setStartVisible(hud, true)
}

export const setStartVisible = (hud: Hud, isVisible: boolean) => {
    hud.startOverlay.setVisible(isVisible)
    hud.startTitleText.setVisible(isVisible)
    hud.startHintText.setVisible(isVisible)
    hud.startButton.setVisible(isVisible)
    hud.startButtonText.setVisible(isVisible)

    if (!isVisible) {
        return
    }

    hud.startOverlay.setToTop()
    hud.startTitleText.setToTop()
    hud.startHintText.setToTop()
    hud.startButton.setToTop()
    hud.startButtonText.setToTop()
}

const formatScore = (score: number) => {
    return `Score: ${score}`
}

const formatModuleSlot = (
    index: number,
    label?: string,
    remainingSeconds?: number,
) => {
    if (!label) {
        return `M${index + 1} -`
    }

    if (remainingSeconds === undefined) {
        return `M${index + 1} ${label} ∞`
    }

    return `M${index + 1} ${label} ${remainingSeconds}s`
}
