/**
 * Mock Data for Performance Testing
 * 
 * Based on research from popular canvas editors (Figma, React Flow, n8n):
 * - Small: ~50 nodes - Should be instant, baseline performance
 * - Medium: ~500 nodes - Typical large workflow, should feel smooth
 * - Large: ~2000 nodes - Stress test threshold, acceptable with optimizations
 * - Stress: ~10000 nodes - Extreme case, tests virtualization needs
 * 
 * Edge density: ~1.5-2x nodes (typical workflow patterns)
 */

export { smallDataset } from './small';
export { mediumDataset } from './medium';
export { largeDataset } from './large';
export { stressDataset } from './stress';

export type { MockDataset } from './types';
