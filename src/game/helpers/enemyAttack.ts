import { Scene } from 'phaser'
import { EnemyAttackType } from '../config/enemyConfig'
import type { Enemy } from '../entities/Enemy'
import { Projectile } from '../entities/Projectile'

export const updateEnemyAttack = (
    scene: Scene,
    enemy: Enemy,
    enemyBullets: Projectile[],
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
    scene: Scene,
    enemy: Enemy,
    enemyBullets: Projectile[],
) => {
    if (!enemy.attack) {
        return
    }

    enemyBullets.push(
        new Projectile(scene, {
            x: enemy.body.x,
            y: enemy.body.y + enemy.body.height / 2,
            width: enemy.attack.bulletWidth,
            height: enemy.attack.bulletHeight,
            color: enemy.attack.bulletColor,
            velocityX: 0,
            velocityY: enemy.attack.bulletSpeed,
            damage: enemy.attack.damage,
        }),
    )
}
