import { GameObjects, Input } from 'phaser'
import type {
    EnemyAttackType,
    EnemyMovementType,
    EnemyType,
} from '../config/enemyConfig'
import type { ModuleKind } from '../config/moduleConfig'

export type EnemyMovement = {
    type: EnemyMovementType
    amplitude?: number
    speed?: number
}

export type EnemyAttack = {
    type: EnemyAttackType
    cooldown: number
    bulletSpeed: number
    bulletWidth: number
    bulletHeight: number
    bulletColor: number
    damage: number
}

export type GameKeys = {
    left: Input.Keyboard.Key
    right: Input.Keyboard.Key
    shoot: Input.Keyboard.Key
}

export type Star = {
    object: GameObjects.Arc
    speed: number
}

export type Bullet = {
    object: GameObjects.Rectangle
    velocityX: number
    velocityY: number
    damage: number
}

export type Enemy = {
    body: GameObjects.Polygon
    label?: GameObjects.Text
    type: EnemyType
    movement: EnemyMovement
    attack?: EnemyAttack
    lastAttackTime: number
    spawnX: number
    age: number
    carriesModule: boolean
    speed: number
    scoreReward: number
    hitPoints: number
    maxHitPoints: number
    healthBarBackground?: GameObjects.Rectangle
    healthBarFill?: GameObjects.Rectangle
}

export type EnemyBullet = {
    object: GameObjects.Rectangle
    speed: number
    damage: number
}

export type ModulePickup = {
    body: GameObjects.Rectangle
    label: GameObjects.Text
    type: string
}

export type ActiveModule = {
    type: string
    label: string
    kind: ModuleKind.Temporary | ModuleKind.Permanent
    remainingMs?: number
    order: number
}
