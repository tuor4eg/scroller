import { GameObjects, Scene } from 'phaser'
import type { EnemyType } from '../config/enemyConfig'

export const VISUAL_TEXTURES = {
    player: 'visual-player-airship',
    playerProjectile: 'visual-player-projectile',
    enemyProjectile: 'visual-enemy-projectile',
    module: 'visual-module',
    enemies: {
        basic: 'visual-enemy-basic',
        sturdy: 'visual-enemy-sturdy',
        heavy: 'visual-enemy-heavy',
        carrier: 'visual-enemy-carrier',
    },
} as const

export const createVisualAssets = (scene: Scene) => {
    createPlayerTexture(scene)
    createProjectileTextures(scene)
    createModuleTexture(scene)
    createEnemyTextures(scene)
}

export const getEnemyTexture = (type: EnemyType) => {
    return VISUAL_TEXTURES.enemies[type]
}

const createGraphics = (scene: Scene, key: string) => {
    if (scene.textures.exists(key)) {
        return undefined
    }

    return scene.add.graphics().setVisible(false)
}

const saveTexture = (
    graphics: GameObjects.Graphics,
    key: string,
    width: number,
    height: number,
) => {
    graphics.generateTexture(key, width, height)
    graphics.destroy()
}

const createPlayerTexture = (scene: Scene) => {
    const graphics = createGraphics(scene, VISUAL_TEXTURES.player)

    if (!graphics) {
        return
    }

    graphics.fillStyle(0x2a4350)
    graphics.fillEllipse(40, 34, 65, 24)
    graphics.lineStyle(3, 0xd9bb73)
    graphics.strokeEllipse(40, 34, 65, 24)
    graphics.fillStyle(0xc18a48)
    graphics.fillTriangle(40, 2, 59, 37, 21, 37)
    graphics.lineStyle(2, 0xf5df9b)
    graphics.strokeTriangle(40, 2, 59, 37, 21, 37)
    graphics.fillStyle(0x7dd3fc, 0.9)
    graphics.fillCircle(40, 23, 7)
    graphics.lineStyle(2, 0xe0f2fe)
    graphics.strokeCircle(40, 23, 7)
    graphics.fillStyle(0xb86b36)
    graphics.fillCircle(14, 35, 8)
    graphics.fillCircle(66, 35, 8)
    graphics.lineStyle(2, 0xf5df9b)
    graphics.strokeCircle(14, 35, 8)
    graphics.strokeCircle(66, 35, 8)
    graphics.fillStyle(0x67e8f9, 0.8)
    graphics.fillTriangle(30, 43, 40, 50, 35, 40)
    graphics.fillTriangle(50, 43, 40, 50, 45, 40)
    saveTexture(graphics, VISUAL_TEXTURES.player, 80, 50)
}

const createProjectileTextures = (scene: Scene) => {
    const playerGraphics = createGraphics(scene, VISUAL_TEXTURES.playerProjectile)

    if (playerGraphics) {
        playerGraphics.fillStyle(0x67e8f9, 0.35)
        playerGraphics.fillEllipse(6, 13, 12, 24)
        playerGraphics.fillStyle(0xfef3c7)
        playerGraphics.fillEllipse(6, 9, 5, 15)
        playerGraphics.lineStyle(1, 0xfbbf24)
        playerGraphics.strokeEllipse(6, 9, 5, 15)
        saveTexture(playerGraphics, VISUAL_TEXTURES.playerProjectile, 12, 26)
    }

    const enemyGraphics = createGraphics(scene, VISUAL_TEXTURES.enemyProjectile)

    if (enemyGraphics) {
        enemyGraphics.fillStyle(0xa855f7, 0.3)
        enemyGraphics.fillEllipse(6, 11, 12, 22)
        enemyGraphics.fillStyle(0xd946ef)
        enemyGraphics.fillCircle(6, 11, 4)
        enemyGraphics.lineStyle(1, 0xf5d0fe)
        enemyGraphics.strokeCircle(6, 11, 4)
        saveTexture(enemyGraphics, VISUAL_TEXTURES.enemyProjectile, 12, 22)
    }
}

