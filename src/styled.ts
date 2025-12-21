import styled from "styled-components";

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

export const NodeResizer = styled.div<{
  position: string;
  outlineOffset?: number;
}>`
  position: absolute;
  width: 8px;
  height: 8px;
  background: blue;
  border-radius: 9999px;
  transform: translate(-50%, -50%);
  z-index: 10;
  border: 1px solid #fff;

  ${({ position, outlineOffset }) => {
    switch (position) {
      case "top-left":
        return `
          top: -${outlineOffset}px;
          left: -${outlineOffset}px;
          cursor: nwse-resize;
        `;
      case "top-middle":
        return `
          top: -${outlineOffset}px;
          left: 50%;
          cursor: ns-resize;
        `;
      case "top-right":
        return `
          top: -${outlineOffset}px;
          left: calc(100% + ${outlineOffset}px);
          cursor: nesw-resize;
        `;
      case "bottom-left":
        return `
          top: calc(100% + ${outlineOffset}px);
          left: -${outlineOffset}px;
          cursor: nesw-resize;
        `;
      case "bottom-middle":
        return `
          top: calc(100% + ${outlineOffset}px);
          left: 50%;
          cursor: ns-resize;
        `;
      case "bottom-right":
        return `
          top: calc(100% + ${outlineOffset}px);
          left: calc(100% + ${outlineOffset}px);
          cursor: nwse-resize;
        `;
      case "middle-left":
        return `
          top: 50%;
          left: -${outlineOffset}px;
          cursor: ew-resize;
        `;
      case "middle-right":
        return `
          top: 50%;
          left: calc(100% + ${outlineOffset}px);
          cursor: ew-resize;
        `;
      default:
        return "";
    }
  }}
`;
