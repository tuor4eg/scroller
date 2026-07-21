import { GameObjects, Math as PhaserMath, Scene } from 'phaser'
import type { EnemyConfig, EnemyType } from '../config/enemyConfig'
import { updateEnemyAttack } from '../helpers/enemyAttack'
import { updateEnemyMovement } from '../helpers/enemyMovement'
import type { EnemyAttack, EnemyMovement } from '../types/gameplay'
import type { Projectile } from './Projectile'
import { getEnemyTexture } from '../visuals/visualAssets'

export class Enemy {
    readonly body: GameObjects.Image
    readonly type: EnemyType
    readonly movement: EnemyMovement
    readonly attack?: EnemyAttack
    readonly spawnX: number
    readonly carriesModule: boolean
    readonly speed: number
    readonly scoreReward: number

    age = 0
    lastAttackTime: number

    private readonly scene: Scene
    private readonly config: EnemyConfig
    private readonly maxHitPoints: number
    private hitPoints: number
    private label?: GameObjects.Text
    private healthBarBackground?: GameObjects.Rectangle
    private healthBarFill?: GameObjects.Rectangle

    constructor(
        scene: Scene,
        config: EnemyConfig,
        x: number,
        y: number,
        type: EnemyType,
        carriesModule: boolean,
    ) {
        this.scene = scene
        this.config = config
        this.type = type
        this.spawnX = x
        this.carriesModule = carriesModule

        const typeConfig = config.types[type]
        this.movement = typeConfig.movement
        this.attack = 'attack' in typeConfig ? typeConfig.attack : undefined
        this.lastAttackTime = this.attack ? -this.attack.cooldown : 0
        this.speed = typeConfig.speed
        this.scoreReward = typeConfig.scoreReward
        this.maxHitPoints = typeConfig.hitPoints
        this.hitPoints = typeConfig.hitPoints
        this.body = this.createBody(x, y, typeConfig)

        this.createHealthBar(x, y)
        this.createLabel(x, y)
    }

    update(delta: number, speedMultiplier: number, enemyBullets: Projectile[]) {
        const distance = this.speed * speedMultiplier * delta / 1000

        this.age += delta
        updateEnemyMovement(this, distance)
        updateEnemyAttack(this.scene, this, enemyBullets)

        if (this.label) {
            this.label.setPosition(this.body.x, this.label.y + distance)
        }

        this.updateHealthBarPosition()
    }

    takeDamage(damage: number) {
        if (!this.body.active) {
            return false
        }

        this.hitPoints -= damage

        if (this.hitPoints > 0) {
            this.updateHealthBar()

            return false
        }

        this.destroy()

        return true
    }

    isOutside(height: number) {
        return this.body.y > height + this.body.height
    }

    destroy() {
        this.body.destroy()
        this.label?.destroy()
        this.healthBarBackground?.destroy()
        this.healthBarFill?.destroy()
    }

    private createBody(
        x: number,
        y: number,
        typeConfig: EnemyConfig['types'][EnemyType],
    ) {
        const body = this.scene.add.image(x, y, getEnemyTexture(this.type))
        body.setDisplaySize(typeConfig.width, typeConfig.height)

        return body
    }

    private createHealthBar(x: number, y: number) {
        if (this.maxHitPoints <= 1) {
            return
        }

        const healthBarY = y - this.body.height / 2 - this.config.healthBarOffsetY
        const healthBarX = x - this.config.healthBarWidth / 2

        this.healthBarBackground = this.scene.add.rectangle(
            x,
            healthBarY,
            this.config.healthBarWidth,
            this.config.healthBarHeight,
            this.config.healthBarBackgroundColor,
        )
        this.healthBarFill = this.scene.add.rectangle(
            healthBarX,
            healthBarY,
            this.config.healthBarWidth,
            this.config.healthBarHeight,
            this.config.healthBarColor,
        ).setOrigin(0, 0.5)
    }

    private createLabel(x: number, y: number) {
        if (!this.carriesModule) {
            return
        }

        this.label = this.scene.add.text(
            x,
            y + this.body.height * 0.38,
            '◆',
            {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#7dd3fc',
            },
        ).setOrigin(0.5)
    }

    private updateHealthBarPosition() {
        if (!this.healthBarBackground || !this.healthBarFill) {
            return
        }

        const y = this.body.y - this.body.height / 2 - this.config.healthBarOffsetY

        this.healthBarBackground.setPosition(this.body.x, y)
        this.healthBarFill.setPosition(
            this.body.x - this.config.healthBarWidth / 2,
            y,
        )
    }

    private updateHealthBar() {
        if (!this.healthBarFill) {
            return
        }

        const healthRatio = PhaserMath.Clamp(
            this.hitPoints / this.maxHitPoints,
            0,
            1,
        )

        this.healthBarFill.setDisplaySize(
            this.config.healthBarWidth * healthRatio,
            this.config.healthBarHeight,
        )
    }
}
