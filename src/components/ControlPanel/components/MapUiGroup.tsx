import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectMinimapConfig,
  selectShowEdges,
  setMinimapOpacity,
  setMinimapSize,
  setMinimapVisible,
  setShowEdges,
} from "../../../store/mapUiSlice";
import { CheckboxLabel, Row } from "../styled";
import { CollapsibleSection } from "./CollapsibleSection";

const MINIMAP_SIZE_MIN = 100;
const MINIMAP_SIZE_MAX = 400;

export const MapUiGroup: React.FC = () => {
  const dispatch = useDispatch();
  const minimap = useSelector(selectMinimapConfig);
  const showEdges = useSelector(selectShowEdges);

  return (
    <CollapsibleSection title="Map UI">
      <CheckboxLabel>
        <input
          type="checkbox"
          checked={minimap.isVisible}
          onChange={(e) => dispatch(setMinimapVisible(e.target.checked))}
        />
        Show Minimap
      </CheckboxLabel>
      <Row>
        <label style={{ flex: 1 }}>
          W
          <input
            type="number"
            min={MINIMAP_SIZE_MIN}
            max={MINIMAP_SIZE_MAX}
            value={minimap.width}
            onChange={(e) =>
              dispatch(
                setMinimapSize({
                  width: Math.min(
                    MINIMAP_SIZE_MAX,
                    Math.max(MINIMAP_SIZE_MIN, Number(e.target.value))
                  ),
                  height: minimap.height,
                })
              )
            }
            style={{ width: "100%" }}
          />
        </label>
        <label style={{ flex: 1 }}>
          H
          <input
            type="number"
            min={MINIMAP_SIZE_MIN}
            max={MINIMAP_SIZE_MAX}
            value={minimap.height}
            onChange={(e) =>
              dispatch(
                setMinimapSize({
                  width: minimap.width,
                  height: Math.min(
                    MINIMAP_SIZE_MAX,
                    Math.max(MINIMAP_SIZE_MIN, Number(e.target.value))
                  ),
                })
              )
            }
            style={{ width: "100%" }}
          />
        </label>
      </Row>
      <label>
        Opacity: {minimap.opacity.toFixed(1)}
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.1}
          value={minimap.opacity}
          onChange={(e) => dispatch(setMinimapOpacity(Number(e.target.value)))}
          style={{ width: "100%" }}
        />
      </label>
      <CheckboxLabel>
        <input
          type="checkbox"
          checked={showEdges}
          onChange={(e) => dispatch(setShowEdges(e.target.checked))}
        />
        Show Edges
      </CheckboxLabel>
    </CollapsibleSection>
  );
};
