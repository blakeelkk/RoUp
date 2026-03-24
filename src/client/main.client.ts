import React from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import HeightTrackerHUD from "client/components/HeightTracker";

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;
const root = createRoot(playerGui);
root.render(React.createElement(HeightTrackerHUD));
