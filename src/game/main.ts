import { Game as MainGame } from './scenes/Game'
import { AUTO, Game, Scale, Types } from 'phaser'
import { GAMEPLAY_CONFIG } from './config/gameplayConfig'

const config: Types.Core.GameConfig = {
    type: AUTO,
    parent: 'game-container',
    backgroundColor: '#111827',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH,
        width: GAMEPLAY_CONFIG.game.width,
        height: GAMEPLAY_CONFIG.game.height,
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        },
    },
    scene: [
        MainGame,
    ],
}

const StartGame = (parent: string) => {
    return new Game({ ...config, parent })
}

export default StartGame
