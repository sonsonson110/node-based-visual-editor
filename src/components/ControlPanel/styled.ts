import styled from "styled-components";

const PANEL_BG = "rgba(246, 246, 246, 0.92)";
const PANEL_BORDER = "rgba(0, 0, 0, 0.15)";
const SECTION_BORDER = "rgba(0, 0, 0, 0.08)";

export const PanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 192px;
  top: 8px;
  left: 8px;
  max-height: calc(100vh - 16px);
  z-index: 10;
  touch-action: auto;
  border: 1px solid ${PANEL_BORDER};
  border-radius: 6px;
  background: ${PANEL_BG};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

export const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 8px 10px;
  font-size: 0.8em;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #333;
  user-select: none;
  border-bottom: 1px solid ${PANEL_BORDER};
  flex-shrink: 0;
`;

export const PanelContent = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overscroll-behavior: contain;
  user-select: none;
  font-size: 0.85em;
`;

export const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;

  & + & {
    border-top: 1px solid ${SECTION_BORDER};
  }
`;

export const SectionHeader = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 6px 10px;
  color: #555;
  background: ${({ $isExpanded }) =>
    $isExpanded ? "rgba(0, 0, 0, 0.03)" : "transparent"};

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

export const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 4px 10px 8px;
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
  border: none;
  border-top: 1px solid ${SECTION_BORDER};
  margin: 0;
`;
