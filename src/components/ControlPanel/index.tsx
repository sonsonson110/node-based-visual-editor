import React, { Activity, useState } from "react";
import { EdgeGroup } from "./components/EdgeGroup";
import { NodeGroup } from "./components/NodeGroup";
import { OrientationGroup } from "./components/OrientationGroup";
import { PanelContainer, PanelContent, PanelHeader } from "./styled";

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
