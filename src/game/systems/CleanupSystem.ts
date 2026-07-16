import { Scene } from 'phaser'
import type { GameConfig } from '../config'
import type { Enemy } from '../entities/Enemy'
import type { ModulePickup } from '../entities/ModulePickup'
import type { Projectile } from '../entities/Projectile'

export class CleanupSystem {
    private readonly scene: Scene
    private readonly config: GameConfig

    constructor(scene: Scene, config: GameConfig) {
        this.scene = scene
        this.config = config
    }

    cleanupPlayerProjectiles(projectiles: Projectile[]) {
        return projectiles.filter((projectile) => {
            if (!projectile.object.active) {
                return false
            }

            if (
                projectile.isAbove(this.config.bullet.destroyY) ||
                projectile.isOutsideHorizontal(this.scene.scale.width)
            ) {
                projectile.destroy()

                return false
            }

            return true
        })
    }

    cleanupEnemies(enemies: Enemy[]) {
        return enemies.filter((enemy) => {
            if (!enemy.body.active) {
                return false
            }

            if (enemy.isOutside(this.scene.scale.height)) {
                enemy.destroy()

                return false
            }

            return true
        })
    }

    cleanupEnemyProjectiles(projectiles: Projectile[]) {
        return projectiles.filter((projectile) => {
            if (!projectile.object.active) {
                return false
            }

            if (projectile.isBelow(this.scene.scale.height)) {
                projectile.destroy()

                return false
            }

            return true
        })
    }

    cleanupModulePickups(pickups: ModulePickup[]) {
        return pickups.filter((pickup) => {
            if (!pickup.body.active) {
                return false
            }

            if (pickup.isOutside(this.scene.scale.height)) {
                pickup.destroy()

                return false
            }

            return true
        })
    }
}
