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

    graphics.fillStyle(0x172f3a, 0.35)
    graphics.fillEllipse(40, 38, 68, 18)
    graphics.fillStyle(0x315564)
    graphics.fillTriangle(40, 2, 65, 42, 40, 35)
    graphics.fillTriangle(40, 2, 15, 42, 40, 35)
    graphics.fillStyle(0xb77b43)
    graphics.fillTriangle(40, 4, 51, 40, 29, 40)
    graphics.lineStyle(2, 0xf1d59b)
    graphics.strokeTriangle(40, 4, 51, 40, 29, 40)
    graphics.fillStyle(0x567783)
    graphics.fillEllipse(40, 29, 18, 25)
    graphics.fillStyle(0x9de8f3, 0.9)
    graphics.fillEllipse(40, 22, 9, 12)
    graphics.lineStyle(2, 0xe7fbff, 0.8)
    graphics.strokeEllipse(40, 22, 9, 12)
    graphics.fillStyle(0xd39a51)
    graphics.fillCircle(19, 38, 5)
    graphics.fillCircle(61, 38, 5)
    graphics.fillStyle(0x83edff, 0.85)
    graphics.fillEllipse(34, 45, 5, 10)
    graphics.fillEllipse(46, 45, 5, 10)
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

    graphics.fillStyle(0x361f45, 0.3)
    graphics.fillEllipse(24, 21, 39, 11)
    graphics.fillStyle(0x7a3f72)
    graphics.fillEllipse(24, 17, 14, 22)
    graphics.fillStyle(0xa85c91)
    graphics.fillTriangle(18, 15, 1, 4, 10, 22)
    graphics.fillTriangle(30, 15, 47, 4, 38, 22)
    graphics.lineStyle(2, 0xe8a9d8, 0.8)
    graphics.lineBetween(2, 5, 15, 17)
    graphics.lineBetween(46, 5, 33, 17)
    graphics.fillStyle(0xd9f99d)
    graphics.fillCircle(24, 13, 3)
    graphics.fillTriangle(21, 25, 24, 31, 27, 25)
    saveTexture(graphics, VISUAL_TEXTURES.enemies.basic, 48, 32)
}

const createSturdyEnemyTexture = (scene: Scene) => {
    const graphics = createGraphics(scene, VISUAL_TEXTURES.enemies.sturdy)

    if (!graphics) {
        return
    }

    graphics.fillStyle(0x173f42, 0.35)
    graphics.fillEllipse(22, 21, 42, 19)
    graphics.fillStyle(0x315d53)
    graphics.fillEllipse(22, 17, 34, 27)
    graphics.fillStyle(0x71906a)
    graphics.fillEllipse(22, 13, 26, 18)
    graphics.lineStyle(3, 0xb6cc8c)
    graphics.strokeEllipse(22, 17, 34, 27)
    graphics.lineStyle(2, 0x254941)
    graphics.lineBetween(11, 9, 33, 24)
    graphics.lineBetween(33, 9, 11, 24)
    graphics.fillStyle(0xe6faa8)
    graphics.fillCircle(16, 14, 2)
    graphics.fillCircle(28, 14, 2)
    saveTexture(graphics, VISUAL_TEXTURES.enemies.sturdy, 44, 34)
}

const createHeavyEnemyTexture = (scene: Scene) => {
    const graphics = createGraphics(scene, VISUAL_TEXTURES.enemies.heavy)

    if (!graphics) {
        return
    }

    graphics.fillStyle(0x221d2b, 0.4)
    graphics.fillEllipse(28, 25, 54, 24)
    graphics.fillStyle(0x49364d)
    graphics.fillEllipse(28, 19, 47, 34)
    graphics.fillStyle(0x704c60)
    graphics.fillCircle(12, 20, 9)
    graphics.fillCircle(44, 20, 9)
    graphics.lineStyle(3, 0xb98da8)
    graphics.strokeEllipse(28, 19, 47, 34)
    graphics.lineStyle(2, 0x32263b)
    graphics.strokeCircle(12, 20, 6)
    graphics.strokeCircle(44, 20, 6)
    graphics.fillStyle(0xf1a6bd)
    graphics.fillEllipse(28, 16, 10, 13)
    graphics.fillTriangle(21, 32, 28, 39, 35, 32)
    saveTexture(graphics, VISUAL_TEXTURES.enemies.heavy, 56, 40)
}

const createCarrierEnemyTexture = (scene: Scene) => {
    const graphics = createGraphics(scene, VISUAL_TEXTURES.enemies.carrier)

    if (!graphics) {
        return
    }

    graphics.fillStyle(0x2e2545, 0.35)
    graphics.fillEllipse(25, 26, 49, 21)
    graphics.fillStyle(0x4c3c67)
    graphics.fillEllipse(25, 19, 41, 32)
    graphics.fillStyle(0x745a83)
    graphics.fillEllipse(25, 15, 30, 19)
    graphics.fillTriangle(11, 17, 1, 5, 6, 32)
    graphics.fillTriangle(39, 17, 49, 5, 44, 32)
    graphics.lineStyle(2, 0xd8b4e8)
    graphics.strokeEllipse(25, 19, 41, 32)
    graphics.fillStyle(0x92e6d0)
    graphics.fillCircle(25, 17, 8)
    graphics.fillStyle(0x243d48)
    graphics.fillCircle(25, 17, 4)
    graphics.fillStyle(0xd9f99d, 0.9)
    graphics.fillCircle(14, 27, 3)
    graphics.fillCircle(36, 27, 3)
    saveTexture(graphics, VISUAL_TEXTURES.enemies.carrier, 50, 42)
}
