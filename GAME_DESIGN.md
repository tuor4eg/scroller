# Game Design

## Goal

Small browser vertical shoot 'em up with temporary gameplay modules.

The player controls a ship at the bottom of the screen, shoots falling enemies, avoids collisions, collects modules and tries to survive longer.

The main fun should come from short-lived module combinations, not from permanent upgrades.

## Core loop

1. Move horizontally
2. Shoot enemies
3. Avoid collisions
4. Collect falling modules
5. Combine up to 3 active modules
6. Adapt when modules expire or are replaced
7. Survive and increase score

## Module system

Modules are falling pickups collected during gameplay.

Initial rules:

- player has 3 module slots
- each module has limited duration
- new module uses a free slot if available
- if all slots are full, new module replaces the oldest active one
- duplicate module refreshes duration
- active modules are shown in UI

Modules may affect:

- weapon behavior
- movement
- defense
- scoring
- pickups
- enemy interaction
- risk/reward balance

## Design principles

Good modules should:

- be noticeable immediately
- change gameplay, not just hidden numbers
- be easy to understand
- work alone
- become more interesting in combinations
- have drawbacks if they are very strong

The player should not always want to collect every module.

Strong temporary combinations are allowed and desirable, but should be limited by duration, slot count, drawbacks, rarity or enemy pressure.

## MVP milestones

### Module MVP

- modules fall from the top
- player can collect them
- collected modules appear in 3 UI slots
- modules expire after time
- oldest module is replaced when slots are full
- duplicates refresh duration

At this stage modules may have no gameplay effect yet.

### Gameplay effect MVP

- add one weapon module
- add one defensive module
- add one utility or risk module
- show remaining duration clearly
- keep implementation simple

### Synergy MVP

- allow modules to interact
- add drawbacks to stronger effects
- tune basic values
- add simple visual feedback

## Enemy and difficulty

Enemies should stay simple until the module system works.

Initial difficulty scaling can use:

- faster enemy spawn
- faster enemy movement
- tougher enemies later

Avoid complex waves before the core module system feels fun.

## UI

UI should show:

- score
- lives
- active module slots
- remaining module duration
- pause state
- game over state

Text labels are enough for the first version. Icons can come later.

## Avoid for now

Do not focus on:

- permanent upgrades
- inventory menu
- skill tree
- complex enemy waves
- procedural generation
- multiplayer
- backend
- online leaderboard
- complex architecture
- final art pipeline

Keep the game small, playable and easy to test.
