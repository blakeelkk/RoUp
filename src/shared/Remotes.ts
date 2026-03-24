import Net from "@rbxts/net";

const Remotes = Net.Definitions.Create({
	LevelUp: Net.Definitions.ServerToClientEvent<[newLevel: number, newJumpHeight: number]>(),
	HeightUpdate: Net.Definitions.ServerToClientEvent<[currentY: number, highestY: number, rebirthCount: number]>(),
	RebirthRequest: Net.Definitions.ClientToServerEvent<[]>(),
});

export = Remotes;
