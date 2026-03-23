# RoUp — Roblox OnlyUp-Style Climbing Game

## What is RoUp?
RoUp is a Roblox experience inspired by OnlyUp. Players start at the bottom of a large
vertical world and must parkour, climb, and navigate upward through a series of
increasingly difficult platforms, obstacles, and environments — with no checkpoints by
default. Falling sends you back down. The goal is to reach the top.

---

## Stack
- **roblox-ts** — TypeScript to Luau compiler
- **Argon** — file sync between VSCode and Roblox Studio
- **mise** — tool version manager (pins Argon and Wally versions)
- **Wally** — Roblox package manager
- **@rbxts/react** — React-style UI components for Roblox
- **@rbxts/profileservice** — persistent player data via DataStoreService
- **@rbxts/net** — typed RemoteEvents and RemoteFunctions
- **@rbxts/promise** — async/promise handling
- **@rbxts/signal** — typed signal/event system
- **@rbxts/cmdr** — in-game admin command framework
- **npm** — JavaScript package manager

---

## Project Structure
```
src/
├── client/          # LocalScripts — input handling, UI, camera, effects
├── server/          # ServerScripts — game logic, DataStores, leaderboards
└── shared/          # Shared modules — types, constants, utility functions
```

### Key Files
- `default.project.json` — Argon project file, maps src/ to Roblox services
- `mise.toml` — pins Argon and Wally versions for local and CI
- `wally.toml` — Roblox package dependencies
- `tsconfig.json` — TypeScript compiler config for roblox-ts
- `.github/workflows/deploy.yml` — GitHub Actions CI/CD pipeline

---

## Roblox Services in Use
| Service | Purpose |
|---|---|
| `DataStoreService` | Save player best height, completion status, total runs |
| `MemoryStoreService` | Live leaderboard data across servers |
| `MessagingService` | Cross-server announcements (e.g. someone reached the top) |
| `MarketplaceService` | Game passes (e.g. checkpoints, speed boosts, cosmetics) |
| `BadgeService` | Milestone badges (e.g. reach 25%, 50%, 75%, 100% height) |
| `TeleportService` | Send players to other servers or reserved servers |
| `PhysicsService` | Collision groups so player hitboxes don't interfere |
| `CollectionService` | Tag platforms, hazards, checkpoints by type |
| `TweenService` | Smooth platform animations and UI transitions |
| `RunService` | Heartbeat loops for height tracking and leaderboard updates |
| `UserInputService` | Keyboard and gamepad input handling |
| `SoundService` | Ambient audio, footsteps, fall sounds, win music |
| `ReplicatedStorage` | Shared assets, RemoteEvents, React UI components |
| `ServerStorage` | Server-only assets not visible to clients |
| `HttpService` | Discord webhook logging for top completions |
| `Players` | Player join/leave lifecycle, character management |

---

## Game Mechanics to Implement

### Height Tracking
- Continuously track each player's Y position on every `RunService.Heartbeat`
- Track **highest Y value ever reached** per player — this is the canonical progression stat
- Save highest Y to DataStore on change (debounced) and on player leave
- Highest Y is used to determine level, rebirth eligibility, and leaderboard position
- Personal best is displayed live in the HUD and never decreases

### Checkpoints
- Checkpoints are **not free by default** — players must unlock them via one of:
  - Purchasing the **Checkpoints Game Pass** via `MarketplaceService` (one-time Robux purchase)
  - Purchasing a **single-use checkpoint activation** as a Developer Product (per-session Robux purchase)
- Players without access respawn at the bottom on death — no exceptions
- Players with access respawn at their **last reached checkpoint** for the current session
- Checkpoint positions are fixed Y-height thresholds placed throughout the map
- On player death, check `MarketplaceService:UserOwnsGamePassAsync()` to determine respawn location
- Checkpoint state is session-only (MemoryStore) — not persisted across rejoins

### Leveling System
- Players gain **levels** by reaching specific Y height thresholds
- Each level grants a permanent increase to **base Jump Height** (applied via `Humanoid.JumpHeight`)
- Level thresholds and jump bonuses are defined in a shared config in `src/shared/`
- Level is saved to DataStore as part of the player's profile
- On level-up: show a level-up UI notification, update the HUD, apply the new jump height immediately
- Example progression (adjust values in shared config):
  - Level 1 → 0Y (default jump height: 7.2)
  - Level 2 → 500Y (+0.5 jump height)
  - Level 3 → 1000Y (+0.5 jump height)
  - Each subsequent level requires more Y height than the last

### Rebirth System
- Once a player reaches a **specific Y height threshold** (the rebirth threshold), they can choose to Rebirth
- Rebirthing **resets the player's position to the bottom** and **resets their current level to 1**
- In exchange, the player permanently gains **increased base Jump Height** that stacks across rebirths
- Rebirth count is saved to DataStore and displayed on the leaderboard/HUD
- Rebirth bonuses stack — each rebirth adds a flat jump height bonus on top of previous rebirths
- Example:
  - Rebirth 1 → +1.0 permanent jump height bonus
  - Rebirth 2 → +1.0 additional bonus (total +2.0)
