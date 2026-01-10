# Node-Based Visual Editor - Copilot Instructions

## Project Overview
This is a React 19 + TypeScript + Vite project implementing a high-performance node-based visual editor. It features a custom "world" coordinate system with pan/zoom (viewport) functionality, manual drag-and-drop implementations for better control, and Redux Toolkit for state management.

## Key Architecture & Patterns

### 1. State Management (Redux Toolkit)
- **Central Store**: `src/store/editorSlice.ts` helps manage critical state: `nodes`, `edges`, `viewport`, `selectedNodeIds`.
- **Selectors**: Always use selectors from `editorSlice.ts` (e.g., `selectNodes`, `selectViewport`) to access state.
- **Actions**: Dispatch actions like `setNodes`, `setViewport` for updates.

### 2. Coordinate Systems
- **Screen vs. World**: The viewport transforms screen coordinates to world coordinates.
- **Conversion**: ALWAYS use `screenToWorld(x, y, viewport)` from `src/utils.ts` when handling mouse events on the canvas.
- **Rendering**: The `WorldContainer` component applies the CSS transform `translate(x, y) scale(zoom)`.

### 3. Canvas Interactions (Hooks)
Interactions are split into specialized hooks in `src/hooks/`. Prefer modifying these hooks over components for logic changes:
- `useMapInteraction.ts`: Entry point combining specific interactions.
- `useNodeMouseInteraction.ts`: Handles node dragging, selection, and grid snapping.
- `useCanvasPan.ts` / `useCanvasZoom.ts`: Manages viewport transforms.
- **Pattern**: These hooks attach global `mousemove`/`mouseup` listeners to `window` during active gestures to ensure tracking works outside the element bounds.

### 4. Component Structure
- **NodeComponent**: Renders individual nodes.
- **EdgeComponent**: Renders connections. Note that edges connect Node Right -> Node Left.
- **Layers**: Canvas -> WorldContainer -> [Edges, Nodes].

## Development Conventions

### Styling
- Use **Styled Components** (`styled-components`) for all styling.
- Define styles in `styled.ts` files co-located with components or in the global `src/styled.ts` for shared containers.

### Performance
- **Throttling**: Drags and rapid updates often use `requestAnimationFrame` (see `useNodeMouseInteraction.ts`) to avoid React render thrashing.
- **Memoization**: Use `useMemo` for derived data like `nodeMap` to avoid O(N) lookups during render loops.

### Data Models (`src/types.ts`)
- **Node**: `{ id, x, y, width, height }`
- **Edge**: `{ from, to, label?, color? }` -> Uniquely identified by `from` + `to`.
- **Viewport**: `{ x, y, zoom }`

### Utility Functions (`src/utils.ts`)
Pure helper functions for coordinate transformations and calculations:
- `screenToWorld(x, y, viewport)`: Converts screen coordinates to world coordinates.
- `snapToGrid(value)`: Snaps a value to the nearest grid line.
- `getDistance(x1, y1, x2, y2)`: Calculates Euclidean distance between two points.
- `getEdgeMetrics(...)`: Computes edge path and control points for rendering.

## Common Tasks

### Adding a new Interaction
1. Create a new hook (e.g., `useNewInteraction.ts`).
2. Integrate it into `useMapInteraction.ts`.
3. Use `screenToWorld` for coordinate math.

### Modifying Node Behavior
1. Update `NodeComponent.tsx` for visual changes.
2. Update `useNodeMouseInteraction.ts` for logic/drag behavior.

### Updating State
1. Add reducer to `src/store/editorSlice.ts`.
2. Export action and selector.
3. Dispatch from hooks/components.
