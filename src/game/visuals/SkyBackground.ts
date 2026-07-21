import { GameObjects, Math as PhaserMath, Scene } from 'phaser'

type DriftingObject = {
    object: GameObjects.Container
    speed: number
    drift: number
    phase: number
}

type FogWisp = {
    object: GameObjects.Ellipse
    baseX: number
    speed: number
    phase: number
}

export class SkyBackground {
    private readonly scene: Scene
    private readonly sky: GameObjects.Rectangle
    private readonly lowerTint: GameObjects.Rectangle
    private readonly cloudLayer: GameObjects.Container
    private readonly islandLayer: GameObjects.Container
    private readonly submergedLayer: GameObjects.Container
    private readonly fogLayer: GameObjects.Container
    private readonly boundary: GameObjects.Graphics
    private readonly clouds: DriftingObject[] = []
    private readonly islands: DriftingObject[] = []
    private readonly fogWisps: FogWisp[] = []
    private elapsed = 0
    private fogStrength = 0

    constructor(scene: Scene, layerId: string) {
        this.scene = scene
        this.sky = scene.add.rectangle(
            0,
            0,
            scene.scale.width,
            scene.scale.height,
            0xa9dce8,
        ).setOrigin(0).setDepth(-100)
        this.lowerTint = scene.add.rectangle(
            0,
            0,
            scene.scale.width,
            scene.scale.height,
            0x263f3e,
            0,
        ).setOrigin(0).setDepth(-91)
        this.submergedLayer = scene.add.container(0, 0).setDepth(-89)
        this.islandLayer = scene.add.container(0, 0).setDepth(-87)
        this.cloudLayer = scene.add.container(0, 0).setDepth(-84)
        this.fogLayer = scene.add.container(0, 0).setDepth(-80)
        this.boundary = scene.add.graphics().setDepth(-74)

        this.createSubmergedShapes()
        this.createIslands()
        this.createClouds()
        this.createFog()
        this.setLayer(layerId, false)
    }

    update(delta: number) {
        const seconds = delta / 1000
        this.elapsed += seconds

        this.clouds.forEach((cloud) => this.updateDrifter(cloud, seconds, 90))
        this.islands.forEach((island) => this.updateDrifter(island, seconds, 150))
        this.fogWisps.forEach((wisp, index) => {
            wisp.object.y += wisp.speed * seconds
            wisp.object.x = wisp.baseX + Math.sin(this.elapsed * 0.55 + wisp.phase) * 24
            wisp.object.rotation = Math.sin(this.elapsed * 0.32 + index) * 0.08

            if (wisp.object.y > this.scene.scale.height + 90) {
                wisp.object.y = -90
                wisp.baseX = PhaserMath.Between(-30, this.scene.scale.width + 30)
            }
        })

        this.drawFogSurface()
    }

    setLayer(layerId: string, animate = true) {
        const targetFogStrength = layerId === 'fog-boundary' ? 1 : 0.08

        if (!animate) {
            this.applyLayer(targetFogStrength)
            return
        }

        this.scene.tweens.addCounter({
            from: this.fogStrength,
            to: targetFogStrength,
            duration: 520,
            ease: 'Sine.easeInOut',
            onUpdate: (tween) => {
                this.applyLayer(tween.getValue() ?? targetFogStrength)
            },
        })

        const transitionRing = this.scene.add.ellipse(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            this.scene.scale.width * 0.45,
            90,
        ).setStrokeStyle(8, layerId === 'fog-boundary' ? 0xb4d486 : 0xeafcff, 0.7)
            .setDepth(80)

        this.scene.tweens.add({
            targets: transitionRing,
            alpha: 0,
            scaleX: 2.8,
            scaleY: 4.2,
            duration: 560,
            ease: 'Quad.easeOut',
            onComplete: () => transitionRing.destroy(),
        })
    }

    destroy() {
        this.sky.destroy()
        this.lowerTint.destroy()
        this.cloudLayer.destroy(true)
        this.islandLayer.destroy(true)
        this.submergedLayer.destroy(true)
        this.fogLayer.destroy(true)
        this.boundary.destroy()
    }

    private applyLayer(strength: number) {
        this.fogStrength = strength
        this.sky.setFillStyle(strength > 0.55 ? 0x496f6a : 0xa9dce8)
        this.lowerTint.setAlpha(strength * 0.72)
        this.fogLayer.setAlpha(0.08 + strength * 0.82)
        this.boundary.setAlpha(0.12 + strength * 0.88)
        this.submergedLayer.setAlpha(strength * 0.3)
        this.cloudLayer.setAlpha(1 - strength * 0.82)
        this.islandLayer.setAlpha(0.5 - strength * 0.32)
    }

