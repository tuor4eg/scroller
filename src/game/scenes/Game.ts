import { GameObjects, Geom, Math as PhaserMath, Scene, Scenes } from 'phaser'
import { GAME_CONFIG, type GameConfig } from '../config'
import { PlayerController } from '../controllers/PlayerController'
import { Enemy } from '../entities/Enemy'
import { ModulePickup } from '../entities/ModulePickup'
import { Player } from '../entities/Player'
import { Projectile } from '../entities/Projectile'
import { EnemySpawner } from '../spawners/EnemySpawner'
import { ModuleSpawner } from '../spawners/ModuleSpawner'
import { RunState } from '../state/RunState'
import { CombatSystem } from '../systems/CombatSystem'
import { CleanupSystem } from '../systems/CleanupSystem'
import { LayerSystem } from '../systems/LayerSystem'
import { MissionProgress } from '../systems/MissionProgress'
import { ModuleSystem } from '../systems/ModuleSystem'
import { RunSystem } from '../systems/RunSystem'
import type { Star } from '../types/gameplay'
import { DebugOverlay } from '../ui/DebugOverlay'
import { countEventListeners } from '../helpers/countEventListeners'
import type { UIScene } from './UIScene'

const DEBUG_OVERLAY_ENABLED = (
    import.meta.env.DEV && import.meta.env.VITE_DEBUG_OVERLAY !== 'false'
)

export class Game extends Scene {
    private readonly config: GameConfig = GAME_CONFIG
    private audioContext?: AudioContext

    private stars!: Star[]

    private bullets!: Projectile[]

    private enemies!: Enemy[]
    private enemySpawner!: EnemySpawner
    private enemyBullets!: Projectile[]

    private modulePickups!: ModulePickup[]
    private moduleSpawner!: ModuleSpawner
    private moduleSystem!: ModuleSystem

    private player!: Player
    private playerController!: PlayerController
    private layerSystem!: LayerSystem
    private shieldVisual!: GameObjects.Arc

    private runState!: RunState
    private runSystem!: RunSystem
    private combatSystem!: CombatSystem
    private cleanupSystem!: CleanupSystem
    private missionProgress!: MissionProgress
    private debugOverlay?: DebugOverlay
    private runNumber = 0

    constructor() {
        super('Game')
    }

    create(data: { autoStart?: boolean } = {}) {
        this.runNumber += 1
        this.resetGameState()
        this.events.once(Scenes.Events.SHUTDOWN, () => this.cleanupRun())

        const { width, height } = this.scale

        this.createStarfield(width, height)
        this.enemySpawner = new EnemySpawner(
            this,
            this.config,
            this.runState,
            (enemy) => {
                this.enemies.push(enemy)
            },
        )
        this.moduleSpawner = new ModuleSpawner(
            this,
            this.config.module,
            (pickup) => {
                this.modulePickups.push(pickup)
            },
        )

        this.player = new Player(
            this,
            this.config.player,
            this.config.bullet,
            width / 2,
            height - this.config.player.bottomOffset,
        )
        this.playerController = new PlayerController(this, this.player)
        this.layerSystem = new LayerSystem(
            this,
            this.config.layers,
        )
        this.shieldVisual = this.createShieldVisual()
        this.runSystem = new RunSystem(this, this.runState, () => {
            this.playTone(120, 0.35, 0.08, 'sawtooth')
        })

        this.moduleSystem = new ModuleSystem(
            this.config.module,
            this.player,
            {
                playPickupTone: () => this.playTone(880, 0.08, 0.06),
            },
        )
        this.missionProgress = new MissionProgress(
            this.config.missionProgress,
            this.runState,
        )
        this.cleanupSystem = new CleanupSystem(this, this.config)
        this.combatSystem = new CombatSystem(
            this,
            this.config,
            this.player,
            this.runState,
            {
                getPlayerProjectiles: () => this.bullets,
                setPlayerProjectiles: (projectiles) => {
                    this.bullets = projectiles
                },
                getEnemies: () => this.enemies,
                setEnemies: (enemies) => {
                    this.enemies = enemies
                },
                getEnemyProjectiles: () => this.enemyBullets,
                setEnemyProjectiles: (projectiles) => {
                    this.enemyBullets = projectiles
                },
                hasShield: () => this.hasShieldModule(),
                getScoreRewardMultiplier: () => {
                    return this.layerSystem.getCurrentLayer()
                        .scoreRewardMultiplier
                },
                dropModule: (x, y) => this.moduleSpawner.drop(x, y),
                playerDied: () => {
                    this.runSystem.finish('defeat', 'player-death')
                },
                playTone: (frequency, duration, volume, type) => {
                    this.playTone(frequency, duration, volume, type)
                },
            },
        )
        this.createDebugOverlay()
        this.scene.launch('UI', {
            gameScene: this,
            runState: this.runState,
            player: this.player,
            moduleSystem: this.moduleSystem,
            startGame: () => this.runSystem.start(),
            restartGame: () => this.runSystem.restart(),
        })

        if (data.autoStart) {
            this.runSystem.start()
        }
    }

