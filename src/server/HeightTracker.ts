import { Players, RunService } from "@rbxts/services";
import { GameConfig } from "shared/GameConfig";
import { getProfile, updateHighestY } from "server/PlayerManager";
import Remotes from "shared/Remotes";
import { computeJumpHeight } from "server/JumpManager";

const ServerRemotes = Remotes.Server;

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

		if (y <= profile.highestY) continue; // no new peak — skip everything

		updateHighestY(player, y);

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
