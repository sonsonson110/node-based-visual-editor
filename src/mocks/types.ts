import type { Node, Edge } from '../types';

export interface MockDataset {
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  expectedMetrics: {
    nodeCount: number;
    edgeCount: number;
    // Target frame time in ms (16.67ms = 60fps, 33.33ms = 30fps)
    targetFrameTime: number;
    // Max acceptable initial render time in ms
    maxInitialRenderTime: number;
  };
}
