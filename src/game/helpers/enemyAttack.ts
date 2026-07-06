import { GameObjects } from 'phaser'
import { EnemyAttackType } from '../config/enemyConfig'
import type { Enemy, EnemyBullet } from '../types/gameplay'

type EnemyAttackScene = {
    add: GameObjects.GameObjectFactory
}

export const updateEnemyAttack = (
    scene: EnemyAttackScene,
    enemy: Enemy,
    enemyBullets: EnemyBullet[],
) => {
    if (!enemy.body.active || !enemy.attack) {
        return
    }

    if (enemy.age - enemy.lastAttackTime < enemy.attack.cooldown) {
        return
    }

    switch (enemy.attack.type) {
        case EnemyAttackType.SingleShot:
            enemy.lastAttackTime = enemy.age
            shootSingleEnemyBullet(scene, enemy, enemyBullets)
            return
    }
}

const shootSingleEnemyBullet = (
    scene: EnemyAttackScene,
    enemy: Enemy,
    enemyBullets: EnemyBullet[],
) => {
    if (!enemy.attack) {
        return
    }

    const bullet = scene.add.rectangle(
        enemy.body.x,
        enemy.body.y + enemy.body.height / 2,
        enemy.attack.bulletWidth,
        enemy.attack.bulletHeight,
        enemy.attack.bulletColor,
    )

    enemyBullets.push({
        object: bullet,
        speed: enemy.attack.bulletSpeed,
        damage: enemy.attack.damage,
    })
}