- Jump height on spawn = default + level bonus + (rebirth count × rebirth bonus)
- Rebirth is triggered by the player via a UI button that only appears when they meet the threshold
- Show a confirmation dialog before rebirthing to prevent accidental resets

### Other Mechanics
- **Fall detection** — detect when a player falls significantly and update state
- **Win condition** — reaching the top triggers celebration, badge award, stat save
- **Moving platforms** — platforms that rotate, move, or disappear
- **Hazards** — wind zones, slippery surfaces, moving obstacles
- **Global leaderboard** — top players by highest Y reached, updates live via MemoryStoreService
- **Cross-server announcements** — when a player reaches the top, broadcast via MessagingService

---

## UI Components (src/client — @rbxts/react)
- `HeightTracker` — live HUD showing current Y height, personal best (highest Y ever), and current level
- `Leaderboard` — top 10 players by highest Y reached, updates in real time
- `LevelUpNotification` — toast popup when a player gains a level, shows new jump height bonus
- `RebirthButton` — appears only when player meets the rebirth Y threshold, triggers confirmation dialog
- `RebirthConfirmDialog` — confirms rebirth intent, shows what will reset and what bonus will be gained
- `RebirthNotification` — shown after a successful rebirth with new bonus stats
- `CheckpointNotification` — toast popup when a player reaches a checkpoint (pass holders only)
- `DeathScreen` — shown on fall/death with retry button, shows respawn location (checkpoint or bottom)
- `WinScreen` — shown on reaching the top, displays stats, rebirth prompt, and share button
- `AdminPanel` — for use with @rbxts/cmdr (admin only)

---

## Key Commands
```bash
npm run build                                    # compile TypeScript once
npm run watch                                    # compile TypeScript on every save
mise x -- argon serve default.project.json      # start Argon local sync server (run alongside watch)
mise x -- wally install                         # install Roblox Wally packages
mise install                                    # install all mise-managed tools
```

> **Local dev:** always run `npm run watch` in Terminal 1 and `mise x -- argon serve default.project.json` in Terminal 2 simultaneously. Watch compiles TS → Luau, Argon syncs the output live into Roblox Studio.

---

## Branch Strategy
| Branch | Purpose | Deploys to |
|---|---|---|
| `dev` | Active development, all day-to-day commits | Dev Roblox Place (automatic) |
| `main` | Stable, tested, release-ready | Production Roblox Place (requires manual approval) |

- **Never commit directly to `main`** — always open a PR from `dev`
- **Never force push** to either branch — both are protected

---

## CI/CD Pipeline (.github/workflows/deploy.yml)
On push to `dev`:
1. `npm ci` — install npm dependencies
2. `npm run build` — compile TypeScript → Luau
3. `curl https://mise.run | sh` — install mise
4. `mise install` — install Argon and Wally from mise.toml
5. `mise x -- wally install` — install Roblox packages
6. `mise x -- argon build` — build .rbxl place file
7. Publish to Dev Place via Roblox Open Cloud API

On merge to `main` (requires manual approval in GitHub):
- Same steps, publishes to Production Place

---

## Player Data Profile (DataStore via @rbxts/profileservice)
```ts
type PlayerProfile = {
  highestY: number;         // highest Y value the player has ever reached
  currentLevel: number;     // current level (resets to 1 on rebirth)
  rebirthCount: number;     // total number of rebirths — never resets
  totalJumpBonus: number;   // cached sum of all jump bonuses (level + rebirth)
  hasCheckpointPass: boolean; // cached from MarketplaceService on join
}
```
- Jump height on spawn = `7.2 (default) + levelBonus(currentLevel) + (rebirthCount × REBIRTH_JUMP_BONUS)`
- Level and rebirth bonus configs live in `src/shared/GameConfig.ts`
- `highestY` and `rebirthCount` never decrease under any circumstance

---
- All tool CLI commands must be prefixed with `mise x --`
- Wally/mise package scope format: `blake-elkington/package-name` (lowercase, hyphens only)
- Use `@rbxts/services` for all Roblox service imports — never use `game.GetService()`
- All RemoteEvents and RemoteFunctions must be typed via `@rbxts/net`
- Server-side DataStore logic lives in `src/server/` only — never access DataStores from client
- Shared types and interfaces live in `src/shared/` and are imported by both client and server
- Use `@rbxts/promise` for all async operations instead of raw coroutines
- Line endings are LF (enforced via .gitattributes) — do not change this

---

## Environment Secrets (GitHub Actions)
- `ROBLOX_API_KEY_DEV` — Open Cloud key for Dev Place
- `ROBLOX_API_KEY_PROD` — Open Cloud key for Production Place
- `ROBLOX_UNIVERSE_ID_DEV` / `ROBLOX_PLACE_ID_DEV` — Dev experience IDs
- `ROBLOX_UNIVERSE_ID_PROD` / `ROBLOX_PLACE_ID_PROD` — Production experience IDs