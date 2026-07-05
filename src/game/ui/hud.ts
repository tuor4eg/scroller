import { GameObjects, Scene } from 'phaser'
import type { GameConfig } from '../config'

export type Hud = {
    scoreText: GameObjects.Text
    livesText: GameObjects.Text
    moduleSlotBackgrounds: GameObjects.Rectangle[]
    moduleSlotTexts: GameObjects.Text[]
    pauseText: GameObjects.Text
    gameOverText: GameObjects.Text
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

    const livesText = scene.add.text(
        config.hud.x,
        config.hud.livesY,
        formatLives(config.player.initialLives),
        {
            fontFamily: config.hud.fontFamily,
            fontSize: config.hud.livesFontSize,
            fontStyle: 'bold',
            color: '#ef4444',
        },
    )

    livesText.setStroke('#7f1d1d', 4)
    livesText.setShadow(2, 2, '#000000', 0, false, true)

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

    return {
        scoreText,
        livesText,
        moduleSlotBackgrounds,
        moduleSlotTexts,
        pauseText,
        gameOverText,
    }
}

export const updateScoreText = (hud: Hud, score: number) => {
    hud.scoreText.setText(formatScore(score))
}

export const updateLivesText = (hud: Hud, lives: number) => {
    hud.livesText.setText(formatLives(lives))
}

export const updateModuleSlotTexts = (
    hud: Hud,
    modules: { label: string, remainingMs: number }[],
) => {
    hud.moduleSlotTexts.forEach((slotText, index) => {
        const module = modules[index]

        if (!module) {
            slotText.setText(formatModuleSlot(index))

            return
        }

        const remainingSeconds = Math.ceil(module.remainingMs / 1000)

        slotText.setText(formatModuleSlot(index, module.label, remainingSeconds))
    })
}

export const setPauseVisible = (hud: Hud, isVisible: boolean) => {
    hud.pauseText.setVisible(isVisible)
}

export const setGameOverVisible = (hud: Hud, isVisible: boolean) => {
    if (isVisible) {
        hud.gameOverText.setToTop()
    }

    hud.gameOverText.setVisible(isVisible)
}

const formatScore = (score: number) => {
    return `Score: ${score}`
}

const formatLives = (lives: number) => {
    return Array.from({ length: Math.max(0, lives) }, () => '♥').join(' ')
}

const formatModuleSlot = (
    index: number,
    label?: string,
    remainingSeconds?: number,
) => {
    if (!label || remainingSeconds === undefined) {
        return `M${index + 1} -`
    }

    return `M${index + 1} ${label} ${remainingSeconds}s`
}
