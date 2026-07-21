import { GameObjects, Scene } from 'phaser'
import { VISUAL_TEXTURES } from '../visuals/visualAssets'

type ProjectileConfig = {
    x: number
    y: number
    width: number
    height: number
    color: number
    velocityX: number
    velocityY: number
    damage: number
}

export class Projectile {
    readonly object: GameObjects.Image
    readonly damage: number

    private readonly velocityX: number
    private readonly velocityY: number

    constructor(scene: Scene, config: ProjectileConfig) {
        const texture = config.velocityY < 0
            ? VISUAL_TEXTURES.playerProjectile
            : VISUAL_TEXTURES.enemyProjectile

        this.object = scene.add.image(
            config.x,
            config.y,
            texture,
        )
        this.object.setDisplaySize(config.width, config.height)
        this.object.setRotation(Math.atan2(config.velocityY, config.velocityX) + Math.PI / 2)
        this.velocityX = config.velocityX
        this.velocityY = config.velocityY
        this.damage = config.damage
    }

    update(delta: number, speedMultiplier: number = 1) {
        const deltaInSeconds = delta / 1000

        this.object.x += this.velocityX * speedMultiplier * deltaInSeconds
        this.object.y += this.velocityY * speedMultiplier * deltaInSeconds
    }

    isAbove(y: number) {
        return this.object.y < y
    }

    isBelow(height: number) {
        return this.object.y > height + this.object.height
    }

    isOutsideHorizontal(width: number) {
        return (
            this.object.x < -this.object.width ||
            this.object.x > width + this.object.width
        )
    }

    destroy() {
        this.object.destroy()
    }
}
