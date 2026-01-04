import React, { useState } from 'react';
import styled from 'styled-components';

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid black;
  &:last-child {
    border-bottom: none;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-weight: bold;
  font-size: 0.9em;
  padding: 8px;
`;

const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 0 8px 8px 8px;
`;

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  initialExpanded?: boolean;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, initialExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  return (
    <SectionContainer>
      <SectionHeader onClick={() => setIsExpanded(!isExpanded)}>
        <span>{title}</span>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </SectionHeader>
      {isExpanded && <SectionContent>{children}</SectionContent>}
    </SectionContainer>
  );
};
