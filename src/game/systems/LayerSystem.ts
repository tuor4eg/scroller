import { Input, Scene, Types } from 'phaser'
import type { MissionConfig } from '../types/mission'

type LayerConfig = MissionConfig['layers']

export class LayerSystem {
    private readonly config: LayerConfig
    private readonly scene: Scene
    private readonly cursors: Types.Input.Keyboard.CursorKeys
    private currentLayerIndex: number

    constructor(
        scene: Scene,
        config: LayerConfig,
    ) {
        this.scene = scene
        this.config = config
        this.cursors = scene.input.keyboard!.createCursorKeys()
        this.currentLayerIndex = config.initialLayerIndex
        this.applyCurrentLayer()
    }

    update() {
        if (Input.Keyboard.JustDown(this.cursors.up)) {
            return this.setLayer(this.currentLayerIndex - 1)
        }

        if (Input.Keyboard.JustDown(this.cursors.down)) {
            return this.setLayer(this.currentLayerIndex + 1)
        }

        return false
    }

    getCurrentLayer() {
        return this.config.items[this.currentLayerIndex]
    }

    private setLayer(index: number) {
        const nextLayerIndex = Math.max(
            0,
            Math.min(this.config.items.length - 1, index),
        )

        if (nextLayerIndex === this.currentLayerIndex) {
            return false
        }

        this.currentLayerIndex = nextLayerIndex
        this.applyCurrentLayer()

        return true
    }

    private applyCurrentLayer() {
        this.scene.cameras.main.setBackgroundColor(
            this.getCurrentLayer().backgroundColor,
        )
    }
}
