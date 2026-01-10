import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { MAP_ORIENTATIONS } from "../../../constants";
import {
  selectMapOrientation,
  setMapOrientation,
} from "../../../store/editorSlice";
import { OrientationGroup as StyledOrientationGroup, RadioLabel, RadioSpan } from "../styled";
import { CollapsibleSection } from "./CollapsibleSection";

export const OrientationGroup: React.FC = () => {
  const dispatch = useDispatch();
  const selectedMapOrientation = useSelector(selectMapOrientation);

  return (
    <CollapsibleSection title="Orientation">
      <StyledOrientationGroup>
        {MAP_ORIENTATIONS.map((orientation) => (
          <RadioLabel key={orientation}>
            <input
              type="radio"
              name="mapOrientation"
              value={orientation}
              checked={selectedMapOrientation === orientation}
              onChange={() => dispatch(setMapOrientation(orientation))}
            />
            <RadioSpan>{orientation}</RadioSpan>
          </RadioLabel>
        ))}
      </StyledOrientationGroup>
    </CollapsibleSection>
  );
};
