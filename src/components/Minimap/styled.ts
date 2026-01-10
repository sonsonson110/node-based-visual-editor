import styled from "styled-components";
import { MINIMAP_HEIGHT, MINIMAP_WIDTH } from "../../constants";

export const MinimapContainer = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: flex-end;
`;

export const MapWrapper = styled.div`
  width: ${MINIMAP_WIDTH}px;
  height: ${MINIMAP_HEIGHT}px;
  border: 1px solid black;
  background: rgba(255, 255, 255, 0.8);
  overflow: hidden;
  user-select: none;
`;

export const ToggleTab = styled.div<{ $isMinimized: boolean }>`
  writing-mode: vertical-rl;
  text-orientation: mixed;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid black;
  border-left: ${({ $isMinimized }) =>
    $isMinimized ? "1px solid black" : "none"};
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  padding: 4px;
`;