const createModuleTexture = (scene: Scene) => {
    const graphics = createGraphics(scene, VISUAL_TEXTURES.module)

    if (!graphics) {
        return
    }

    graphics.fillStyle(0x17384a, 0.95)
    graphics.fillRoundedRect(1, 3, 62, 22, 8)
    graphics.lineStyle(2, 0x7dd3fc)
    graphics.strokeRoundedRect(1, 3, 62, 22, 8)
    graphics.fillStyle(0xd9bb73)
    graphics.fillCircle(13, 14, 8)
    graphics.lineStyle(2, 0xfff1b8)
    graphics.strokeCircle(13, 14, 8)
    graphics.lineBetween(13, 8, 13, 20)
    graphics.lineBetween(7, 14, 19, 14)
    saveTexture(graphics, VISUAL_TEXTURES.module, 64, 28)
}

const createEnemyTextures = (scene: Scene) => {
    createBasicEnemyTexture(scene)
    createSturdyEnemyTexture(scene)
    createHeavyEnemyTexture(scene)
    createCarrierEnemyTexture(scene)
}

const createBasicEnemyTexture = (scene: Scene) => {
    const graphics = createGraphics(scene, VISUAL_TEXTURES.enemies.basic)

    if (!graphics) {
        return
    }

    graphics.fillStyle(0x522f67)
    graphics.fillEllipse(24, 18, 25, 22)
    graphics.fillStyle(0x8b5aa1)
    graphics.fillTriangle(19, 15, 1, 4, 8, 22)
    graphics.fillTriangle(29, 15, 47, 4, 40, 22)
    graphics.lineStyle(2, 0xe9d5ff)
    graphics.strokeEllipse(24, 18, 25, 22)
    graphics.fillStyle(0xa7f3d0)
    graphics.fillCircle(24, 16, 4)
    saveTexture(graphics, VISUAL_TEXTURES.enemies.basic, 48, 32)
}

const createSturdyEnemyTexture = (scene: Scene) => {
    const graphics = createGraphics(scene, VISUAL_TEXTURES.enemies.sturdy)

    if (!graphics) {
        return
    }

    graphics.fillStyle(0x244d55)
    graphics.fillEllipse(22, 17, 32, 24)
    graphics.fillStyle(0x4b7d78)
    graphics.fillTriangle(13, 13, 1, 26, 18, 24)
    graphics.fillTriangle(31, 13, 43, 26, 26, 24)
    graphics.lineStyle(2, 0x99f6e4)
    graphics.strokeEllipse(22, 17, 32, 24)
    graphics.fillStyle(0xf0abfc)
    graphics.fillCircle(16, 15, 3)
    graphics.fillCircle(28, 15, 3)
    saveTexture(graphics, VISUAL_TEXTURES.enemies.sturdy, 44, 34)
}

const createHeavyEnemyTexture = (scene: Scene) => {
    const graphics = createGraphics(scene, VISUAL_TEXTURES.enemies.heavy)

    if (!graphics) {
        return
    }

    graphics.fillStyle(0x35293d)
    graphics.fillRoundedRect(7, 7, 42, 29, 10)
    graphics.fillStyle(0x6b425e)
    graphics.fillCircle(9, 22, 8)
    graphics.fillCircle(47, 22, 8)
    graphics.lineStyle(3, 0xc4b5fd)
    graphics.strokeRoundedRect(7, 7, 42, 29, 10)
    graphics.lineStyle(2, 0x9f7aea)
    graphics.lineBetween(17, 8, 12, 1)
    graphics.lineBetween(39, 8, 44, 1)
    graphics.fillStyle(0xf472b6)
    graphics.fillCircle(28, 21, 6)
    saveTexture(graphics, VISUAL_TEXTURES.enemies.heavy, 56, 40)
}

const createCarrierEnemyTexture = (scene: Scene) => {
    const graphics = createGraphics(scene, VISUAL_TEXTURES.enemies.carrier)

    if (!graphics) {
        return
    }

    graphics.fillStyle(0x3c315b)
    graphics.fillEllipse(25, 21, 40, 28)
    graphics.fillStyle(0x7c5ca7)
    graphics.fillTriangle(15, 19, 1, 7, 8, 30)
    graphics.fillTriangle(35, 19, 49, 7, 42, 30)
    graphics.lineStyle(2, 0xf0abfc)
    graphics.strokeEllipse(25, 21, 40, 28)
    graphics.fillStyle(0x38bdf8)
    graphics.fillCircle(25, 21, 8)
    graphics.lineStyle(2, 0xe0f2fe)
    graphics.strokeCircle(25, 21, 8)
    saveTexture(graphics, VISUAL_TEXTURES.enemies.carrier, 50, 42)
}
