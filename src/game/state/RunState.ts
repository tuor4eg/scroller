export type RunResult = 'victory' | 'defeat'
export type RunEndReason = 'player-death' | 'mission-failed' | 'mission-complete'
export type RunStatus = 'not-started' | 'running' | 'paused' | 'finished'

export class RunState {
    private started = false
    private gameOver = false
    private result?: RunResult
    private endReason?: RunEndReason
    private paused = false
    private score: number
    private lastBaseScoreReward = 0
    private lastFinalScoreReward = 0
    private gameplayTime = 0
    private missionProgress: number
    private readonly minMissionProgress: number
    private readonly maxMissionProgress: number

    constructor(
        initialScore: number,
        initialMissionProgress: number,
        minMissionProgress: number,
        maxMissionProgress: number,
    ) {
        this.score = initialScore
        this.minMissionProgress = minMissionProgress
        this.maxMissionProgress = maxMissionProgress
        this.missionProgress = this.clampMissionProgress(initialMissionProgress)
    }

    hasStarted() {
        return this.started
    }

    start() {
        this.started = true
    }

    isGameOver() {
        return this.gameOver
    }

    finish(result: RunResult, reason: RunEndReason) {
        if (this.gameOver) {
            return false
        }

        this.gameOver = true
        this.result = result
        this.endReason = reason

        return true
    }

    getResult() {
        return this.result
    }

    getEndReason() {
        return this.endReason
    }

    getStatus(): RunStatus {
        if (this.gameOver) {
            return 'finished'
        }

        if (!this.started) {
            return 'not-started'
        }

        return this.paused ? 'paused' : 'running'
    }

    isPaused() {
        return this.paused
    }

    togglePause() {
        this.paused = !this.paused

        return this.paused
    }

    advanceTime(delta: number) {
        this.gameplayTime += delta
    }

    getGameplayTime() {
        return this.gameplayTime
    }

    getMissionProgress() {
        return this.missionProgress
    }

    setMissionProgress(progress: number) {
        if (!this.gameOver) {
            this.missionProgress = this.clampMissionProgress(progress)
        }

        return this.missionProgress
    }

    getScore() {
        return this.score
    }

    awardScore(baseReward: number, multiplier: number) {
        if (this.gameOver) {
            return this.score
        }

        this.lastBaseScoreReward = baseReward
        this.lastFinalScoreReward = baseReward * multiplier
        this.score += this.lastFinalScoreReward

        return this.score
    }

    getLastBaseScoreReward() {
        return this.lastBaseScoreReward
    }

    getLastFinalScoreReward() {
        return this.lastFinalScoreReward
    }

    private clampMissionProgress(progress: number) {
        return Math.min(
            this.maxMissionProgress,
            Math.max(this.minMissionProgress, progress),
        )
    }
}
