import { Players, RunService } from "@rbxts/services";
import { GameConfig } from "shared/GameConfig";
import { getProfile, updateHighestY } from "server/PlayerManager";
import Remotes from "shared/Remotes";
import { computeJumpHeight } from "server/JumpManager";
import { updateCheckpoint } from "server/CheckpointManager";

const ServerRemotes = Remotes.Server;

// Throttle HeightUpdate to 4 Hz per player
const lastHeightSent = new Map<Player, number>();
Players.PlayerRemoving.Connect((player) => lastHeightSent.delete(player));

// ── Helpers ───────────────────────────────────────────────────────────────────

// Returns the highest level whose requiredY <= y
function computeLevel(y: number): number {
	let level = 1;
	for (const threshold of GameConfig.LEVEL_THRESHOLDS) {
		if (y >= threshold.requiredY) {
			level = threshold.level;
		} else {
			break;
		}
	}
	return level;
}

// ── Heartbeat loop ────────────────────────────────────────────────────────────

RunService.Heartbeat.Connect(() => {
	for (const player of Players.GetPlayers()) {
		const character = player.Character;
		if (character === undefined) continue;

		const root = character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
		if (root === undefined) continue;

		const y = root.Position.Y;
		const profile = getProfile(player);
		if (profile === undefined) continue; // profile not loaded yet

		// Send live height data to client at ~4 Hz
		const now = os.clock();
		if ((now - (lastHeightSent.get(player) ?? 0)) >= 0.25) {
			lastHeightSent.set(player, now);
			ServerRemotes.Get("HeightUpdate").SendToPlayer(player, y, profile.highestY, profile.rebirthCount);
		}

		if (y <= profile.highestY) continue; // no new peak — skip everything

		updateHighestY(player, y);
		updateCheckpoint(player, y);

		const newLevel = computeLevel(y);
		if (newLevel <= profile.currentLevel) continue; // no level-up

		profile.currentLevel = newLevel;
		const newJumpHeight = computeJumpHeight(newLevel, profile.rebirthCount);
		profile.totalJumpBonus = newJumpHeight;

		const humanoid = character.FindFirstChildOfClass("Humanoid");
		if (humanoid !== undefined) {
			humanoid.JumpHeight = newJumpHeight;
		}

		ServerRemotes.Get("LevelUp").SendToPlayer(player, newLevel, newJumpHeight);
		print(`[HeightTracker] ${player.Name} → level ${newLevel}, jumpHeight=${newJumpHeight}`);
	}
});
