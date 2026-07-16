import { GameObjects, Input } from 'phaser'
import type { EnemyAttackType, EnemyMovementType } from '../config/enemyConfig'
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

export type WeaponParameters = {
    fireRate: number
    bulletAngles: number[]
}

export type Star = {
    object: GameObjects.Arc
    speed: number
}

export type ActiveModule = {
    type: string
    label: string
    kind: ModuleKind.Temporary | ModuleKind.Permanent
    remainingMs?: number
    order: number
}
