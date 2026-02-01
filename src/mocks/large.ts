/**
 * Large Dataset - 2000 nodes
 * 
 * Stress test threshold. Tests the limits before virtualization becomes necessary.
 * This represents very large design files or complex automation workflows.
 * 
 * Patterns tested: Clustered layout (realistic for large organized projects)
 * Expected: 30fps acceptable, optimizations like virtualization may be needed
 * 
 * Reference: React Flow documentation recommends testing with 1000+ nodes
 * for performance optimization validation.
 */

import { generateMockData } from './generators';
import type { MockDataset } from './types';

const { nodes, edges } = generateMockData({
  nodeCount: 2000,
  pattern: 'clustered',
  edgeDensity: 1.5,
  seed: 42,
});

export const largeDataset: MockDataset = {
  name: 'Large Dataset',
  description: '2000 nodes in clustered layout - stress test threshold',
  nodes,
  edges,
  expectedMetrics: {
    nodeCount: 2000,
    edgeCount: edges.length,
    targetFrameTime: 33.33, // 30fps acceptable
    maxInitialRenderTime: 2000, // 2 seconds
  },
};
