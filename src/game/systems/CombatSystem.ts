import { Geom, Scene } from 'phaser'
import type { GameConfig } from '../config'
import type { Enemy } from '../entities/Enemy'
import type { Player } from '../entities/Player'
import type { Projectile } from '../entities/Projectile'
import type { RunState } from '../state/RunState'
import type { EnemyType } from '../config/enemyConfig'

type CombatSystemCallbacks = {
    getPlayerProjectiles: () => Projectile[]
    setPlayerProjectiles: (projectiles: Projectile[]) => void
    getEnemies: () => Enemy[]
    setEnemies: (enemies: Enemy[]) => void
    getEnemyProjectiles: () => Projectile[]
    setEnemyProjectiles: (projectiles: Projectile[]) => void
    hasShield: () => boolean
    getScoreRewardMultiplier: () => number
    dropModule: (x: number, y: number) => void
    awardSalvage: (type: EnemyType) => void
    playerDied: () => void
    playTone: (
        frequency: number,
        duration: number,
        volume: number,
        type?: OscillatorType,
    ) => void
}

export class CombatSystem {
    private readonly scene: Scene
    private readonly config: GameConfig
    private readonly player: Player
    private readonly runState: RunState
    private readonly callbacks: CombatSystemCallbacks

    constructor(
        scene: Scene,
        config: GameConfig,
        player: Player,
        runState: RunState,
        callbacks: CombatSystemCallbacks,
    ) {
        this.scene = scene
        this.config = config
        this.player = player
        this.runState = runState
        this.callbacks = callbacks
    }

    update(time: number) {
        this.checkPlayerProjectileEnemyCollisions()
        this.checkEnemyProjectilePlayerCollisions(time)
        this.checkEnemyPlayerCollisions(time)
    }

    private checkPlayerProjectileEnemyCollisions() {
        const projectiles = this.callbacks.getPlayerProjectiles()
        const enemies = this.callbacks.getEnemies()

        projectiles.forEach((projectile) => {
            enemies.forEach((enemy) => {
                if (!projectile.object.active || !enemy.body.active) {
                    return
                }

                const isHit = Geom.Intersects.RectangleToRectangle(
                    projectile.object.getBounds(),
                    enemy.body.getBounds(),
                )

                if (!isHit) {
                    return
                }

                this.createHitEffect(projectile.object.x, projectile.object.y)
                this.callbacks.playTone(220, 0.06, 0.05, 'sawtooth')

                projectile.destroy()
                this.damageEnemy(enemy, projectile.damage)
            })
        })

        this.callbacks.setPlayerProjectiles(
            projectiles.filter((projectile) => projectile.object.active),
        )
        this.callbacks.setEnemies(
            enemies.filter((enemy) => enemy.body.active),
        )
    }

    private damageEnemy(enemy: Enemy, damage: number) {
        const deathX = enemy.body.x
        const deathY = enemy.body.y
        const isDestroyed = enemy.takeDamage(damage)

        if (!isDestroyed) {
            return
        }

        this.createEnemyDestroyedEffect(deathX, deathY)

        if (enemy.carriesModule) {
            this.callbacks.dropModule(deathX, deathY)
        }

        this.callbacks.awardSalvage(enemy.type)

        this.runState.awardScore(
            enemy.scoreReward,
            this.callbacks.getScoreRewardMultiplier(),
        )
    }

    private checkEnemyProjectilePlayerCollisions(time: number) {
        if (this.player.isInvulnerable()) {
            return
        }

        const projectiles = this.callbacks.getEnemyProjectiles()

        projectiles.forEach((projectile) => {
            if (
                !projectile.object.active ||
                this.runState.isGameOver() ||
                this.player.isInvulnerable()
            ) {
                return
            }

            const isHit = Geom.Intersects.RectangleToRectangle(
                projectile.object.getBounds(),
                this.player.object.getBounds(),
            )

            if (!isHit) {
                return
            }

            const hitX = projectile.object.x
            const hitY = projectile.object.y

            projectile.destroy()

            if (this.callbacks.hasShield()) {
                this.createHitEffect(hitX, hitY)

                return
            }

            this.damagePlayer(time, projectile.damage)
        })

        this.callbacks.setEnemyProjectiles(
            projectiles.filter((projectile) => projectile.object.active),
        )
    }

