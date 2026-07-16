import { Scene, Scenes } from 'phaser'
import type { ActiveModule } from '../types/gameplay'

type DebugOverlayData = {
    getLayerName: () => string
    getRunNumber: () => number
    getActiveGameObjectCount: () => number
    getActiveTimerCount: () => number
    getActiveTweenCount: () => number
    getEventHandlerCount: () => number
    getHealth: () => number
    getLastDamage: () => number
    getRunStatus: () => string
    getRunEndReason: () => string | undefined
    isPlayerInvulnerable: () => boolean
    getRemainingInvulnerabilityTime: () => number
    getRunTime: () => number
    getMissionProgress: () => number
    getMissionProgressSpeed: () => number
    getEnemySpawnIntervalMultiplier: () => number
    getBaseEnemySpawnInterval: () => number
    getEnemySpawnInterval: () => number
    getEnemySpeedMultiplier: () => number
    getScoreRewardMultiplier: () => number
    getLastBaseScoreReward: () => number
    getLastFinalScoreReward: () => number
    getEnemyTypeWeights: () => Readonly<Record<string, number>>
    getTimeUntilNextModuleSpawn: () => number
    getActiveModuleCount: () => number
    getModulePickupCount: () => number
    getCurrentFireRate: () => number
    getProjectilesPerShot: () => number
    getActiveModifiers: () => string[]
    getEnemyCount: () => number
    getShootingEnemyCount: () => number
    getPlayerProjectileCount: () => number
    getEnemyProjectileCount: () => number
    getActiveModules: () => ActiveModule[]
}

export class DebugOverlay {
    private readonly scene: Scene
    private readonly data: DebugOverlayData
    private readonly element: HTMLPreElement

    constructor(scene: Scene, data: DebugOverlayData) {
        this.scene = scene
        this.data = data
        this.element = document.createElement('pre')
        this.element.style.position = 'fixed'
        this.element.style.boxSizing = 'border-box'
        this.element.style.width = '220px'
        this.element.style.margin = '0'
        this.element.style.padding = '10px'
        this.element.style.background = 'rgba(0, 0, 0, 0.78)'
        this.element.style.color = '#ffffff'
        this.element.style.font = '14px/1.45 Courier New, monospace'
        this.element.style.whiteSpace = 'pre-wrap'
        this.element.style.pointerEvents = 'none'
        this.element.style.zIndex = '1000'

        document.body.append(this.element)
        scene.events.once(Scenes.Events.SHUTDOWN, () => this.destroy())

        this.update()
    }

    update() {
        const playerProjectiles = this.data.getPlayerProjectileCount()
        const enemyProjectiles = this.data.getEnemyProjectileCount()
        const activeModules = this.data.getActiveModules()
            .map((module) => this.formatActiveModule(module))
            .join(', ') || 'none'

        this.element.textContent = [
            'DEBUG',
            `Run number: ${this.data.getRunNumber()}`,
            `Phaser objects: ${this.data.getActiveGameObjectCount()}`,
            `Phaser timers: ${this.data.getActiveTimerCount()}`,
            `Phaser tweens: ${this.data.getActiveTweenCount()}`,
            `Event handlers: ${this.data.getEventHandlerCount()}`,
            `Layer: ${this.data.getLayerName()}`,
            `FPS: ${this.scene.game.loop.actualFps.toFixed(0)}`,
            `HP: ${this.data.getHealth()}`,
            `Last damage: ${this.data.getLastDamage()}`,
            `Run status: ${this.data.getRunStatus()}`,
            `Run end: ${this.data.getRunEndReason() ?? 'none'}`,
            `Invulnerable: ${this.data.isPlayerInvulnerable()}`,
            `Invulnerability: ${this.data.getRemainingInvulnerabilityTime().toFixed(0)}ms`,
            `Run: ${(this.data.getRunTime() / 1000).toFixed(1)}s`,
            `Progress: ${this.data.getMissionProgress().toFixed(1)}`,
            `Progress speed: ${this.formatSpeed()}/s`,
            `Spawn interval: x${this.data.getEnemySpawnIntervalMultiplier()}`,
            `Base spawn: ${this.data.getBaseEnemySpawnInterval().toFixed(0)}ms`,
            `Final spawn: ${this.data.getEnemySpawnInterval().toFixed(0)}ms`,
            `Enemy speed: x${this.data.getEnemySpeedMultiplier().toFixed(2)}`,
            `Score reward: x${this.data.getScoreRewardMultiplier()}`,
            `Last reward: ${this.data.getLastBaseScoreReward()} -> ${this.data.getLastFinalScoreReward()}`,
            `Enemy weights: ${this.formatEnemyTypeWeights()}`,
            `Next module: ${this.data.getTimeUntilNextModuleSpawn().toFixed(0)}ms`,
            `Active modules: ${this.data.getActiveModuleCount()}`,
            `Module pickups: ${this.data.getModulePickupCount()}`,
            `Fire rate: ${this.data.getCurrentFireRate().toFixed(0)}ms`,
            `Projectiles/shot: ${this.data.getProjectilesPerShot()}`,
            `Modifiers: ${this.data.getActiveModifiers().join(', ') || 'none'}`,
            `Enemies: ${this.data.getEnemyCount()}`,
            `Shooting enemies: ${this.data.getShootingEnemyCount()}`,
            `Enemy projectiles: ${enemyProjectiles}`,
            `Projectiles: ${playerProjectiles + enemyProjectiles}`,
            `  player/enemy: ${playerProjectiles}/${enemyProjectiles}`,
            `Modules: ${activeModules}`,
        ].join('\n')

        this.updatePosition()
    }

    private updatePosition() {
        const canvasBounds = this.scene.game.canvas.getBoundingClientRect()

        this.element.style.left = `${canvasBounds.right + 12}px`
        this.element.style.top = `${canvasBounds.top}px`
    }

    private formatSpeed() {
        const speed = this.data.getMissionProgressSpeed()

        return speed > 0 ? `+${speed}` : speed.toString()
    }

    private formatEnemyTypeWeights() {
        return Object.entries(this.data.getEnemyTypeWeights())
            .map(([type, weight]) => `${type}:${weight}`)
            .join(' ')
    }

    private formatActiveModule(module: ActiveModule) {
        if (module.remainingMs === undefined) {
            return module.label
        }

        return `${module.label} ${(module.remainingMs / 1000).toFixed(1)}s`
    }

    private destroy() {
        this.element.remove()
    }
}
