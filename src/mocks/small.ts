/**
 * Small Dataset - 50 nodes
 * 
 * Baseline performance test. Should render instantly with no perceptible lag.
 * This represents a typical small workflow or diagram.
 * 
 * Patterns tested: Grid layout (most common for small diagrams)
 * Expected: 60fps during all interactions
 */

import { generateMockData } from './generators';
import type { MockDataset } from './types';

const { nodes, edges } = generateMockData({
  nodeCount: 50,
  pattern: 'grid',
  edgeDensity: 1.5,
  seed: 42,
});

export const smallDataset: MockDataset = {
  name: 'Small Dataset',
  description: '50 nodes in grid layout - baseline performance test',
  nodes,
  edges,
  expectedMetrics: {
    nodeCount: 50,
    edgeCount: edges.length,
    targetFrameTime: 16.67, // 60fps
    maxInitialRenderTime: 100, // 100ms
  },
};
