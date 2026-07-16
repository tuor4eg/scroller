import { Input, Scene, Types } from 'phaser'
import type { Player } from '../entities/Player'
import type { GameKeys } from '../types/gameplay'

export class PlayerController {
    private readonly player: Player
    private readonly cursors: Types.Input.Keyboard.CursorKeys
    private readonly keys: GameKeys

    constructor(scene: Scene, player: Player) {
        this.player = player
        this.cursors = scene.input.keyboard!.createCursorKeys()
        this.keys = {
            left: scene.input.keyboard!.addKey(Input.Keyboard.KeyCodes.A),
            right: scene.input.keyboard!.addKey(Input.Keyboard.KeyCodes.D),
            shoot: scene.input.keyboard!.addKey(Input.Keyboard.KeyCodes.SPACE),
        }
    }

    update(time: number, delta: number, shoot: (time: number) => void) {
        let horizontalDirection = 0

        if (this.cursors.left.isDown || this.keys.left.isDown) {
            horizontalDirection -= 1
        }

        if (this.cursors.right.isDown || this.keys.right.isDown) {
            horizontalDirection += 1
        }

        this.player.move(horizontalDirection, delta)

        if (this.keys.shoot.isDown) {
            shoot(time)
        }
    }
}