    private updateDrifter(drifter: DriftingObject, seconds: number, loopMargin: number) {
        drifter.object.y += drifter.speed * seconds
        drifter.object.x += drifter.drift * seconds
        drifter.object.rotation = Math.sin(this.elapsed * 0.18 + drifter.phase) * 0.025

        if (drifter.object.y > this.scene.scale.height + loopMargin) {
            drifter.object.y = PhaserMath.Between(-loopMargin * 2, -loopMargin)
            drifter.object.x = PhaserMath.Between(30, this.scene.scale.width - 30)
        }
    }

    private createClouds() {
        const positions = [[72, 570], [386, 655], [445, 480]]

        positions.forEach(([x, y], index) => {
            const shadow = this.scene.add.ellipse(4, 7, 92, 34, 0x6d9ca5, 0.16)
            const cloud = this.scene.add.container(x, y, [
                shadow,
                this.scene.add.ellipse(-22, 0, 54, 30, 0xf8feff, 0.68),
                this.scene.add.ellipse(14, -3, 68, 38, 0xffffff, 0.75),
                this.scene.add.ellipse(42, 3, 45, 25, 0xeaf8fb, 0.64),
                this.scene.add.ellipse(7, 6, 90, 22, 0xe1f2f5, 0.5),
            ]).setScale(index === 1 ? 0.75 : 0.58)

            this.cloudLayer.add(cloud)
            this.clouds.push({
                object: cloud,
                speed: 10 + index * 3,
                drift: index % 2 === 0 ? 1.2 : -0.8,
                phase: index * 1.8,
            })
        })
    }

    private createIslands() {
        const islandData = [
            { x: 92, y: 165, scale: 1.2, speed: 6 },
            { x: 398, y: 410, scale: 0.65, speed: 10 },
            { x: 275, y: -90, scale: 0.82, speed: 8 },
        ]

        islandData.forEach((data, index) => {
            const island = this.scene.add.container(data.x, data.y, [
                this.scene.add.ellipse(7, 12, 122, 55, 0x38565b, 0.22),
                this.scene.add.ellipse(0, 0, 118, 56, 0x57766d, 0.78),
                this.scene.add.ellipse(-8, -4, 91, 40, 0x809d72, 0.78),
                this.scene.add.ellipse(-22, -9, 37, 18, 0xa8b987, 0.65),
                this.scene.add.ellipse(26, 5, 29, 17, 0x46665c, 0.8),
                this.scene.add.ellipse(0, 0, 118, 56).setStrokeStyle(2, 0xd5ddb0, 0.22),
            ]).setScale(data.scale)

            this.islandLayer.add(island)
            this.islands.push({
                object: island,
                speed: data.speed,
                drift: index === 1 ? -0.5 : 0.35,
                phase: index * 2.4,
            })
        })
    }

    private createSubmergedShapes() {
        const shapes = [
            this.scene.add.ellipse(76, 190, 220, 88, 0x172f31, 0.42).setRotation(-0.25),
            this.scene.add.ellipse(410, 515, 250, 105, 0x173132, 0.38).setRotation(0.18),
            this.scene.add.ellipse(230, 690, 145, 58, 0x102829, 0.35),
        ]

        shapes.forEach((shape) => {
            shape.setStrokeStyle(9, 0x78906d, 0.08)
            this.submergedLayer.add(shape)
        })
    }

    private createFog() {
        const colors = [0x789475, 0x9aac7c, 0x506f64, 0xb0ba83]

        for (let index = 0; index < 16; index++) {
            const wisp = this.scene.add.ellipse(
                PhaserMath.Between(-40, this.scene.scale.width + 40),
                PhaserMath.Between(-80, this.scene.scale.height + 80),
                PhaserMath.Between(150, 300),
                PhaserMath.Between(65, 130),
                colors[index % colors.length],
                PhaserMath.FloatBetween(0.1, 0.24),
            )
            const baseX = wisp.x

            this.fogLayer.add(wisp)
            this.fogWisps.push({
                object: wisp,
                baseX,
                speed: 7 + index % 4 * 3,
                phase: index * 0.9,
            })
        }
    }

    private drawFogSurface() {
        this.boundary.clear()

        for (let index = 0; index < 14; index++) {
            const column = index % 4
            const row = Math.floor(index / 4)
            const phase = this.elapsed * (0.42 + index % 3 * 0.08) + index * 1.7
            const x = 48 + column * 128 + Math.sin(phase) * 34
            const y = 70 + row * 205 + Math.cos(phase * 0.76) * 38
            const radius = 24 + index % 3 * 11 + Math.sin(phase * 1.4) * 5

            this.boundary.lineStyle(
                2 + index % 2,
                index % 2 === 0 ? 0xc6d58f : 0x385f57,
                0.06 + this.fogStrength * 0.1,
            )
            this.boundary.strokeEllipse(
                x,
                y,
                radius * 2.3,
                radius,
            )

            if (index % 3 === 0) {
                this.boundary.fillStyle(0xe0eca6, 0.08 + this.fogStrength * 0.12)
                this.boundary.fillCircle(
                    x + Math.cos(phase) * radius,
                    y + Math.sin(phase) * radius * 0.4,
                    2 + index % 2,
                )
            }
        }
    }
}
