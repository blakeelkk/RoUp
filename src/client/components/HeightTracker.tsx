import React, { useState, useEffect } from "@rbxts/react";
import Remotes from "shared/Remotes";

const PANEL_SIZE = new UDim2(0, 220, 0, 110);
const PANEL_POSITION = new UDim2(1, -10, 0, 10);
const LABEL_SIZE = new UDim2(1, 0, 0, 30);
const BG_COLOR = new Color3(0, 0, 0);
const TEXT_COLOR = new Color3(1, 1, 1);

export default function HeightTrackerHUD() {
	const [currentY, setCurrentY] = useState(0);
	const [highestY, setHighestY] = useState(0);
	const [rebirths, setRebirths] = useState(0);

	useEffect(() => {
		const conn = Remotes.Client.Get("HeightUpdate").Connect((cy, hy, rb) => {
			setCurrentY(math.floor(cy));
			setHighestY(math.floor(hy));
			setRebirths(rb);
		});
		return () => conn.Disconnect();
	}, []);

	return (
		<screengui ResetOnSpawn={false} DisplayOrder={10}>
			<frame
				AnchorPoint={new Vector2(1, 0)}
				Position={PANEL_POSITION}
				Size={PANEL_SIZE}
				BackgroundColor3={BG_COLOR}
				BackgroundTransparency={0.4}
				BorderSizePixel={0}
			>
				<uilistlayout
					FillDirection={Enum.FillDirection.Vertical}
					HorizontalAlignment={Enum.HorizontalAlignment.Left}
					Padding={new UDim(0, 4)}
				/>
				<uipadding
					PaddingLeft={new UDim(0, 8)}
					PaddingTop={new UDim(0, 8)}
					PaddingRight={new UDim(0, 8)}
				/>
				<textlabel
					Size={LABEL_SIZE}
					BackgroundTransparency={1}
					Text={`Height: ${currentY}`}
					TextColor3={TEXT_COLOR}
					TextXAlignment={Enum.TextXAlignment.Left}
					Font={Enum.Font.GothamBold}
					TextSize={18}
				/>
				<textlabel
					Size={LABEL_SIZE}
					BackgroundTransparency={1}
					Text={`Best: ${highestY}`}
					TextColor3={TEXT_COLOR}
					TextXAlignment={Enum.TextXAlignment.Left}
					Font={Enum.Font.GothamBold}
					TextSize={18}
				/>
				<textlabel
					Size={LABEL_SIZE}
					BackgroundTransparency={1}
					Text={`Rebirths: ${rebirths}`}
					TextColor3={TEXT_COLOR}
					TextXAlignment={Enum.TextXAlignment.Left}
					Font={Enum.Font.GothamBold}
					TextSize={18}
				/>
			</frame>
		</screengui>
	);
}