    private createStarfield(width: number, height: number) {
        this.stars = []

        for (let i = 0; i < this.config.starfield.count; i++) {
            const radius = PhaserMath.FloatBetween(
                this.config.starfield.minRadius,
                this.config.starfield.maxRadius,
            )

            const star = this.add.circle(
                PhaserMath.Between(0, width),
                PhaserMath.Between(0, height),
                radius,
                this.config.starfield.color,
                PhaserMath.FloatBetween(
                    this.config.starfield.minAlpha,
                    this.config.starfield.maxAlpha,
                ),
            )

            star.setDepth(this.config.starfield.depth)

            this.stars.push({
                object: star,
                speed: PhaserMath.Between(
                    this.config.starfield.minSpeed,
                    this.config.starfield.maxSpeed,
                ),
            })
        }
    }

    update(time: number, delta: number) {
        this.updateStarfield(delta)
        this.debugOverlay?.update()

        if (!this.runSystem.update(delta)) {
            return
        }

        this.player.update(time)
        this.playerController.update(time, delta, (shootTime) => {
            const didShoot = this.player.shoot(
                shootTime,
                this.moduleSystem.getWeaponParameters(this.config.bullet),
                (projectile) => this.bullets.push(projectile),
            )

            if (didShoot) {
                this.playTone(620, 0.035, 0.035, 'square')
            }
        })

        if (this.layerSystem.update()) {
            this.resetLayerObjects(time)
        }

        const missionResult = this.missionProgress.update(
            delta,
            this.layerSystem.getCurrentLayer().missionProgressPerSecond,
        )

        if (missionResult) {
            this.runSystem.finish(
                missionResult,
                missionResult === 'victory'
                    ? 'mission-complete'
                    : 'mission-failed',
            )

            return
        }

        this.updateBullets(delta)

        this.enemySpawner.update(
            this.layerSystem.getCurrentLayer().enemySpawnIntervalMultiplier,
            this.layerSystem.getCurrentLayer().enemyTypeWeights,
        )

        this.updateEnemies(delta)
        this.updateEnemyBullets(delta)

        this.moduleSpawner.update(time)

        this.updateModulePickups(delta)
        this.checkModulePlayerCollisions()
        this.moduleSystem.update(delta)
        this.updateShieldVisual()
        this.combatSystem.update(time)
    }

    private updateStarfield(delta: number) {
        const deltaInSeconds = delta / this.config.time.millisecondsPerSecond

        this.stars.forEach((star) => {
            star.object.y += star.speed * deltaInSeconds

            if (star.object.y <= this.scale.height + this.config.starfield.loopOffset) {
                return
            }

            star.object.x = PhaserMath.Between(0, this.scale.width)
            star.object.y = -this.config.starfield.loopOffset
        })
    }

    private hasShieldModule() {
        return this.moduleSystem.hasActive(this.config.module.effects.shield.type)
    }

    private createShieldVisual() {
        const shield = this.add.circle(
            this.player.object.x,
            this.player.object.y,
            this.config.module.effects.shield.radius,
        )

        shield.setStrokeStyle(
            this.config.module.effects.shield.strokeWidth,
            this.config.module.effects.shield.color,
            this.config.module.effects.shield.alpha,
        )
        shield.setVisible(false)

        return shield
    }

    private updateShieldVisual() {
        this.shieldVisual.setPosition(this.player.object.x, this.player.object.y)
        this.shieldVisual.setVisible(this.hasShieldModule())
    }

    private updateBullets(delta: number) {
        this.bullets.forEach((bullet) => {
            bullet.update(delta)
        })

        this.bullets = this.cleanupSystem.cleanupPlayerProjectiles(this.bullets)
    }

