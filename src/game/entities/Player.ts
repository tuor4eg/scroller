import { GameObjects, Math as PhaserMath, Scene } from 'phaser'
import type { GameConfig } from '../config'
import type { WeaponParameters } from '../types/gameplay'
import { VISUAL_TEXTURES } from '../visuals/visualAssets'
import { Projectile } from './Projectile'

export class Player {
    readonly object: GameObjects.Image

    private readonly scene: Scene
    private readonly config: GameConfig['player']
    private readonly bulletConfig: GameConfig['bullet']
    private health: number
    private lastDamage = 0
    private lastShotTime = 0
    private invulnerable = false
    private invulnerableUntil = 0

    constructor(
        scene: Scene,
        config: GameConfig['player'],
        bulletConfig: GameConfig['bullet'],
        x: number,
        y: number,
    ) {
        this.scene = scene
        this.config = config
        this.bulletConfig = bulletConfig
        this.health = config.maxHealth
        this.object = this.createObject(x, y)
    }

    update(time: number) {
        this.updateInvulnerability(time)
    }

    move(horizontalDirection: number, delta: number) {
        const deltaInSeconds = delta / 1000
        const distance = this.config.speed * deltaInSeconds

        this.object.x += horizontalDirection * distance

        const halfPlayerWidth = this.object.width / 2

        this.object.x = PhaserMath.Clamp(
            this.object.x,
            halfPlayerWidth,
            this.scene.scale.width - halfPlayerWidth,
        )
    }

    shoot(
        time: number,
        weaponParameters: WeaponParameters,
        addProjectile: (projectile: Projectile) => void,
    ) {
        if (time - this.lastShotTime <= weaponParameters.fireRate) {
            return false
        }

        weaponParameters.bulletAngles.forEach((angle) => {
            addProjectile(this.createProjectile(angle))
        })
        this.lastShotTime = time

        return true
    }

    getMaxHealth() {
        return this.config.maxHealth
    }

    getHealth() {
        return this.health
    }

    getLastDamage() {
        return this.lastDamage
    }

    takeDamage(time: number, damage: number) {
        if (this.invulnerable) {
            return undefined
        }

        this.health = PhaserMath.Clamp(
            this.health - damage,
            0,
            this.config.maxHealth,
        )
        this.lastDamage = damage

        if (this.health <= 0) {
            return true
        }

        this.startInvulnerability(time)

        return false
    }

    heal(amount: number) {
        this.health = PhaserMath.Clamp(
            this.health + amount,
            0,
            this.config.maxHealth,
        )

        return this.health
    }

    isInvulnerable() {
        return this.invulnerable
    }

    getRemainingInvulnerabilityTime(time: number) {
        if (!this.invulnerable) {
            return 0
        }

        return Math.max(0, this.invulnerableUntil - time)
    }

    private startInvulnerability(time: number) {
        this.invulnerable = true
        this.invulnerableUntil = time + this.config.invulnerabilityDuration
        this.object.setAlpha(this.config.invulnerableAlpha)
    }

    private updateInvulnerability(time: number) {
        if (!this.invulnerable) {
            return
        }

        if (time >= this.invulnerableUntil) {
            this.invulnerable = false
            this.object.setAlpha(this.config.defaultAlpha)

            return
        }

        const blinkStep = Math.floor(
            time / this.config.invulnerableBlinkInterval,
        )

        this.object.setAlpha(
            blinkStep % 2 === 0
                ? this.config.defaultAlpha
                : this.config.invulnerableAlpha,
        )
    }

    private createProjectile(angle: number) {
        const angleInRadians = PhaserMath.DegToRad(angle)

        return new Projectile(this.scene, {
            x: this.object.x,
            y: this.object.y - this.bulletConfig.yOffset,
            width: this.bulletConfig.width,
            height: this.bulletConfig.height,
            color: this.bulletConfig.color,
            velocityX: Math.cos(angleInRadians) * this.bulletConfig.speed,
            velocityY: Math.sin(angleInRadians) * this.bulletConfig.speed,
            damage: this.bulletConfig.damage,
        })
    }

    private createObject(x: number, y: number) {
        const object = this.scene.add.image(x, y, VISUAL_TEXTURES.player)
        object.setDisplaySize(this.config.width, this.config.height)

        return object
    }
}
