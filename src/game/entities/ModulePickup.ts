import { GameObjects, Math as PhaserMath, Scene } from 'phaser'
import type { ModuleConfig } from '../config/moduleConfig'
import { VISUAL_TEXTURES } from '../visuals/visualAssets'

export class ModulePickup {
    readonly body: GameObjects.Image
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
        this.body = scene.add.image(
            clampedX,
            y,
            VISUAL_TEXTURES.module,
        )
        this.body.setDisplaySize(config.width, config.height)
        this.label = scene.add.text(clampedX + 8, this.body.y, this.type, {
            fontFamily: 'Arial',
            fontSize: '12px',
            fontStyle: 'bold',
            color: '#e0f2fe',
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