    private updateEnemies(delta: number) {
        const speedTimeMultiplier = this.enemySpawner.getEnemySpeedMultiplier()

        this.enemies.forEach((enemy) => {
            enemy.update(delta, speedTimeMultiplier, this.enemyBullets)
        })

        this.enemies = this.cleanupSystem.cleanupEnemies(this.enemies)
    }

    private updateEnemyBullets(delta: number) {
        const speedTimeMultiplier = this.enemySpawner.getEnemySpeedMultiplier()

        this.enemyBullets.forEach((bullet) => {
            bullet.update(delta, speedTimeMultiplier)
        })

        this.enemyBullets = this.cleanupSystem.cleanupEnemyProjectiles(
            this.enemyBullets,
        )
    }

    private updateModulePickups(delta: number) {
        this.modulePickups.forEach((module) => {
            module.update(delta)
        })

        this.modulePickups = this.cleanupSystem.cleanupModulePickups(
            this.modulePickups,
        )
    }

    private checkModulePlayerCollisions() {
        this.modulePickups.forEach((module) => {
            if (!module.body.active) {
                return
            }

            const isCollected = Geom.Intersects.RectangleToRectangle(
                module.body.getBounds(),
                this.player.object.getBounds(),
            )

            if (!isCollected) {
                return
            }

            module.collect((type) => this.moduleSystem.collect(type))
        })

        this.modulePickups = this.modulePickups.filter((module) => {
            return module.body.active
        })
    }

    private resetGameState() {
        this.runState = new RunState(
            this.config.score.initial,
            this.config.missionProgress.initial,
            this.config.missionProgress.min,
            this.config.missionProgress.max,
        )

        this.bullets = []
        this.enemies = []
        this.enemyBullets = []
        this.modulePickups = []
    }

    private resetLayerObjects(time: number) {
        this.enemies.forEach((enemy) => enemy.destroy())
        this.bullets.forEach((bullet) => bullet.destroy())
        this.enemyBullets.forEach((bullet) => bullet.destroy())
        this.modulePickups.forEach((module) => module.destroy())

        this.enemies = []
        this.bullets = []
        this.enemyBullets = []
        this.modulePickups = []

        this.enemySpawner.reset()
        this.moduleSpawner.reset(time)
    }

    private createDebugOverlay() {
        if (!DEBUG_OVERLAY_ENABLED) {
            return
        }

        this.debugOverlay = new DebugOverlay(this, {
            getLayerName: () => this.layerSystem.getCurrentLayer().name,
            getRunNumber: () => this.runNumber,
            getActiveGameObjectCount: () => this.getActiveGameObjectCount(),
            getActiveTimerCount: () => this.getActiveTimerCount(),
            getActiveTweenCount: () => this.tweens.getTweens().length,
            getEventHandlerCount: () => this.getEventHandlerCount(),
            getHealth: () => this.player.getHealth(),
            getLastDamage: () => this.player.getLastDamage(),
            getRunEndReason: () => this.runState.getEndReason(),
            getRunStatus: () => this.runState.getStatus(),
            isPlayerInvulnerable: () => this.player.isInvulnerable(),
            getRemainingInvulnerabilityTime: () => {
                return this.player.getRemainingInvulnerabilityTime(this.time.now)
            },
            getRunTime: () => this.runState.getGameplayTime(),
            getMissionProgress: () => this.runState.getMissionProgress(),
            getMissionProgressSpeed: () => {
                return this.layerSystem.getCurrentLayer()
                    .missionProgressPerSecond
            },
            getEnemySpawnIntervalMultiplier: () => {
                return this.layerSystem.getCurrentLayer()
                    .enemySpawnIntervalMultiplier
            },
            getBaseEnemySpawnInterval: () => {
                return this.enemySpawner.getBaseSpawnInterval()
            },
            getEnemySpawnInterval: () => {
                return this.enemySpawner.getSpawnInterval(
                    this.layerSystem.getCurrentLayer()
                        .enemySpawnIntervalMultiplier,
                )
            },
            getEnemySpeedMultiplier: () => {
                return this.enemySpawner.getEnemySpeedMultiplier()
            },
            getScoreRewardMultiplier: () => {
                return this.layerSystem.getCurrentLayer()
                    .scoreRewardMultiplier
            },
            getLastBaseScoreReward: () => {
                return this.runState.getLastBaseScoreReward()
            },
            getLastFinalScoreReward: () => {
                return this.runState.getLastFinalScoreReward()
            },
            getEnemyTypeWeights: () => {
                return this.layerSystem.getCurrentLayer().enemyTypeWeights
            },
            getTimeUntilNextModuleSpawn: () => {
                return this.moduleSpawner.getTimeUntilNextSpawn(this.time.now)
            },
            getActiveModuleCount: () => {
                return this.moduleSystem.getActiveModules().length
            },
            getModulePickupCount: () => {
                return this.modulePickups.filter((pickup) => pickup.body.active)
                    .length
            },
            getCurrentFireRate: () => {
                return this.moduleSystem.getWeaponParameters(this.config.bullet)
                    .fireRate
            },
            getProjectilesPerShot: () => {
                return this.moduleSystem.getWeaponParameters(this.config.bullet)
                    .bulletAngles.length
            },
            getActiveModifiers: () => {
                return this.moduleSystem.getActiveModules()
                    .map((module) => module.label)
            },
            getEnemyCount: () => {
                return this.enemies.filter((enemy) => enemy.body.active).length
            },
            getShootingEnemyCount: () => {
                return this.enemies.filter((enemy) => {
                    return enemy.body.active && enemy.attack !== undefined
                }).length
            },
            getPlayerProjectileCount: () => {
                return this.bullets.filter((bullet) => bullet.object.active)
                    .length
            },
            getEnemyProjectileCount: () => {
                return this.enemyBullets.filter((bullet) => bullet.object.active)
                    .length
            },
            getActiveModules: () => this.moduleSystem.getActiveModules(),
        })
    }

