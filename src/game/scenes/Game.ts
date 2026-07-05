import { GameObjects, Input, Math as PhaserMath, Scene, Types, Geom } from 'phaser'
import { GAME_CONFIG, type GameConfig } from '../config'
import {
    createHud,
    setGameOverVisible,
    setPauseVisible,
    updateLivesText,
    updateModuleSlotTexts,
    updateScoreText,
    type Hud,
} from '../ui/hud'

type GameKeys = {
    left: Input.Keyboard.Key
    right: Input.Keyboard.Key
    shoot: Input.Keyboard.Key
}

type Star = {
    object: GameObjects.Arc
    speed: number
}

type Bullet = {
    object: GameObjects.Rectangle
    velocityX: number
    velocityY: number
    damage: number
}

type Enemy = {
    body: GameObjects.Polygon
    label?: GameObjects.Text
    carriesModule: boolean
    hitPoints: number
    maxHitPoints: number
    healthBarBackground?: GameObjects.Rectangle
    healthBarFill?: GameObjects.Rectangle
}

type ModulePickup = {
    body: GameObjects.Rectangle
    label: GameObjects.Text
    type: string
}

type ActiveModule = {
    type: string
    label: string
    remainingMs: number
    order: number
}

export class Game extends Scene {
    private readonly config: GameConfig = GAME_CONFIG
    private audioContext?: AudioContext

    private stars!: Star[]

    private bullets!: Bullet[]
    private lastShotTime = 0

    private enemies!: Enemy[]
    private lastEnemySpawnTime = 0
    private gameplayTime = 0

    private modulePickups!: ModulePickup[]
    private activeModules!: ActiveModule[]
    private lastModuleSpawnTime = 0
    private nextModuleOrder = 0

    private player!: GameObjects.Polygon
    private shieldVisual!: GameObjects.Arc
    private cursors!: Types.Input.Keyboard.CursorKeys
    private keys!: GameKeys

    private score = this.config.score.initial
    private hud!: Hud

    private isGameOver = false
    private restartKey!: Input.Keyboard.Key

    private isPaused = false

    private lives = this.config.player.initialLives

    private isInvulnerable = false
    private invulnerableUntil = 0

    constructor() {
        super('Game')
    }

