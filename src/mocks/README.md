# Performance Test Mock Data

This folder contains mock datasets for testing the performance of the node-based visual editor at various scales.

## Research Background

Based on analysis of popular canvas editors:

### Figma

- Handles documents with thousands of objects
- Uses WebGL for rendering (not DOM)
- Employs property-level updates to minimize re-renders
- Spatial indexing for visibility culling

### React Flow

- Recommends testing with 100-1000+ nodes
- Emphasizes memoization (`React.memo`, `useCallback`)
- Suggests separating frequently-changing state
- Recommends virtualization for 1000+ nodes

### n8n (Workflow Editor)

- Typical workflows: 10-100 nodes
- Large enterprise workflows: 200-500 nodes
- Uses lazy loading for node types

## Datasets

| Dataset | Nodes | Edges | Pattern | Use Case |
|---------|-------|-------|---------|----------|
| Small | 50 | ~75 | Grid | Baseline - should be instant |
| Medium | 500 | ~900 | Pipeline | Large workflow - should be smooth |
| Large | 2000 | ~3000 | Clustered | Stress test - acceptable with optimizations |
| Stress | 10000 | ~12000 | Random | Extreme - tests virtualization needs |

## Usage

```typescript
import { smallDataset, mediumDataset, largeDataset, stressDataset } from '../mocks';

// In editorSlice.ts or App.tsx
const initialState = {
  nodes: mediumDataset.nodes,
  edges: mediumDataset.edges,
  // ...
};
```

## Layout Patterns

1. **Grid** - Uniform grid arrangement (baseline)
2. **Pipeline** - Linear chains with branches (workflow editors)
3. **Clustered** - Grouped nodes (organized projects)
4. **Tree** - Hierarchical layout (org charts, decision trees)
5. **Random** - Scattered positions (worst-case rendering)

## Performance Targets

| Metric | Small | Medium | Large | Stress |
|--------|-------|--------|-------|--------|
| Target FPS | 60 | 60 | 30 | 20 |
| Max Initial Render | 100ms | 500ms | 2s | 5s |
| Drag Responsiveness | Instant | Instant | <50ms | <100ms |

## Optimization Checklist

When performance degrades, consider:

1. [ ] **Memoization** - `React.memo` on NodeComponent, EdgeComponent
2. [ ] **Selector optimization** - Separate frequently-updated state
3. [ ] **Virtualization** - Only render visible nodes/edges
4. [ ] **Canvas rendering** - Switch to Canvas/WebGL for large datasets
5. [ ] **Spatial indexing** - R-tree or quadtree for visibility culling
6. [ ] **Throttling** - RAF-based updates for drag operations
7. [ ] **Edge simplification** - Simpler paths for distant edges