    private getActiveTimerCount() {
        const clock = this.time as typeof this.time & {
            _active: unknown[]
            _pendingInsertion: unknown[]
        }

        return clock._active.length + clock._pendingInsertion.length
    }

    private getActiveGameObjectCount() {
        const gameObjectCount = this.children.list.filter((gameObject) => {
            return gameObject.active
        }).length

        if (!this.scene.isActive('UI')) {
            return gameObjectCount
        }

        const uiScene = this.scene.get('UI') as UIScene

        return gameObjectCount + uiScene.getActiveGameObjectCount()
    }

    private getEventHandlerCount() {
        const gameHandlerCount = countEventListeners(this.events) +
            countEventListeners(this.input) +
            countEventListeners(this.input.keyboard)

        if (!this.scene.isActive('UI')) {
            return gameHandlerCount
        }

        const uiScene = this.scene.get('UI') as UIScene

        return gameHandlerCount + uiScene.getEventHandlerCount()
    }

    private cleanupRun() {
        this.enemies.forEach((enemy) => enemy.destroy())
        this.bullets.forEach((bullet) => bullet.destroy())
        this.enemyBullets.forEach((bullet) => bullet.destroy())
        this.modulePickups.forEach((module) => module.destroy())
        this.stars.forEach((star) => star.object.destroy())
        this.player.object.destroy()
        this.shieldVisual.destroy()

        this.enemies = []
        this.bullets = []
        this.enemyBullets = []
        this.modulePickups = []
        this.stars = []
        this.debugOverlay = undefined

        this.time.removeAllEvents()
        this.tweens.killAll()
        this.input.keyboard?.removeAllKeys(true)
    }

    private playTone(
        frequency: number,
        duration: number,
        volume: number,
        type: OscillatorType = 'sine',
    ) {
        const audioContext = this.getAudioContext()

        if (!audioContext) {
            return
        }

        const oscillator = audioContext.createOscillator()
        const gain = audioContext.createGain()
        const now = audioContext.currentTime

        oscillator.type = type
        oscillator.frequency.setValueAtTime(frequency, now)
        gain.gain.setValueAtTime(volume, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

        oscillator.connect(gain)
        gain.connect(audioContext.destination)
        oscillator.addEventListener('ended', () => {
            oscillator.disconnect()
            gain.disconnect()
        }, { once: true })

        oscillator.start(now)
        oscillator.stop(now + duration)
    }

    private getAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new AudioContext()
        }

        if (this.audioContext.state === 'suspended') {
            void this.audioContext.resume()
        }

        return this.audioContext
    }
}