    create() {
        this.resetGameState()

        const { width, height } = this.scale

        this.createStarfield(width, height)

        this.player = this.createPlayer(
            width / 2,
            height - this.config.player.bottomOffset,
        )
        this.shieldVisual = this.createShieldVisual()

        this.cursors = this.input.keyboard!.createCursorKeys()

        this.keys = {
            left: this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.D),
            shoot: this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.SPACE),
        }

        this.restartKey = this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.ENTER)

        this.hud = createHud(this, this.config)
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

    private createPlayer(x: number, y: number) {
        const playerWidth = this.config.player.width
        const playerHeight = this.config.player.height

        const shipPoints = [
            playerWidth / 2,
            0,
            playerWidth,
            playerHeight,
            playerWidth / 2,
            playerHeight * 0.78,
            0,
            playerHeight,
        ]

        const player = this.add.polygon(
            x,
            y,
            shipPoints,
            this.config.player.color,
        )

        player.setStrokeStyle(
            this.config.player.strokeWidth,
            this.config.player.strokeColor,
        )

        return player
    }

    update(time: number, delta: number) {
        this.updateStarfield(delta)

        if (this.isGameOver) {
            if (this.restartKey.isDown) {
                this.scene.restart()
            }

            return
        }

        if (Input.Keyboard.JustDown(this.restartKey)) {
            this.togglePause()
        }

        if (this.isPaused) {
            return
        }

        const deltaInSeconds = delta / this.config.time.millisecondsPerSecond
        this.gameplayTime += delta
        const distance = this.config.player.speed * deltaInSeconds

        if (this.cursors.left.isDown || this.keys.left.isDown) {
            this.player.x -= distance
        }

        if (this.cursors.right.isDown || this.keys.right.isDown) {
            this.player.x += distance
        }

        const halfPlayerWidth = this.player.width / 2

        this.player.x = PhaserMath.Clamp(
            this.player.x,
            halfPlayerWidth,
            this.scale.width - halfPlayerWidth,
        )

        if (
            this.keys.shoot.isDown &&
            time - this.lastShotTime > this.getCurrentFireRate()
        ) {
            this.shoot()
            this.lastShotTime = time
        }

        this.updateBullets(delta)

        if (
            this.gameplayTime - this.lastEnemySpawnTime >
            this.getCurrentEnemySpawnRate()
        ) {
            this.spawnEnemy()
            this.lastEnemySpawnTime = this.gameplayTime
        }

        this.updateEnemies(delta)

        if (time - this.lastModuleSpawnTime > this.config.module.spawnRate) {
            this.trySpawnModule()
            this.lastModuleSpawnTime = time
        }

        this.updateModulePickups(delta)
        this.checkModulePlayerCollisions()
        this.updateActiveModules(delta)
        this.updateShieldVisual()
        this.updatePlayerInvulnerability(time)

        this.checkBulletEnemyCollisions()

        this.checkEnemyPlayerCollisions(time)
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

    private shoot() {
        this.playTone(620, 0.035, 0.035, 'square')

        this.getBulletAngles().forEach((angle) => {
            this.createBullet(angle)
        })
    }

    private createBullet(angle: number) {
        const angleInRadians = PhaserMath.DegToRad(angle)

        const bullet = this.add.rectangle(
            this.player.x,
            this.player.y - this.config.bullet.yOffset,
            this.config.bullet.width,
            this.config.bullet.height,
            this.config.bullet.color,
        )

        this.bullets.push({
            object: bullet,
            velocityX: Math.cos(angleInRadians) * this.config.bullet.speed,
            velocityY: Math.sin(angleInRadians) * this.config.bullet.speed,
            damage: this.config.bullet.damage,
        })
    }

    private getBulletAngles() {
        const spreadShot = this.config.module.effects.spreadShot

        if (!this.hasActiveModule(spreadShot.type)) {
            return [-90]
        }

        const angleStep = spreadShot.fanAngle / (spreadShot.bulletCount - 1)
        const startAngle = -90 - spreadShot.fanAngle / 2

        return Array.from({ length: spreadShot.bulletCount }, (_value, index) => {
            return startAngle + index * angleStep
        })
    }

    private getCurrentFireRate() {
        const rapidFire = this.config.module.effects.rapidFire

        if (this.hasActiveModule(rapidFire.type)) {
            return this.config.bullet.fireRate * rapidFire.fireRateMultiplier
        }

        return this.config.bullet.fireRate
    }

    private hasActiveModule(type: string) {
        return this.activeModules.some((module) => {
            return module.type === type
        })
    }

    private hasShieldModule() {
        return this.hasActiveModule(this.config.module.effects.shield.type)
    }

    private createShieldVisual() {
        const shield = this.add.circle(
            this.player.x,
            this.player.y,
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
        this.shieldVisual.setPosition(this.player.x, this.player.y)
        this.shieldVisual.setVisible(this.hasShieldModule())
    }

    private updateBullets(delta: number) {
        const deltaInSeconds = delta / this.config.time.millisecondsPerSecond

        this.bullets.forEach((bullet) => {
            bullet.object.x += bullet.velocityX * deltaInSeconds
            bullet.object.y += bullet.velocityY * deltaInSeconds
        })

        this.bullets = this.bullets.filter((bullet) => {
            if (
                bullet.object.y < this.config.bullet.destroyY ||
                bullet.object.x < -bullet.object.width ||
                bullet.object.x > this.scale.width + bullet.object.width
            ) {
                bullet.object.destroy()

                return false
            }

            return true
        })
    }

    private spawnEnemy() {
        const carriesModule = (
            PhaserMath.Between(1, 100) <= this.config.enemy.carrierSpawnChance
        )
        const enemyWidth = this.getEnemyWidth(carriesModule)
        const enemyHeight = this.getEnemyHeight(carriesModule)
        const minSpawnX = Math.max(
            enemyWidth / 2,
            this.config.player.width / 2,
        )
        const maxSpawnX = Math.min(
            this.scale.width - enemyWidth / 2,
            this.scale.width - this.config.player.width / 2,
        )

        const x = PhaserMath.Between(
            minSpawnX,
            maxSpawnX,
        )

        const enemy = this.createEnemy(x, -enemyHeight, carriesModule)

        this.enemies.push(enemy)
    }

    private createEnemy(x: number, y: number, carriesModule: boolean) {
        const enemyWidth = this.getEnemyWidth(carriesModule)
        const enemyHeight = this.getEnemyHeight(carriesModule)
        const maxHitPoints = carriesModule
            ? this.config.enemy.carrierHitPoints
            : this.config.enemy.hitPoints

        const enemyPoints = [
            0,
            0,
            enemyWidth,
            0,
            enemyWidth * 0.82,
            enemyHeight,
            enemyWidth * 0.5,
            enemyHeight * 0.68,
            enemyWidth * 0.18,
            enemyHeight,
        ]

        const enemy = this.add.polygon(
            x,
            y,
            enemyPoints,
            carriesModule
                ? this.config.enemy.carrierColor
                : this.config.enemy.color,
        )

        enemy.setStrokeStyle(
            this.config.enemy.strokeWidth,
            this.config.enemy.strokeColor,
        )

        const createdEnemy: Enemy = {
            body: enemy,
            carriesModule,
            hitPoints: maxHitPoints,
            maxHitPoints,
        }

        if (maxHitPoints > 1) {
            const healthBarY = y - enemyHeight / 2 - this.config.enemy.healthBarOffsetY
            const healthBarX = x - this.config.enemy.healthBarWidth / 2

            createdEnemy.healthBarBackground = this.add.rectangle(
                x,
                healthBarY,
                this.config.enemy.healthBarWidth,
                this.config.enemy.healthBarHeight,
                this.config.enemy.healthBarBackgroundColor,
            )

            createdEnemy.healthBarFill = this.add.rectangle(
                healthBarX,
                healthBarY,
                this.config.enemy.healthBarWidth,
                this.config.enemy.healthBarHeight,
                this.config.enemy.healthBarColor,
            ).setOrigin(0, 0.5)
        }

        if (!carriesModule) {
            return createdEnemy
        }

        const label = this.add.text(
            x,
            y + enemyHeight * 0.38,
            this.config.enemy.carrierLabel,
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff',
            },
        ).setOrigin(0.5)

        createdEnemy.label = label

        return createdEnemy
    }

    private getEnemyWidth(carriesModule: boolean) {
        return carriesModule
            ? this.config.enemy.width
            : this.config.enemy.width * this.config.enemy.baseScale
    }

    private getEnemyHeight(carriesModule: boolean) {
        return carriesModule
            ? this.config.enemy.height
            : this.config.enemy.height * this.config.enemy.baseScale
    }

    private updateEnemies(delta: number) {
        const deltaInSeconds = delta / this.config.time.millisecondsPerSecond
        const distance = this.getCurrentEnemySpeed() * deltaInSeconds

        this.enemies.forEach((enemy) => {
            enemy.body.y += distance

            if (enemy.label) {
                enemy.label.y += distance
            }

            this.updateEnemyHealthBarPosition(enemy)
        })

        this.enemies = this.enemies.filter((enemy) => {
            if (enemy.body.y > this.scale.height + enemy.body.height) {
                this.destroyEnemy(enemy)

                return false
            }

            return true
        })
    }

    private destroyEnemy(enemy: Enemy) {
        enemy.body.destroy()
        enemy.label?.destroy()
        enemy.healthBarBackground?.destroy()
        enemy.healthBarFill?.destroy()
    }

    private updateEnemyHealthBarPosition(enemy: Enemy) {
        if (!enemy.healthBarBackground || !enemy.healthBarFill) {
            return
        }

        const y = enemy.body.y - enemy.body.height / 2 - this.config.enemy.healthBarOffsetY

        enemy.healthBarBackground.setPosition(enemy.body.x, y)
        enemy.healthBarFill.setPosition(
            enemy.body.x - this.config.enemy.healthBarWidth / 2,
            y,
        )
    }

    private updateEnemyHealthBar(enemy: Enemy) {
        if (!enemy.healthBarFill) {
            return
        }

        const healthRatio = PhaserMath.Clamp(
            enemy.hitPoints / enemy.maxHitPoints,
            0,
            1,
        )

        enemy.healthBarFill.setDisplaySize(
            this.config.enemy.healthBarWidth * healthRatio,
            this.config.enemy.healthBarHeight,
        )
    }

    private getCurrentEnemySpeed() {
        const gameplaySeconds = this.gameplayTime / this.config.time.millisecondsPerSecond

        return (
            this.config.enemy.speed +
            gameplaySeconds * this.config.enemy.speedIncreasePerSecond
        )
    }

    private getCurrentEnemySpawnRate() {
        const gameplaySeconds = this.gameplayTime / this.config.time.millisecondsPerSecond
        const scaledSpawnRate = (
            this.config.enemy.spawnRate -
            gameplaySeconds * this.config.enemy.spawnRateDecreasePerSecond
        )

        return PhaserMath.Clamp(
            scaledSpawnRate,
            this.config.enemy.minSpawnRate,
            this.config.enemy.spawnRate,
        )
    }

    private trySpawnModule() {
        const shouldSpawn = (
            PhaserMath.Between(1, 100) <= this.config.module.spawnChance
        )

        if (!shouldSpawn) {
            return
        }

        this.spawnModule()
    }

    private spawnModule() {
        const moduleWidth = this.config.module.width
        const x = PhaserMath.Between(
            moduleWidth / 2,
            this.scale.width - moduleWidth / 2,
        )

        this.createModulePickup(x, -this.config.module.height)
    }

    private dropModule(x: number, y: number) {
        this.createModulePickup(x, y)
    }

    private createModulePickup(x: number, y: number) {
        const moduleWidth = this.config.module.width
        const clampedX = PhaserMath.Clamp(
            x,
            moduleWidth / 2,
            this.scale.width - moduleWidth / 2,
        )
        const label = this.config.module.labels[
            PhaserMath.Between(0, this.config.module.labels.length - 1)
        ]

        const body = this.add.rectangle(
            clampedX,
            y,
            this.config.module.width,
            this.config.module.height,
            this.config.module.color,
        )

        body.setStrokeStyle(
            this.config.module.strokeWidth,
            this.config.module.strokeColor,
        )

        const text = this.add.text(clampedX, body.y, label, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#111827',
        }).setOrigin(0.5)

        this.modulePickups.push({
            body,
            label: text,
            type: label,
        })
    }

    private updateModulePickups(delta: number) {
        const deltaInSeconds = delta / this.config.time.millisecondsPerSecond
        const distance = this.config.module.speed * deltaInSeconds

        this.modulePickups.forEach((module) => {
            module.body.y += distance
            module.label.y = module.body.y
        })

        this.modulePickups = this.modulePickups.filter((module) => {
            if (module.body.y > this.scale.height + module.body.height) {
                this.destroyModulePickup(module)

                return false
            }

            return true
        })
    }

    private checkModulePlayerCollisions() {
        this.modulePickups.forEach((module) => {
            if (!module.body.active) {
                return
            }

            const isCollected = Geom.Intersects.RectangleToRectangle(
                module.body.getBounds(),
                this.player.getBounds(),
            )

            if (!isCollected) {
                return
            }

            this.collectModule(module)
            this.destroyModulePickup(module)
        })

        this.modulePickups = this.modulePickups.filter((module) => {
            return module.body.active
        })
    }

    private collectModule(module: ModulePickup) {
        this.playTone(880, 0.08, 0.06)

        const duplicate = this.activeModules.find((activeModule) => {
            return activeModule.type === module.type
        })

        if (duplicate) {
            duplicate.remainingMs = this.config.module.duration
            this.updateModuleHud()

            return
        }

        const activeModule = {
            type: module.type,
            label: module.type,
            remainingMs: this.config.module.duration,
            order: this.nextModuleOrder,
        }

        this.nextModuleOrder += 1

        if (this.activeModules.length < this.config.module.slotCount) {
            this.activeModules.push(activeModule)
            this.updateModuleHud()

            return
        }

        const oldestModule = this.activeModules.reduce((oldest, current) => {
            return current.order < oldest.order ? current : oldest
        })

        const oldestIndex = this.activeModules.indexOf(oldestModule)
        this.activeModules[oldestIndex] = activeModule
        this.updateModuleHud()
    }

    private updateActiveModules(delta: number) {
        this.activeModules.forEach((module) => {
            module.remainingMs -= delta
        })

        const activeModuleCount = this.activeModules.length

        this.activeModules = this.activeModules.filter((module) => {
            return module.remainingMs > 0
        })

        if (this.activeModules.length !== activeModuleCount) {
            this.updateModuleHud()

            return
        }

        if (this.activeModules.length > 0) {
            this.updateModuleHud()
        }
    }

    private updateModuleHud() {
        updateModuleSlotTexts(this.hud, this.activeModules)
    }

    private destroyModulePickup(module: ModulePickup) {
        module.body.destroy()
        module.label.destroy()
    }

    private checkBulletEnemyCollisions() {
        this.bullets.forEach((bullet) => {
            this.enemies.forEach((enemy) => {
                if (!bullet.object.active || !enemy.body.active) {
                    return
                }

                const isHit = Geom.Intersects.RectangleToRectangle(
                    bullet.object.getBounds(),
                    enemy.body.getBounds(),
                )

                if (!isHit) {
                    return
                }

                this.createHitEffect(bullet.object.x, bullet.object.y)
                this.playTone(220, 0.06, 0.05, 'sawtooth')

                bullet.object.destroy()
                this.damageEnemy(enemy, bullet.damage)
            })
        })

        this.bullets = this.bullets.filter((bullet) => bullet.object.active)
        this.enemies = this.enemies.filter((enemy) => enemy.body.active)
    }

    private damageEnemy(enemy: Enemy, damage: number) {
        enemy.hitPoints -= damage

        if (enemy.hitPoints > 0) {
            this.updateEnemyHealthBar(enemy)

            return
        }

        if (enemy.carriesModule) {
            this.dropModule(enemy.body.x, enemy.body.y)
        }

        this.destroyEnemy(enemy)

        this.score += this.config.score.hitReward
        updateScoreText(this.hud, this.score)
    }

    private createHitEffect(x: number, y: number) {
        const effect = this.add.circle(x, y, 10, 0xffffff, 0.85)

        effect.setStrokeStyle(2, this.config.bullet.color)

        this.tweens.add({
            targets: effect,
            alpha: 0,
            scale: 1.8,
            duration: 120,
            onComplete: () => {
                effect.destroy()
            },
        })
    }

    private checkEnemyPlayerCollisions(time: number) {
        if (this.isInvulnerable) {
            return
        }

        this.enemies.forEach((enemy) => {
            if (!enemy.body.active || this.isGameOver) {
                return
            }

            const isHit = Geom.Intersects.RectangleToRectangle(
                enemy.body.getBounds(),
                this.player.getBounds(),
            )

            if (!isHit) {
                return
            }

            this.destroyEnemy(enemy)

            if (this.hasShieldModule()) {
                this.createHitEffect(enemy.body.x, enemy.body.y)

                return
            }

            this.takeDamage(time)
        })

        this.enemies = this.enemies.filter((enemy) => enemy.body.active)
    }

    private updatePlayerInvulnerability(time: number) {
        if (!this.isInvulnerable) {
            return
        }

        if (time >= this.invulnerableUntil) {
            this.isInvulnerable = false
            this.player.setAlpha(this.config.player.defaultAlpha)

            return
        }

        const blinkStep = Math.floor(
            time / this.config.player.invulnerableBlinkInterval,
        )

        this.player.setAlpha(
            blinkStep % 2 === 0
                ? this.config.player.defaultAlpha
                : this.config.player.invulnerableAlpha,
        )
    }

    private finishGame() {
        this.isGameOver = true
        setGameOverVisible(this.hud, true)
        this.playTone(120, 0.35, 0.08, 'sawtooth')
    }

    private resetGameState() {
        this.isGameOver = false
        this.isPaused = false
        this.isInvulnerable = false

        this.score = this.config.score.initial
        this.lives = this.config.player.initialLives

        this.lastShotTime = 0
        this.lastEnemySpawnTime = 0
        this.lastModuleSpawnTime = 0
        this.gameplayTime = 0
        this.invulnerableUntil = 0
        this.nextModuleOrder = 0

        this.bullets = []
        this.enemies = []
        this.modulePickups = []
        this.activeModules = []
    }

    private togglePause() {
        this.isPaused = !this.isPaused
        setPauseVisible(this.hud, this.isPaused)
    }

    private takeDamage(time: number) {
        this.lives -= this.config.player.damagePerHit
        updateLivesText(this.hud, this.lives)
        this.createPlayerDamageEffect()
        this.playTone(150, 0.12, 0.08, 'square')

        if (this.lives <= 0) {
            this.finishGame()

            return
        }

        this.isInvulnerable = true
        this.invulnerableUntil = time + this.config.player.invulnerabilityDuration
        this.player.setAlpha(this.config.player.invulnerableAlpha)
    }

    private createPlayerDamageEffect() {
        const effect = this.add.circle(
            this.player.x,
            this.player.y,
            16,
            0xffffff,
            0.85,
        )

        effect.setStrokeStyle(3, this.config.enemy.color)

        this.tweens.add({
            targets: effect,
            alpha: 0,
            scale: 2.2,
            duration: 160,
            onComplete: () => {
                effect.destroy()
            },
        })
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
