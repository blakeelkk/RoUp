import ProfileService from "@rbxts/profileservice";
import { Players } from "@rbxts/services";
import { GameConfig } from "shared/GameConfig";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PlayerProfile {
	highestY: number;
	currentLevel: number;
	rebirthCount: number;
	totalJumpBonus: number;
	hasCheckpointPass: boolean;
}

const PROFILE_TEMPLATE: PlayerProfile = {
	highestY: 0,
	currentLevel: 1,
	rebirthCount: 0,
	totalJumpBonus: GameConfig.DEFAULT_JUMP_HEIGHT,
	hasCheckpointPass: false,
};

// ── Store & cache ─────────────────────────────────────────────────────────────
const GameProfileStore = ProfileService.GetProfileStore("PlayerData", PROFILE_TEMPLATE);
type RawProfile = NonNullable<ReturnType<typeof GameProfileStore.LoadProfileAsync>>;
const activeProfiles = new Map<Player, RawProfile>();

// ── Internal helpers ──────────────────────────────────────────────────────────
function loadProfile(player: Player): void {
	const profile = GameProfileStore.LoadProfileAsync(`Player_${player.UserId}`, "ForceLoad");

	if (profile === undefined) {
		print(`[PlayerManager] Failed to load profile for ${player.Name} — kicking`);
		player.Kick("Failed to load data. Please rejoin.");
		return;
	}

	profile.ListenToRelease(() => {
		print(`[PlayerManager] Profile released for ${player.Name}`);
		activeProfiles.delete(player);
		player.Kick("Your session was released. Please rejoin.");
	});

	if (player.IsDescendantOf(Players)) {
		profile.Reconcile();
		activeProfiles.set(player, profile);
		print(
			`[PlayerManager] Loaded profile for ${player.Name} — highestY=${profile.Data.highestY} level=${profile.Data.currentLevel} rebirths=${profile.Data.rebirthCount}`,
		);
	} else {
		// Player left before async load finished
		print(`[PlayerManager] ${player.Name} left before profile loaded — releasing`);
		profile.Release();
	}
}

function releaseProfile(player: Player): void {
	const profile = activeProfiles.get(player);
	if (profile !== undefined) {
		profile.Release();
		activeProfiles.delete(player);
		print(`[PlayerManager] Saved and released profile for ${player.Name}`);
	}
}

// ── Public API ────────────────────────────────────────────────────────────────
export function getProfile(player: Player): PlayerProfile | undefined {
	return activeProfiles.get(player)?.Data;
}

export function updateHighestY(player: Player, y: number): void {
	const profile = activeProfiles.get(player);
	if (profile !== undefined && y > profile.Data.highestY) {
		profile.Data.highestY = y;
	}
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
Players.PlayerAdded.Connect(loadProfile);
Players.PlayerRemoving.Connect(releaseProfile);

// Bootstrap: handle players already present when the module first loads
for (const player of Players.GetPlayers()) {
	task.spawn(() => loadProfile(player));
}
