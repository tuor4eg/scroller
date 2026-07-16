import { Math as PhaserMath, Scene } from 'phaser'
import type { GameConfig } from '../config'
import type { EnemyType } from '../config/enemyConfig'
import { Enemy } from '../entities/Enemy'
import type { RunState } from '../state/RunState'

type EnemyTypeWeights = (
    GameConfig['layers']['items'][number]['enemyTypeWeights']
)

export class EnemySpawner {
    private readonly scene: Scene
    private readonly config: GameConfig
    private readonly runState: RunState
    private readonly addEnemy: (enemy: Enemy) => void
    private lastSpawnTime = 0

    constructor(
        scene: Scene,
        config: GameConfig,
        runState: RunState,
        addEnemy: (enemy: Enemy) => void,
    ) {
        this.scene = scene
        this.config = config
        this.runState = runState
        this.addEnemy = addEnemy
    }

    update(
        intervalMultiplier: number,
        enemyTypeWeights: EnemyTypeWeights,
    ) {
        const gameplayTime = this.runState.getGameplayTime()

        if (
            gameplayTime - this.lastSpawnTime <=
            this.getSpawnInterval(intervalMultiplier)
        ) {
            return
        }

        this.spawn(enemyTypeWeights)
        this.lastSpawnTime = gameplayTime
    }

    reset() {
        this.lastSpawnTime = this.runState.getGameplayTime()
    }

    getBaseSpawnInterval() {
        const gameplaySeconds = (
            this.runState.getGameplayTime() /
            this.config.time.millisecondsPerSecond
        )
        const scaledSpawnInterval = (
            this.config.enemy.spawnRate -
            gameplaySeconds * this.config.enemy.spawnRateDecreasePerSecond
        )

        return PhaserMath.Clamp(
            scaledSpawnInterval,
            this.config.enemy.minSpawnRate,
            this.config.enemy.spawnRate,
        )
    }

    getSpawnInterval(intervalMultiplier: number) {
        return this.getBaseSpawnInterval() * intervalMultiplier
    }

    getEnemySpeedMultiplier() {
        const gameplaySeconds = (
            this.runState.getGameplayTime() /
            this.config.time.millisecondsPerSecond
        )

        return (
            this.config.enemy.initialSpeedTimeMultiplier +
            gameplaySeconds *
                this.config.enemy.speedTimeMultiplierIncreasePerSecond
        )
    }

    private spawn(enemyTypeWeights: EnemyTypeWeights) {
        const carriesModule = (
            PhaserMath.Between(1, 100) <= this.config.enemy.carrierSpawnChance
        )
        const enemyType = this.getEnemyType(carriesModule, enemyTypeWeights)
        const enemyConfig = this.config.enemy.types[enemyType]
        const minSpawnX = Math.max(
            enemyConfig.width / 2,
            this.config.player.width / 2,
        )
        const maxSpawnX = Math.min(
            this.scene.scale.width - enemyConfig.width / 2,
            this.scene.scale.width - this.config.player.width / 2,
        )
        const x = PhaserMath.Between(minSpawnX, maxSpawnX)

        this.addEnemy(new Enemy(
            this.scene,
            this.config.enemy,
            x,
            -enemyConfig.height,
            enemyType,
            carriesModule,
        ))
    }

    private getEnemyType(
        carriesModule: boolean,
        enemyTypeWeights: EnemyTypeWeights,
    ): EnemyType {
        if (carriesModule) {
            return 'carrier'
        }

        const roll = PhaserMath.Between(1, 100)

        if (roll <= enemyTypeWeights.basic) {
            return 'basic'
        }

        if (roll <= enemyTypeWeights.basic + enemyTypeWeights.sturdy) {
            return 'sturdy'
        }

        return 'heavy'
    }

}
