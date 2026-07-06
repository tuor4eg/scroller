import { GAMEPLAY_CONFIG } from './config/gameplayConfig'
import { ENEMY_CONFIG } from './config/enemyConfig'
import { MODULE_CONFIG } from './config/moduleConfig'

export const GAME_CONFIG = {
    hud: {
        x: 12,
        scoreY: 12,
        healthBarX: 12,
        healthBarY: 17,
        healthBarWidth: 128,
        healthBarHeight: 14,
        healthBarBackgroundColor: 0x052e16,
        healthBarFillColor: 0x22c55e,
        healthBarStrokeColor: 0xffffff,
        moduleSlotsX: 12,
        moduleSlotsY: 62,
        moduleSlotGap: 22,
        moduleSlotWidth: 116,
        moduleSlotHeight: 18,
        moduleSlotTextXOffset: 6,
        moduleSlotTextYOffset: 2,
        fontFamily: 'Courier New',
        fontSize: '20px',
        moduleFontSize: '14px',
    },
    message: {
        fontSize: '32px',
    },
    starfield: {
        count: 70,
        minRadius: 1,
        maxRadius: 2,
        minSpeed: 35,
        maxSpeed: 110,
        color: 0xffffff,
        minAlpha: 0.25,
        maxAlpha: 0.8,
        loopOffset: 4,
        depth: -10,
    },
    player: {
        width: GAMEPLAY_CONFIG.player.width,
        height: GAMEPLAY_CONFIG.player.height,
        bottomOffset: GAMEPLAY_CONFIG.player.bottomOffset,
        speed: GAMEPLAY_CONFIG.player.speed,
        color: 0x00ff00,
        strokeWidth: 5,
        strokeColor: 0xffffff,
        defaultAlpha: 1,
        invulnerableAlpha: 0.4,
        invulnerableBlinkInterval: 100,
        maxHealth: GAMEPLAY_CONFIG.player.maxHealth,
        damagePerHit: GAMEPLAY_CONFIG.player.damagePerHit,
        invulnerabilityDuration: GAMEPLAY_CONFIG.player.invulnerabilityDuration,
    },
    bullet: {
        width: GAMEPLAY_CONFIG.bullet.width,
        height: GAMEPLAY_CONFIG.bullet.height,
        yOffset: GAMEPLAY_CONFIG.bullet.yOffset,
        speed: GAMEPLAY_CONFIG.bullet.speed,
        fireRate: GAMEPLAY_CONFIG.bullet.fireRate,
        color: 0xfacc15,
        destroyY: GAMEPLAY_CONFIG.bullet.destroyY,
        damage: GAMEPLAY_CONFIG.bullet.damage,
    },
    enemy: ENEMY_CONFIG,
    module: MODULE_CONFIG,
    score: {
        initial: 0,
    },
    time: {
        millisecondsPerSecond: 1000,
    },
} as const

export type GameConfig = typeof GAME_CONFIG
