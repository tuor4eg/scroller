import { GameObjects, Math as PhaserMath, Scene } from 'phaser'

type Cloud = {
    object: GameObjects.Ellipse
    speed: number
    drift: number
}

type Island = {
    object: GameObjects.Container
    speed: number
}

export class SkyBackground {
    private readonly scene: Scene
    private readonly sky: GameObjects.Rectangle
    private readonly haze: GameObjects.Rectangle
    private readonly fogBands: GameObjects.Ellipse[] = []
    private readonly clouds: Cloud[] = []
    private readonly islands: Island[] = []
    private fogStrength = 0

    constructor(scene: Scene, layerId: string) {
        this.scene = scene
        this.sky = scene.add.rectangle(
            0,
            0,
            scene.scale.width,
            scene.scale.height,
            0x78c9e8,
        ).setOrigin(0).setDepth(-100)
        this.haze = scene.add.rectangle(
            0,
            scene.scale.height * 0.48,
            scene.scale.width,
            scene.scale.height * 0.52,
            0x65766c,
            0,
        ).setOrigin(0).setDepth(-72)

        this.createClouds()
        this.createIslands()
        this.createFog()
        this.setLayer(layerId, false)
    }

    update(delta: number) {
        const seconds = delta / 1000

        this.clouds.forEach((cloud) => {
            cloud.object.y += cloud.speed * seconds
            cloud.object.x += cloud.drift * seconds

            if (cloud.object.y > this.scene.scale.height + 45) {
                cloud.object.y = -45
                cloud.object.x = PhaserMath.Between(-20, this.scene.scale.width + 20)
            }
        })

        this.islands.forEach((island) => {
            island.object.y += island.speed * seconds

            if (island.object.y > this.scene.scale.height + 80) {
                island.object.y = PhaserMath.Between(-300, -100)
                island.object.x = PhaserMath.Between(35, this.scene.scale.width - 35)
            }
        })

        this.fogBands.forEach((band, index) => {
            band.y += (7 + index * 2) * seconds

            if (band.y > this.scene.scale.height + 55) {
                band.y = this.scene.scale.height * 0.48 - 40
                band.x = PhaserMath.Between(-20, this.scene.scale.width + 20)
            }
        })
    }

    setLayer(layerId: string, animate = true) {
        const isFogBoundary = layerId === 'fog-boundary'
        const targetFogStrength = isFogBoundary ? 1 : 0.28

        if (!animate) {
            this.applyLayer(targetFogStrength)
            return
        }

        this.scene.tweens.addCounter({
            from: this.fogStrength,
            to: targetFogStrength,
            duration: 380,
            onUpdate: (tween) => {
                this.applyLayer(tween.getValue() ?? targetFogStrength)
            },
        })

        const flash = this.scene.add.rectangle(
            0,
            0,
            this.scene.scale.width,
            this.scene.scale.height,
            isFogBoundary ? 0xb7c9aa : 0xdff6ff,
            0.32,
        ).setOrigin(0).setDepth(80)

        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 420,
            onComplete: () => flash.destroy(),
        })
    }

    destroy() {
        this.sky.destroy()
        this.haze.destroy()
        this.clouds.forEach((cloud) => cloud.object.destroy())
        this.islands.forEach((island) => island.object.destroy())
        this.fogBands.forEach((band) => band.destroy())
    }

    private applyLayer(strength: number) {
        this.fogStrength = strength
        this.sky.setFillStyle(
            strength > 0.6 ? 0x688a91 : 0x78c9e8,
        )
        this.haze.setAlpha(0.16 + strength * 0.42)
        this.fogBands.forEach((band, index) => {
            band.setAlpha((0.08 + index * 0.035) * strength)
        })
    }

    private createClouds() {
        for (let index = 0; index < 12; index++) {
            const cloud = this.scene.add.ellipse(
                PhaserMath.Between(-20, this.scene.scale.width + 20),
                PhaserMath.Between(-40, this.scene.scale.height),
                PhaserMath.Between(55, 130),
                PhaserMath.Between(14, 28),
                0xf4fbff,
                PhaserMath.FloatBetween(0.09, 0.24),
            ).setDepth(-90 + index % 2)

            this.clouds.push({
                object: cloud,
                speed: index % 2 === 0 ? 13 : 24,
                drift: index % 3 - 1,
            })
        }
    }

    private createIslands() {
        for (let index = 0; index < 5; index++) {
            const x = PhaserMath.Between(45, this.scene.scale.width - 45)
            const y = PhaserMath.Between(-80, this.scene.scale.height)
            const shadow = this.scene.add.ellipse(0, 4, 74, 25, 0x263b3d, 0.48)
            const rock = this.scene.add.triangle(0, 20, -32, -4, 32, -4, 0, 58, 0x53615b, 0.72)
            const grass = this.scene.add.ellipse(0, -4, 76, 23, 0x6b8f63, 0.8)
            const island = this.scene.add.container(x, y, [rock, shadow, grass])
                .setScale(index % 2 === 0 ? 0.65 : 0.42)
                .setDepth(-82)

            this.islands.push({ object: island, speed: index % 2 === 0 ? 18 : 10 })
        }
    }

    private createFog() {
        for (let index = 0; index < 9; index++) {
            const band = this.scene.add.ellipse(
                PhaserMath.Between(-20, this.scene.scale.width + 20),
                this.scene.scale.height * 0.48 + index * 42,
                PhaserMath.Between(150, 280),
                PhaserMath.Between(50, 90),
                index % 2 === 0 ? 0xc2d0b4 : 0x7f9180,
                0.1,
            ).setDepth(-70 + index)

            this.fogBands.push(band)
        }
    }
}
