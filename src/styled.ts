import styled, { css, keyframes } from "styled-components";

export const RootContainer = styled.div`
  width: 100svw;
  height: 100svh;
  background-color: #f0f0f0;
  position: relative;
  overflow: hidden;
  background-image: linear-gradient(#999 1px, transparent 1px),
    linear-gradient(90deg, #999 1px, transparent 1px),
    linear-gradient(#ccc 1px, transparent 1px),
    linear-gradient(90deg, #ccc 1px, transparent 1px);
  touch-action: none; /* Prevents default touch behaviors like pinch-zoom, pan */
  -webkit-user-select: none; /* Prevents text selection on iOS */
  user-select: none;
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

export const NodeContentTextarea = styled.textarea<{ $maxWidth?: number }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border: none;
  outline: none;
  resize: none;
  text-align: center;
  font-family: inherit;
  font-size: inherit;
  background: transparent;
  field-sizing: content;
  max-width: ${({ $maxWidth }) => ($maxWidth ? `${$maxWidth}px` : "100%")};
`;

export const NodeContentText = styled.span`
  width: 100%;
  height: 100%;
  max-height: fit-content;
  word-break: break-all;
  text-align: center;
  pointer-events: none;
`;

export const ResizeHandle = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 8px;
  height: 8px;
  cursor: nwse-resize;
  background: linear-gradient(135deg, transparent 50%, #007bff 50%);
`;

export const NodeResizingIndicator = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 4px;
  width: max-content;
  background: rgba(0, 123, 255, 0.1);
  border: 2px dashed #007bff;
  pointer-events: none;
  font-size: 10px;
  margin-top: 4px;
`;

export const NodeContainer = styled.div<{
  $x: number;
  $y: number;
  $width: number;
  $height: number;
  $isSelected: boolean;
  $isDisabled?: boolean;
}>`
  ${({ $x, $y, $width, $height, $isSelected, $isDisabled }) => {
    const baseBorderColor = $isSelected ? "#007bff" : "#000000";
    const borderColor = $isDisabled ? `${baseBorderColor}80` : baseBorderColor;

    return css`
      left: ${$x}px;
      top: ${$y}px;
      width: ${$width - 2}px;
      height: ${$height - 2}px;
      border-width: 1px;
      border-style: solid;
      border-color: ${borderColor};
      background: ${$isDisabled ? "#FFFFFF80" : "white"};

      ${$isDisabled &&
      css`
        & ${NodeContentText}, & ${NodeContentTextarea}, & ${ResizeHandle} {
          opacity: 0.5;
        }
      `}
    `;
  }}
  position: absolute;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const dashAnimation = keyframes`
  to {
    stroke-dashoffset: -10;
  }
`;

export const EdgeVisblePath = styled.path<{
  $isAnimated: boolean;
}>`
  ${({ $isAnimated }) =>
    $isAnimated &&
    css`
      stroke-dasharray: 5, 5;
      animation: ${dashAnimation} 0.5s linear infinite;
    `}
`;
