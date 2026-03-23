import { MarketplaceService, Players } from "@rbxts/services";
import { GameConfig } from "shared/GameConfig";
import { applyJumpHeight } from "server/JumpManager";

// Fixed Y thresholds that count as checkpoints — midpoints between level zones
const CHECKPOINT_POSITIONS = [250, 750, 1400, 2300, 3400] as const;

// Session-only: last checkpoint Y reached per player (not saved to DataStore)
const lastCheckpointY = new Map<Player, number>();

// ── Public API ────────────────────────────────────────────────────────────────

// Called by HeightTracker each time highestY advances
export function updateCheckpoint(player: Player, y: number): void {
	let reached: number | undefined;
	for (const cy of CHECKPOINT_POSITIONS) {
		if (y >= cy) {
			reached = cy;
		} else {
			break;
		}
	}
	if (reached === undefined) return;
	if (reached === lastCheckpointY.get(player)) return; // already recorded
	lastCheckpointY.set(player, reached);
	print(`[CheckpointManager] ${player.Name} reached checkpoint Y=${reached}`);
}

export function getCheckpointY(player: Player): number | undefined {
	return lastCheckpointY.get(player);
}

// ── Death / respawn ───────────────────────────────────────────────────────────

function handleDeath(player: Player): void {
	// Skip live API call when game pass ID is still a placeholder
	if (GameConfig.CHECKPOINT_GAMEPASS_ID === 0) return;

	const [ok, ownsPass] = pcall(() =>
		MarketplaceService.UserOwnsGamePassAsync(player.UserId, GameConfig.CHECKPOINT_GAMEPASS_ID),
	);
	if (!ok || !ownsPass) return; // no pass — Roblox default respawn (bottom)

	const checkpointY = lastCheckpointY.get(player);
	if (checkpointY === undefined) return; // pass owner but no checkpoint reached yet

	// Wait for the new character to load
	const [newCharacter] = player.CharacterAdded.Wait();
	const root = newCharacter.WaitForChild("HumanoidRootPart") as BasePart;
	root.CFrame = new CFrame(new Vector3(0, checkpointY + 5, 0));
	applyJumpHeight(player);
	print(`[CheckpointManager] Respawned ${player.Name} at checkpoint Y=${checkpointY}`);
}

function onCharacterAdded(player: Player, character: Model): void {
	const humanoid = character.WaitForChild("Humanoid") as Humanoid;
	humanoid.Died.Connect(() => task.spawn(() => handleDeath(player)));
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

Players.PlayerAdded.Connect((player) => {
	player.CharacterAdded.Connect((character) => onCharacterAdded(player, character));
	if (player.Character !== undefined) onCharacterAdded(player, player.Character);
});

Players.PlayerRemoving.Connect((player) => lastCheckpointY.delete(player));
