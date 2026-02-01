import type { Node, Edge } from '../types';
import { DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT } from '../constants';

/**
 * Layout patterns for generating realistic node arrangements
 */
export type LayoutPattern = 'grid' | 'tree' | 'random' | 'clustered' | 'pipeline';

interface GeneratorOptions {
  nodeCount: number;
  pattern: LayoutPattern;
  /**
   * Edge density multiplier (1.0 = nodeCount edges, 2.0 = 2x nodeCount edges)
   * Clamped to valid range based on node count
   */
  edgeDensity?: number;
  /**
   * Spacing between nodes
   */
  spacing?: number;
  /**
   * Random seed for reproducible results
   */
  seed?: number;
}

// Simple seeded random number generator for reproducible results
function createSeededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

// Word lists for generating random text content
const ADJECTIVES = ['Fast', 'Smart', 'Cool', 'New', 'Big', 'Red', 'Blue', 'Hot', 'Cold', 'Dark', 'Light', 'Fresh', 'Quick', 'Slow', 'Bright'];
const NOUNS = ['Task', 'Node', 'Step', 'Flow', 'Data', 'API', 'Job', 'Event', 'Action', 'Block', 'Item', 'Process', 'Handler', 'Worker', 'Service'];
const VERBS = ['Run', 'Send', 'Get', 'Set', 'Load', 'Save', 'Push', 'Pull', 'Start', 'Stop', 'Check', 'Filter', 'Map', 'Sort', 'Parse'];

/**
 * Generate random text content for nodes (< 30 chars)
 */
function generateNodeContent(random: () => number): string {
  const adj = ADJECTIVES[Math.floor(random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(random() * NOUNS.length)];
  const num = Math.floor(random() * 100);
  return `${adj} ${noun} ${num}`;
}

/**
 * Generate random text label for edges (< 30 chars)
 */
function generateEdgeLabel(random: () => number): string {
  const verb = VERBS[Math.floor(random() * VERBS.length)];
  const noun = NOUNS[Math.floor(random() * NOUNS.length)].toLowerCase();
  return `${verb} ${noun}`;
}

/**
 * Generate nodes in a grid pattern
 */
function generateGridNodes(
  count: number,
  spacing: number,
  nodeWidth: number,
  nodeHeight: number
): Node[] {
  const cols = Math.ceil(Math.sqrt(count));
  const nodes: Node[] = [];

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    nodes.push({
      id: `node-${i + 1}`,
      x: col * (nodeWidth + spacing),
      y: row * (nodeHeight + spacing),
      width: nodeWidth,
      height: nodeHeight,
    });
  }

  return nodes;
}

/**
 * Generate nodes in a tree/hierarchy pattern (common in workflow editors)
 */
function generateTreeNodes(
  count: number,
  spacing: number,
  nodeWidth: number,
  nodeHeight: number
): Node[] {
  const nodes: Node[] = [];
  const branchFactor = 3; // Each node can have up to 3 children
  let currentLevel = 0;
  let nodesInLevel = 1;
  let nodeIndex = 0;

  while (nodeIndex < count) {
    const nodesThisLevel = Math.min(nodesInLevel, count - nodeIndex);
    const levelWidth = nodesThisLevel * (nodeWidth + spacing);
    const startX = -levelWidth / 2;

    for (let i = 0; i < nodesThisLevel; i++) {
      nodes.push({
        id: `node-${nodeIndex + 1}`,
        x: startX + i * (nodeWidth + spacing),
        y: currentLevel * (nodeHeight + spacing * 2),
        width: nodeWidth,
        height: nodeHeight,
      });
      nodeIndex++;
    }

    currentLevel++;
    nodesInLevel *= branchFactor;
  }

  return nodes;
}

/**
 * Generate nodes in random positions (stress tests rendering with scattered nodes)
 */
function generateRandomNodes(
  count: number,
  spacing: number,
  nodeWidth: number,
  nodeHeight: number,
  random: () => number
): Node[] {
  const nodes: Node[] = [];
  const worldSize = Math.sqrt(count) * (nodeWidth + spacing) * 2;

  for (let i = 0; i < count; i++) {
    nodes.push({
      id: `node-${i + 1}`,
      x: (random() - 0.5) * worldSize,
      y: (random() - 0.5) * worldSize,
      width: nodeWidth,
      height: nodeHeight,
    });
  }

  return nodes;
}

/**
 * Generate nodes in clusters (simulates grouped/organized workflows)
 */
function generateClusteredNodes(
  count: number,
  spacing: number,
  nodeWidth: number,
  nodeHeight: number,
  random: () => number
): Node[] {
  const nodes: Node[] = [];
  const clusterCount = Math.ceil(count / 20); // ~20 nodes per cluster
  const clusterSpacing = (nodeWidth + spacing) * 8;

  for (let i = 0; i < count; i++) {
    const cluster = i % clusterCount;
    const clusterRow = Math.floor(cluster / Math.ceil(Math.sqrt(clusterCount)));
    const clusterCol = cluster % Math.ceil(Math.sqrt(clusterCount));

    const clusterCenterX = clusterCol * clusterSpacing;
    const clusterCenterY = clusterRow * clusterSpacing;

    // Random position within cluster
    const offsetX = (random() - 0.5) * clusterSpacing * 0.6;
    const offsetY = (random() - 0.5) * clusterSpacing * 0.6;

    nodes.push({
      id: `node-${i + 1}`,
      x: clusterCenterX + offsetX,
      y: clusterCenterY + offsetY,
      width: nodeWidth,
      height: nodeHeight,
    });
  }

  return nodes;
}

