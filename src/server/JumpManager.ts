import { GameConfig } from "shared/GameConfig";
import { getProfile } from "server/PlayerManager";

// Sums incremental jump bonuses for all levels up to and including `level`
export function computeJumpHeight(level: number, rebirthCount: number): number {
	let levelBonus = 0;
	for (const threshold of GameConfig.LEVEL_THRESHOLDS) {
		if (threshold.level <= level) {
			levelBonus += threshold.jumpBonus;
		}
	}
	return GameConfig.DEFAULT_JUMP_HEIGHT + levelBonus + rebirthCount * GameConfig.REBIRTH_JUMP_BONUS;
}

// Reads the player's profile and applies the correct jump height to their Humanoid
export function applyJumpHeight(player: Player): void {
	const profile = getProfile(player);
	if (profile === undefined) return;

	const character = player.Character;
	if (character === undefined) return;

	const humanoid = character.FindFirstChildOfClass("Humanoid");
	if (humanoid === undefined) return;

	humanoid.JumpHeight = computeJumpHeight(profile.currentLevel, profile.rebirthCount);
}
