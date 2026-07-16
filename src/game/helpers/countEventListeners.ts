import type { Events } from 'phaser'

export function countEventListeners(emitter?: Events.EventEmitter) {
    if (!emitter) {
        return 0
    }

    return emitter.eventNames().reduce((count, eventName) => {
        return count + emitter.listenerCount(eventName)
    }, 0)
}
