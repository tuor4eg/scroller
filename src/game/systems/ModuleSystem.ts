import type { GameConfig } from '../config'
import type { ModuleConfig } from '../config/moduleConfig'
import { ModuleKind } from '../config/moduleConfig'
import type { Player } from '../entities/Player'
import type { ActiveModule, WeaponParameters } from '../types/gameplay'

type ModuleSystemCallbacks = {
    playPickupTone: () => void
}

export class ModuleSystem {
    private readonly config: ModuleConfig
    private readonly player: Player
    private readonly callbacks: ModuleSystemCallbacks
    private activeModules: ActiveModule[] = []
    private nextModuleOrder = 0

    constructor(
        config: ModuleConfig,
        player: Player,
        callbacks: ModuleSystemCallbacks,
    ) {
        this.config = config
        this.player = player
        this.callbacks = callbacks
    }

    collect(type: string) {
        this.callbacks.playPickupTone()

        const moduleEffect = this.getEffect(type)

        if (!moduleEffect) {
            return
        }

        if (moduleEffect.kind === ModuleKind.Instant) {
            this.applyInstantEffect(moduleEffect)

            return
        }

        const duplicate = this.activeModules.find((activeModule) => {
            return activeModule.type === type
        })

        if (duplicate) {
            this.refreshTemporaryModule(duplicate)

            return
        }

        const activeModule: ActiveModule = {
            type,
            label: type,
            kind: moduleEffect.kind,
            remainingMs: moduleEffect.kind === ModuleKind.Temporary
                ? this.config.duration
                : undefined,
            order: this.nextModuleOrder,
        }

        this.nextModuleOrder += 1

        if (this.activeModules.length < this.config.slotCount) {
            this.activeModules.push(activeModule)

            return
        }

        const oldestModule = this.activeModules.reduce((oldest, current) => {
            return current.order < oldest.order ? current : oldest
        })
        const oldestIndex = this.activeModules.indexOf(oldestModule)

        this.activeModules[oldestIndex] = activeModule
    }

    update(delta: number) {
        this.activeModules.forEach((module) => {
            if (
                module.kind !== ModuleKind.Temporary ||
                module.remainingMs === undefined
            ) {
                return
            }

            module.remainingMs -= delta
        })

        this.activeModules = this.activeModules.filter((module) => {
            if (module.kind !== ModuleKind.Temporary) {
                return true
            }

            return (module.remainingMs ?? 0) > 0
        })
    }

    hasActive(type: string) {
        return this.activeModules.some((module) => module.type === type)
    }

    getActiveModules() {
        return this.activeModules
    }

    getWeaponParameters(
        bulletConfig: GameConfig['bullet'],
    ): WeaponParameters {
        const rapidFire = this.config.effects.rapidFire
        const spreadShot = this.config.effects.spreadShot
        const fireRate = this.hasActive(rapidFire.type)
            ? bulletConfig.fireRate * rapidFire.fireRateMultiplier
            : bulletConfig.fireRate

        if (!this.hasActive(spreadShot.type)) {
            return {
                fireRate,
                bulletAngles: [-90],
            }
        }

        const angleStep = spreadShot.fanAngle / (spreadShot.bulletCount - 1)
        const startAngle = -90 - spreadShot.fanAngle / 2

        return {
            fireRate,
            bulletAngles: Array.from(
                { length: spreadShot.bulletCount },
                (_value, index) => startAngle + index * angleStep,
            ),
        }
    }

    private getEffect(type: string) {
        return Object.values(this.config.effects).find((effect) => {
            return effect.type === type
        })
    }

    private applyInstantEffect(effect: ReturnType<ModuleSystem['getEffect']>) {
        if (!effect || effect.kind !== ModuleKind.Instant) {
            return
        }

        if (effect.type === this.config.effects.heal.type) {
            this.player.heal(effect.amount)

            return
        }

        if (effect.type === this.config.effects.resetTimers.type) {
            this.resetTemporaryTimers()
        }
    }

    private resetTemporaryTimers() {
        this.activeModules.forEach((module) => {
            this.refreshTemporaryModule(module)
        })
    }

    private refreshTemporaryModule(module: ActiveModule) {
        if (module.kind === ModuleKind.Temporary) {
            module.remainingMs = this.config.duration
        }
    }
}
