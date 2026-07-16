# AGENTS.md

## Project

Small browser vertical shoot 'em up game.

Stack:

* Phaser 3
* TypeScript
* Vite
* npm

Read `PROJECT_CONTEXT.md` before gameplay tasks.
Read `GAME_DESIGN.md` only for modifiers, balance, enemies, difficulty or gameplay design.

## Code style

Use:

* TypeScript
* 4 spaces indentation
* no semicolons
* simple readable code
* explicit imports from `phaser`

Do not rely on a global `Phaser` runtime object in Vite/ESM code.

Prefer:

```ts
import { GameObjects, Input, Math as PhaserMath, Scene } from 'phaser'
```

Avoid unless `Phaser` is explicitly imported:

```ts
Phaser.Math.Clamp(...)
Phaser.Input.Keyboard.KeyCodes.SPACE
```

## Development rules

Make small changes.

Each task should:

* implement one clear mechanic or refactor
* keep the game runnable
* avoid unrelated changes
* preserve existing behavior unless requested
* avoid large rewrites unless requested

Environment variables:

* every project-specific environment variable must be documented in `.env.example`
* add a variable to `.env.example` in the same change that introduces it
* remove a variable from `.env.example` when the project no longer uses it
* never add secrets or real credentials to `.env.example`; use safe example values

Controls documentation:

* every change to player controls must update the in-game instructions in the same change
* keep the controls section in `README.md` synchronized with the actual controls
* remove obsolete controls from both places when they are no longer used

After changes, briefly explain:

* what files changed
* what behavior changed
* how to test manually

## Architecture

Keep the code simple, but do not let one scene become a god class.

Prefer:

* simple constants before config systems
* small helpers for repeated logic
* focused files with clear responsibility
* manual arrays and collision checks while the prototype is small

Avoid:

* ECS
* large inheritance hierarchies
* complex architecture
* dependency injection
* backend
* online leaderboard
* premature optimization
* copying similar logic into many places

## DRY and helpers

Extract helpers when:

* the same calculation appears more than once
* cleanup logic is repeated
* collision checks are duplicated
* object creation becomes noisy
* a method becomes hard to read
* the scene class collects unrelated responsibilities

Do not create abstractions just for abstraction.

## Suggested structure

Grow this structure gradually. Do not create folders before they are needed.

```txt
src/
    main.ts
    game/
        main.ts
        scenes/
            Game.ts
        config/
            gameConfig.ts
            gameplayConfig.ts
        types/
            gameplay.ts
        helpers/
            math.ts
            collision.ts
            cleanup.ts
        factories/
            createPlayer.ts
            createBullet.ts
            createEnemy.ts
            createModifier.ts
        ui/
            hud.ts
```

Suggested responsibilities:

* `scenes/Game.ts` — scene lifecycle and gameplay orchestration
* `config/` — Phaser config and gameplay constants
* `types/` — shared TypeScript types
* `helpers/` — small reusable calculations and checks
* `factories/` — object creation
* `ui/` — HUD creation and updates

## Gameplay priorities

Current priority:

1. keep the game playable
2. make mechanics easy to test
3. keep action readable
4. implement modifiers in small steps
5. tune balance only after mechanics work

Do not add many mechanics in one change.

## Agent skills

### Gameplay Implementer

Use for new mechanics.

Rules:

* make the smallest playable implementation
* do not refactor unrelated code
* do not add extra mechanics
* prefer temporary shapes/text before assets
* explain how to test

### Refactor Assistant

Use for cleanup.

Rules:

* preserve behavior
* do not add gameplay
* extract constants/helpers only when useful
* keep files focused
* avoid architecture changes

### Bug Fixer

Use for bugs.

Rules:

* identify likely cause first
* make the minimal fix
* avoid rewriting working systems
* include manual verification steps

Check especially:

* Phaser imports in Vite/ESM
* destroyed objects still kept in arrays
* pause state
* game over state
* restart state
* timers after restart
* `isDown` vs `JustDown`

### Game Designer

Use for mechanics and balance.

Rules:

* read `GAME_DESIGN.md`
* describe mechanics abstractly first
* avoid inventing concrete bonus names unless requested
* prefer MVP-sized steps
* separate design ideas from implementation tasks

### Code Reviewer

Use before larger changes.

Focus on:

* runtime errors
* broken game states
* regressions
* Phaser/Vite import issues
* object cleanup
* pause/restart/game over behavior
* duplicated logic
* scene class becoming too large

## Manual testing

For gameplay changes:

```bash
npm run dev
```

Check:

* game starts
* player movement works
* shooting works
* enemies spawn
* pause works
* game over and restart work
* new behavior works
* browser console has no runtime errors

## Git

Do not create commits unless explicitly asked.

Do not change formatting across unrelated files.