/**
 * Generate nodes in a pipeline pattern (linear chains with branches - like n8n)
 */
function generatePipelineNodes(
  count: number,
  spacing: number,
  nodeWidth: number,
  nodeHeight: number,
  random: () => number
): Node[] {
  const nodes: Node[] = [];
  const pipelineCount = Math.ceil(count / 15); // ~15 nodes per pipeline
  const pipelineSpacing = (nodeHeight + spacing) * 3;

  for (let i = 0; i < count; i++) {
    const pipeline = i % pipelineCount;
    const positionInPipeline = Math.floor(i / pipelineCount);

    // Add some variation to y position for branching effect
    const branchOffset = (random() - 0.5) * spacing * 2;

    nodes.push({
      id: `node-${i + 1}`,
      x: positionInPipeline * (nodeWidth + spacing),
      y: pipeline * pipelineSpacing + branchOffset,
      width: nodeWidth,
      height: nodeHeight,
    });
  }

  return nodes;
}

/**
 * Generate edges based on pattern and density
 */
function generateEdges(
  nodes: Node[],
  pattern: LayoutPattern,
  density: number,
  random: () => number
): Edge[] {
  const edges: Edge[] = [];
  const edgeSet = new Set<string>(); // Prevent duplicates
  const targetEdgeCount = Math.floor(nodes.length * density);

  const addEdge = (from: string, to: string): boolean => {
    const key = `${from}->${to}`;
    if (from === to || edgeSet.has(key)) return false;
    edgeSet.add(key);
    edges.push({ from, to, label: generateEdgeLabel(random) });
    return true;
  };

  // Pattern-specific edge generation
  switch (pattern) {
    case 'grid': {
      const cols = Math.ceil(Math.sqrt(nodes.length));
      for (let i = 0; i < nodes.length && edges.length < targetEdgeCount; i++) {
        const rightNeighbor = i + 1;
        const bottomNeighbor = i + cols;
        if (rightNeighbor % cols !== 0 && rightNeighbor < nodes.length) {
          addEdge(nodes[i].id, nodes[rightNeighbor].id);
        }
        if (bottomNeighbor < nodes.length) {
          addEdge(nodes[i].id, nodes[bottomNeighbor].id);
        }
      }
      break;
    }
    case 'tree': {
      const branchFactor = 3;
      for (let i = 1; i < nodes.length && edges.length < targetEdgeCount; i++) {
        const parentIndex = Math.floor((i - 1) / branchFactor);
        if (parentIndex >= 0 && parentIndex < nodes.length) {
          addEdge(nodes[parentIndex].id, nodes[i].id);
        }
      }
      break;
    }
    case 'pipeline': {
      const pipelineCount = Math.ceil(nodes.length / 15);
      for (let i = 0; i < nodes.length && edges.length < targetEdgeCount; i++) {
        const nextInPipeline = i + pipelineCount;
        if (nextInPipeline < nodes.length) {
          addEdge(nodes[i].id, nodes[nextInPipeline].id);
        }
        // Occasional cross-pipeline connections
        if (random() < 0.1 && i + 1 < nodes.length) {
          addEdge(nodes[i].id, nodes[i + 1].id);
        }
      }
      break;
    }
    default: {
      // Random/clustered: connect to nearby nodes
      for (let i = 0; i < nodes.length && edges.length < targetEdgeCount; i++) {
        const connectionCount = Math.floor(random() * 3) + 1;
        for (let c = 0; c < connectionCount && edges.length < targetEdgeCount; c++) {
          const targetIndex = Math.floor(random() * nodes.length);
          addEdge(nodes[i].id, nodes[targetIndex].id);
        }
      }
    }
  }

  // Add random edges if we haven't reached target density
  while (edges.length < targetEdgeCount) {
    const fromIndex = Math.floor(random() * nodes.length);
    const toIndex = Math.floor(random() * nodes.length);
    addEdge(nodes[fromIndex].id, nodes[toIndex].id);
  }

  return edges;
}

/**
 * Main generator function
 */
export function generateMockData(options: GeneratorOptions): { nodes: Node[]; edges: Edge[] } {
  const {
    nodeCount,
    pattern,
    edgeDensity = 1.5,
    spacing = 40,
    seed = 12345,
  } = options;

  const random = createSeededRandom(seed);
  const nodeWidth = DEFAULT_NODE_WIDTH;
  const nodeHeight = DEFAULT_NODE_HEIGHT;

  let nodes: Node[];

  switch (pattern) {
    case 'grid':
      nodes = generateGridNodes(nodeCount, spacing, nodeWidth, nodeHeight);
      break;
    case 'tree':
      nodes = generateTreeNodes(nodeCount, spacing, nodeWidth, nodeHeight);
      break;
    case 'random':
      nodes = generateRandomNodes(nodeCount, spacing, nodeWidth, nodeHeight, random);
      break;
    case 'clustered':
      nodes = generateClusteredNodes(nodeCount, spacing, nodeWidth, nodeHeight, random);
      break;
    case 'pipeline':
      nodes = generatePipelineNodes(nodeCount, spacing, nodeWidth, nodeHeight, random);
      break;
    default:
      nodes = generateGridNodes(nodeCount, spacing, nodeWidth, nodeHeight);
  }

  // Add random content to each node
  nodes = nodes.map((node) => ({
    ...node,
    content: generateNodeContent(random),
  }));

  const edges = generateEdges(nodes, pattern, edgeDensity, random);

  return { nodes, edges };
}