    private checkEnemyPlayerCollisions(time: number) {
        if (this.player.isInvulnerable()) {
            return
        }

        const enemies = this.callbacks.getEnemies()

        enemies.forEach((enemy) => {
            if (!enemy.body.active || this.runState.isGameOver()) {
                return
            }

            const isHit = Geom.Intersects.RectangleToRectangle(
                enemy.body.getBounds(),
                this.player.object.getBounds(),
            )

            if (!isHit) {
                return
            }

            enemy.destroy()

            if (this.callbacks.hasShield()) {
                this.createHitEffect(enemy.body.x, enemy.body.y)

                return
            }

            this.damagePlayer(time, this.config.player.damagePerHit)
        })

        this.callbacks.setEnemies(
            enemies.filter((enemy) => enemy.body.active),
        )
    }

    private damagePlayer(time: number, damage: number) {
        const isDead = this.player.takeDamage(time, damage)

        if (isDead === undefined) {
            return
        }

        this.createPlayerDamageEffect()
        this.callbacks.playTone(150, 0.12, 0.08, 'square')

        if (isDead) {
            this.callbacks.playerDied()
        }
    }

    private createHitEffect(x: number, y: number) {
        const effect = this.scene.add.circle(x, y, 8, 0xffffff, 0.95)
        effect.setStrokeStyle(2, this.config.bullet.color)

        this.scene.tweens.add({
            targets: effect,
            alpha: 0,
            scale: 2.2,
            duration: 150,
            onComplete: () => {
                effect.destroy()
            },
        })

        this.createRadialParticles(x, y, 5, this.config.bullet.color, 32, 170)
    }

    private createEnemyDestroyedEffect(x: number, y: number) {
        const core = this.scene.add.circle(x, y, 14, 0xf2c4e0, 0.9)
        const ring = this.scene.add.circle(x, y, 20)
            .setStrokeStyle(4, 0x9ceacb, 0.85)

        this.scene.tweens.add({
            targets: core,
            alpha: 0,
            scale: 2.8,
            duration: 260,
            onComplete: () => core.destroy(),
        })
        this.scene.tweens.add({
            targets: ring,
            alpha: 0,
            scale: 2.25,
            duration: 360,
            onComplete: () => ring.destroy(),
        })
        this.createRadialParticles(x, y, 9, 0xd59cc9, 58, 330)
        this.createRadialParticles(x, y, 5, 0xb9e18d, 38, 240)
    }

    private createPlayerDamageEffect() {
        const effect = this.scene.add.circle(
            this.player.object.x,
            this.player.object.y,
            16,
            0xffffff,
            0.85,
        )

        effect.setStrokeStyle(3, this.config.enemy.types.basic.color)

        this.scene.tweens.add({
            targets: effect,
            alpha: 0,
            scale: 2.2,
            duration: 160,
            onComplete: () => {
                effect.destroy()
            },
        })
        this.createRadialParticles(
            this.player.object.x,
            this.player.object.y,
            8,
            0xef8354,
            48,
            250,
        )
    }

    private createRadialParticles(
        x: number,
        y: number,
        count: number,
        color: number,
        distance: number,
        duration: number,
    ) {
        for (let index = 0; index < count; index++) {
            const angle = Math.PI * 2 * index / count + Math.random() * 0.35
            const particle = this.scene.add.ellipse(
                x,
                y,
                3 + index % 2 * 2,
                7,
                color,
                0.9,
            ).setRotation(angle)

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                scaleY: 0.25,
                duration: duration + index * 9,
                ease: 'Quad.easeOut',
                onComplete: () => particle.destroy(),
            })
        }
    }
}
