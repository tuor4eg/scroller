import { EnemyMovementType } from '../config/enemyConfig'
import type { Enemy } from '../types/gameplay'

export const updateEnemyMovement = (enemy: Enemy, distance: number) => {
    enemy.body.y += distance

    if (enemy.movement.type !== EnemyMovementType.Sine) {
        return
    }

    enemy.body.x = (
        enemy.spawnX +
        Math.sin(enemy.age * (enemy.movement.speed ?? 0)) *
            (enemy.movement.amplitude ?? 0)
    )
}
