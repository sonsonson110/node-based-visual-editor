import React, { useState } from "react";
import { SectionContainer, SectionContent, SectionHeader } from "../styled";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  initialExpanded?: boolean;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  initialExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  return (
    <SectionContainer>
      <SectionHeader
        $isExpanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{title}</span>
        <span>{isExpanded ? "▾" : "▸"}</span>
      </SectionHeader>
      {isExpanded && <SectionContent>{children}</SectionContent>}
    </SectionContainer>
  );
};
