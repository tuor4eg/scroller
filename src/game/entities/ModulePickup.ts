import { GameObjects, Math as PhaserMath, Scene } from 'phaser'
import type { ModuleConfig } from '../config/moduleConfig'

export class ModulePickup {
    readonly body: GameObjects.Rectangle
    readonly type: string

    private readonly label: GameObjects.Text
    private readonly speed: number

    constructor(scene: Scene, config: ModuleConfig, x: number, y: number) {
        const clampedX = PhaserMath.Clamp(
            x,
            config.width / 2,
            scene.scale.width - config.width / 2,
        )

        this.type = config.labels[
            PhaserMath.Between(0, config.labels.length - 1)
        ]
        this.speed = config.speed
        this.body = scene.add.rectangle(
            clampedX,
            y,
            config.width,
            config.height,
            config.color,
        )
        this.body.setStrokeStyle(config.strokeWidth, config.strokeColor)
        this.label = scene.add.text(clampedX, this.body.y, this.type, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#111827',
        }).setOrigin(0.5)
    }

    update(delta: number) {
        this.body.y += this.speed * delta / 1000
        this.label.y = this.body.y
    }

    collect(apply: (type: string) => void) {
        apply(this.type)
        this.destroy()
    }

    isOutside(height: number) {
        return this.body.y > height + this.body.height
    }

    destroy() {
        this.body.destroy()
        this.label.destroy()
    }
}
