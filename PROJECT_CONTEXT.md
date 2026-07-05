# Project Context

## Project idea

This is a small browser-based vertical shoot 'em up game built with Phaser 3, TypeScript and Vite.

The player controls a ship at the bottom of a 480x720 game field. Enemies spawn from the top and move downward. The player moves horizontally, shoots enemies, collects modules, survives waves and tries to get a higher score.

The project is a learning prototype, not a large production game.

## Core gameplay

Current basic loop:

1. Move the ship left and right
2. Shoot upward
3. Destroy falling enemies
4. Gain score
5. Avoid enemy collisions
6. Lose lives on collision
7. Become temporarily invulnerable after damage
8. Pause/unpause the game
9. Restart after game over

## Current mechanics

Implemented or planned as part of the base prototype:

- Phaser scene setup
- 480x720 game field
- player movement
- shooting with fire rate limit
- bullets and enemies
- manual collision checks
- score
- lives
- pause
- game over
- restart
- temporary invulnerability

The game currently uses simple geometric shapes instead of final sprites.

## Main design hook

The planned core feature is a module constructor system.

Falling modules appear during gameplay. The player can hold up to 3 active modules at the same time. Modules modify weapon behavior and can create strong combinations.

Example combo:

- Rapid Fire
- Spread Shot
- Explosive Bullets

This creates fast multi-directional area damage, but strong modules should have drawbacks, limited duration, or other balancing limits.

The player should not always want to collect every module. Some modules may replace better ones, have drawbacks, or only become useful in specific combinations.

## Module system rules

Initial planned rules:

- the player has 3 module slots
- each module has limited duration
- new module replaces the oldest active module if all slots are full
- duplicate modules refresh duration
- active modules are displayed on screen

Initial module ideas:

- Rapid Fire
- Spread Shot
- Explosive Bullets
- Big Bullets
- Piercing Bullets
- Shield
- Magnet

## Technical stack

- Phaser 3
- TypeScript
- Vite
- npm

The game is a browser game.

For now, prefer simple implementation:

- simple rectangles before real sprites
- manual arrays for bullets, enemies and modules
- manual collision checks with bounds
- simple state flags for game state

Later, some logic may be moved to Phaser Arcade Physics groups if needed.

## Development approach

Prefer small, working steps.

Each task should:

1. change one small mechanic
2. keep the game runnable
3. be easy to test manually
4. avoid unnecessary architecture
5. avoid large rewrites unless requested

The project is also for learning Phaser and game loops, so clarity is more important than clever abstractions.

## Near-term roadmap

1. Refactor constants and settings
2. Add falling module objects
3. Add 3 visible module slots
4. Add module pickup detection
5. Add module expiration
6. Implement Rapid Fire
7. Implement Spread Shot
8. Implement Explosive Bullets
9. Add simple hit/explosion effects
10. Add difficulty scaling
