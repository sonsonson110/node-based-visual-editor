import styled from "styled-components";

export const MapWrapper = styled.div<{
  $width: number;
  $height: number;
  $opacity: number;
}>`
  position: absolute;
  bottom: 0;
  right: 0;
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  border: 1px solid black;
  background: rgba(255, 255, 255);
  overflow: hidden;
  user-select: none;
  opacity: ${({ $opacity }) => $opacity};
`;
