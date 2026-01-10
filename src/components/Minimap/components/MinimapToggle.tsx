import { Activity, useState } from "react";
import { MinimapContainer, ToggleTab } from "../styled";
import Minimap from "./Minimap";

const MinimapToggle = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  return (
    <MinimapContainer>
      <Activity mode={isMinimized ? "hidden" : "visible"}>
        <Minimap />
      </Activity>
      <ToggleTab
        $isMinimized={isMinimized}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <strong>Minimap</strong>
        <span>{isMinimized ? "◀" : "▶"}</span>
      </ToggleTab>
    </MinimapContainer>
  );
};

export default MinimapToggle;
