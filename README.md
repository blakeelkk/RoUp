# RoUp

> An OnlyUp-style parkour climbing game built on Roblox.

![TypeScript](https://img.shields.io/badge/TypeScript-roblox--ts-3178C6?logo=typescript&logoColor=white)
![Roblox](https://img.shields.io/badge/Platform-Roblox-E8192C?logo=roblox&logoColor=white)
![Branch](https://img.shields.io/badge/dev-active-brightgreen)

---

## Overview

RoUp is a Roblox experience inspired by OnlyUp. Players start at the bottom of a large vertical world and must parkour, climb, and navigate upward through increasingly difficult platforms and obstacles. There are no checkpoints by default — fall, and you go back down. Reach the top to win.

Key mechanics: height-based leveling, a rebirth system with stacking jump bonuses, an optional checkpoint game pass, a live global leaderboard, and cross-server win announcements.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [roblox-ts](https://roblox-ts.com) | TypeScript → Luau compiler |
| [Argon](https://argon.wiki) | Two-way file sync between VSCode and Roblox Studio |
| [mise](https://mise.jdx.dev) | Tool version manager (pins Argon and Wally) |
| [Wally](https://wally.run) | Roblox package manager |
| `@rbxts/react` | React-style UI components |
| `@rbxts/profileservice` | Persistent player data via DataStoreService |
| `@rbxts/net` | Typed RemoteEvents and RemoteFunctions |

---

## Project Structure

```
src/
├── client/        # LocalScripts — input, UI, camera, effects
├── server/        # ServerScripts — game logic, DataStores, leaderboards
└── shared/        # Shared modules — types, constants, config

out/
└── world/         # Roblox model files synced from Studio (committed to git)
```

---

## Prerequisites

Before getting started, make sure you have the following installed:

- [Node.js](https://nodejs.org) v20 or later
- [Git](https://git-scm.com)
- [mise](https://mise.jdx.dev/getting-started.html) — installs Argon and Wally automatically
- [Roblox Studio](https://create.roblox.com/landing) with the [Argon plugin](https://create.roblox.com/store/asset/11263738833) installed

---

## Getting Started — Coder

Full setup for TypeScript development.

**1. Clone the repository**

```bash
git clone https://github.com/blakeelkk/RoUp.git
cd RoUp
```

**2. Install dependencies**

```bash
npm install
mise install
mise x -- wally install
```

**3. Start the development environment**

Open two terminals and run each command in its own terminal — both must stay running while you work:

```bash
# Terminal 1 — compile TypeScript on every save
npm run watch

# Terminal 2 — sync compiled output into Roblox Studio live
mise x -- argon serve default.project.json
```

**4. Open in Roblox Studio**

Open Roblox Studio, load the place, and connect the Argon plugin. Code changes now sync into Studio automatically as you save.

---

## Getting Started — Builder

Simplified setup for building the map in Roblox Studio. You don't need to touch any TypeScript.

**1. Clone the repository**

```bash
git clone https://github.com/blakeelkk/RoUp.git
cd RoUp
```

**2. Install tools**

```bash
mise install
```

**3. Start Argon**

```bash
mise x -- argon serve default.project.json
```

Keep this terminal open the entire time you are working in Studio.

**4. Open Roblox Studio and connect**

Open Roblox Studio, load the place, and connect the Argon plugin. Once connected, everything you place in the Workspace will automatically sync to the `out/world/` folder on your computer.

**5. Build as normal**

Place models, parts, and environments in the Workspace. Argon handles syncing your work to disk in the background.

**6. Save your work to git**

When you're happy with your changes, commit and push them:

```bash
git add out/world/
git commit -m "build: <describe what you added or changed>"
git push
```

> **Important:** Always have Argon running when you build in Studio. If Argon is not connected, your changes won't sync to `out/world/` and will not be included in the deployed game.

---

## Collaboration Workflow

This project uses a coder + builder split:

| Role | Works in | Commits |
|---|---|---|
| Coder | `src/` (TypeScript) | Game logic, UI, server scripts |
| Builder | Roblox Studio + Argon | `out/world/` (map models and environments) |

**Day-to-day flow:**

1. Both contributors pull the latest `dev` branch before starting work
2. Coder runs `npm run watch` + `argon serve` — code changes sync into Studio live
3. Builder runs `argon serve` — Studio changes sync to `out/world/` on disk
4. Each contributor commits and pushes their changes independently
5. When ready to deploy, the coder triggers the pipeline manually (see below)

---

## Branching & Deployment

| Branch | Purpose | Deploys to |
|---|---|---|
| `dev` | Active development — all day-to-day commits | Dev Roblox Place |
| `main` | Stable, release-ready code | Production Roblox Place |

- **Never commit directly to `main`** — always open a PR from `dev`
- **Never force push** to either branch

**Triggering a deployment:**

Deployments are triggered manually. Go to **GitHub → Actions → Build and Deploy → Run workflow**, select the branch, and click Run.

The `dev` pipeline deploys to the Dev Place. The `main` pipeline requires manual approval in GitHub before publishing to Production.
