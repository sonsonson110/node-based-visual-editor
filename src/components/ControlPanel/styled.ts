import styled from "styled-components";

export const PanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 180px;
  top: 10px;
  left: 10px;
  z-index: 10;
`;

export const PanelHeader = styled.div<{ $isMinimized: boolean }>`
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border: 1px solid black;
  border-bottom: ${({ $isMinimized }) =>
    $isMinimized ? "1px solid black" : "none"};
  padding: 8px;
  gap: 4px;
  user-select: none;
`;

export const PanelContent = styled.div`
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid black;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  user-select: none;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const Row = styled.div`
  display: flex;
  gap: 5px;
`;

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const StyleRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 5px;
`;

export const ColorLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 5px;
`;

export const OrientationGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

export const RadioSpan = styled.span`
  margin-left: 4px;
`;

export const Divider = styled.hr`
  width: 100%;
  border: 1px solid #ddd;
  margin: 0;
`;
