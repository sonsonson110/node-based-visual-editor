import styled, { css } from "styled-components";

export const RootContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #f0f0f0;
  position: relative;
  overflow: hidden;
  background-image: linear-gradient(#999 1px, transparent 1px),
    linear-gradient(90deg, #999 1px, transparent 1px),
    linear-gradient(#ccc 1px, transparent 1px),
    linear-gradient(90deg, #ccc 1px, transparent 1px);
`;

export const UIContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  user-select: none;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const PositionDisplay = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-family: monospace;
`;

export const WorldContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: 0 0;
`;

export const SVGContainer = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  overflow: visible;
  pointer-events: none;
`;

export const NodeContainer = styled.div<{
  $x: number;
  $y: number;
  $width: number;
  $height: number;
  $isSelected: boolean;
}>`
  ${({ $x, $y, $width, $height, $isSelected }) => css`
    left: ${$x}px;
    top: ${$y}px;
    width: ${$width - 2}px;
    height: ${$height - 2}px;
    border: ${$isSelected ? "1px solid #007bff" : "1px solid black"};
  `}
  position: absolute;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ResizeHandle = styled.div`
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 8px;
  height: 8px;
  cursor: nwse-resize;
  background: linear-gradient(135deg, transparent 50%, #007bff 50%);
  border-bottom-right-radius: 2px;
`;
