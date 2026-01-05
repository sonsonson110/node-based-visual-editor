import React, { Activity, useState } from "react";
import { EdgeGroup } from "./EdgeGroup";
import { NodeGroup } from "./NodeGroup";
import { OrientationGroup } from "./OrientationGroup";
import { PanelContainer, PanelContent, PanelHeader } from "../styled";

const ControlPanel: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <PanelContainer onMouseDown={(e) => e.stopPropagation()}>
      <PanelHeader
        $isMinimized={isMinimized}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <strong>Control Panel</strong>
        <span>{isMinimized ? "▼" : "▲"}</span>
      </PanelHeader>
      <Activity mode={isMinimized ? "hidden" : "visible"}>
        <PanelContent>
          <NodeGroup />
          <EdgeGroup />
          <OrientationGroup />
        </PanelContent>
      </Activity>
    </PanelContainer>
  );
};

export default ControlPanel;
