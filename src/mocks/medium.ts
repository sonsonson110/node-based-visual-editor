/**
 * Medium Dataset - 500 nodes
 * 
 * Typical large workflow test. Should remain smooth with proper optimizations.
 * This represents a complex enterprise workflow or design system.
 * 
 * Patterns tested: Pipeline layout (realistic for workflow editors like n8n)
 * Expected: 60fps with proper memoization, 30fps acceptable during heavy operations
 */

import { generateMockData } from './generators';
import type { MockDataset } from './types';

const { nodes, edges } = generateMockData({
  nodeCount: 500,
  pattern: 'pipeline',
  edgeDensity: 1.8,
  seed: 42,
});

export const mediumDataset: MockDataset = {
  name: 'Medium Dataset',
  description: '500 nodes in pipeline layout - typical large workflow',
  nodes,
  edges,
  expectedMetrics: {
    nodeCount: 500,
    edgeCount: edges.length,
    targetFrameTime: 16.67, // 60fps target
    maxInitialRenderTime: 500, // 500ms
  },
};
