export const GameConfig = {
	DEFAULT_JUMP_HEIGHT: 7.2,
	CHECKPOINT_GAMEPASS_ID: 0, // TODO: replace with real game pass ID

	REBIRTH_Y_THRESHOLD: 5000, // Y height required to become eligible for rebirth
	REBIRTH_JUMP_BONUS: 1.0, // permanent jump height added per rebirth

	LEVEL_THRESHOLDS: [
		{ level: 1, requiredY: 0, jumpBonus: 0.0 },
		{ level: 2, requiredY: 500, jumpBonus: 0.5 },
		{ level: 3, requiredY: 1000, jumpBonus: 0.5 },
		{ level: 4, requiredY: 1750, jumpBonus: 0.5 },
		{ level: 5, requiredY: 2750, jumpBonus: 0.5 },
		{ level: 6, requiredY: 4000, jumpBonus: 0.5 },
		// extend as needed
	] as const,
} as const;
