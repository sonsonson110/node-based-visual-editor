/**
 * Stress Dataset - 10000 nodes
 * 
 * Extreme stress test. Tests absolute limits and validates virtualization.
 * This represents edge cases like massive automation systems or data pipelines.
 * 
 * Patterns tested: Random layout (worst case for rendering/culling)
 * Expected: Will likely require virtualization, progressive loading, or canvas rendering
 * 
 * Reference: Figma handles thousands of objects by using:
 * - WebGL rendering instead of DOM
 * - Spatial indexing for visibility culling
 * - Property-level updates instead of full re-renders
 */

import { generateMockData } from './generators';
import type { MockDataset } from './types';

const { nodes, edges } = generateMockData({
  nodeCount: 10000,
  pattern: 'random',
  edgeDensity: 1.2, // Lower density to keep edge count manageable
  seed: 42,
});

export const stressDataset: MockDataset = {
  name: 'Stress Dataset',
  description: '10000 nodes in random layout - extreme stress test',
  nodes,
  edges,
  expectedMetrics: {
    nodeCount: 10000,
    edgeCount: edges.length,
    targetFrameTime: 50, // 20fps minimum acceptable
    maxInitialRenderTime: 5000, // 5 seconds
  },
};
