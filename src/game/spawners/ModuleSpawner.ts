import { Math as PhaserMath, Scene } from 'phaser'
import type { ModuleConfig } from '../config/moduleConfig'
import { ModulePickup } from '../entities/ModulePickup'

export class ModuleSpawner {
    private readonly scene: Scene
    private readonly config: ModuleConfig
    private readonly addPickup: (pickup: ModulePickup) => void
    private lastSpawnTime = 0

    constructor(
        scene: Scene,
        config: ModuleConfig,
        addPickup: (pickup: ModulePickup) => void,
    ) {
        this.scene = scene
        this.config = config
        this.addPickup = addPickup
    }

    update(time: number) {
        if (time - this.lastSpawnTime <= this.config.spawnRate) {
            return
        }

        this.lastSpawnTime = time

        if (PhaserMath.Between(1, 100) > this.config.spawnChance) {
            return
        }

        const x = PhaserMath.Between(
            this.config.width / 2,
            this.scene.scale.width - this.config.width / 2,
        )

        this.createPickup(x, -this.config.height)
    }

    drop(x: number, y: number) {
        this.createPickup(x, y)
    }

    reset(time: number) {
        this.lastSpawnTime = time
    }

    getTimeUntilNextSpawn(time: number) {
        return Math.max(0, this.config.spawnRate - (time - this.lastSpawnTime))
    }

    private createPickup(x: number, y: number) {
        this.addPickup(new ModulePickup(this.scene, this.config, x, y))
    }
}
