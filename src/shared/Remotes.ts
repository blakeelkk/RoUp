import Net from "@rbxts/net";

const Remotes = Net.Definitions.Create({
	LevelUp: Net.Definitions.ServerToClientEvent<[newLevel: number, newJumpHeight: number]>(),
});

export = Remotes;
