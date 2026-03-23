import { Players } from "@rbxts/services";
import { GameConfig } from "shared/GameConfig";
import { getProfile } from "server/PlayerManager";
import { computeJumpHeight, applyJumpHeight } from "server/JumpManager";
import Remotes from "shared/Remotes";

// Prevents a player from triggering multiple concurrent rebirths
const processingRebirth = new Set<Player>();

Remotes.Server.OnEvent("RebirthRequest", (player) => {
	if (processingRebirth.has(player)) return;

	const profile = getProfile(player);
	if (profile === undefined) return;

	if (profile.highestY < GameConfig.REBIRTH_Y_THRESHOLD) {
		print(
			`[RebirthManager] ${player.Name} does not meet threshold (highestY=${profile.highestY}, required=${GameConfig.REBIRTH_Y_THRESHOLD})`,
		);
		return;
	}

	processingRebirth.add(player);

	// Update profile — highestY intentionally not reset (never decreases)
	profile.rebirthCount += 1;
	profile.currentLevel = 1;
	profile.totalJumpBonus = computeJumpHeight(1, profile.rebirthCount);

	print(
		`[RebirthManager] ${player.Name} rebirthCount=${profile.rebirthCount}, jumpHeight=${profile.totalJumpBonus}`,
	);

	// Reset character to spawn, then restore jump height
	player.LoadCharacter();
	player.CharacterAdded.Wait();
	applyJumpHeight(player);

	processingRebirth.delete(player);
});

// Clean up if player leaves mid-rebirth
Players.PlayerRemoving.Connect((player) => processingRebirth.delete(player));
