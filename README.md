## Node-Based Visual Editor

# Journal

## Phase 1: Basic Node Drag & Drop

- Built with React, TypeScript, and Vite.
- Displays nodes on a canvas.
- Nodes are draggable using mouse events (no external libraries).
- Node positions update in real time as you drag.
- Code is simple and easy to extend for future phases.

### Phase 1 Improvements

- Node rendering logic extracted to `NodeComponent` for better modularity.
- Drag-and-drop logic handled via props and mouse events in `NodeComponent`.
- Types for nodes are now defined in `types.ts` and used consistently.
- Visual feedback added: node border changes color when dragging.

## Phase 2: Edge Rendering & Types

- Added `Edge` type to `types.ts` for clear edge structure.
- Implemented edge rendering in `App.tsx` using SVG paths between node centers.
- Created `getNodeCenter` utility for accurate edge connections.
- Edges now visually connect nodes on the canvas.

### Phase 2 Improvements

- Edge rendering logic extracted to `EdgeComponent` for better modularity.
- Edges now connect to the sides of nodes (right side of the source to the left side of the target) for a clearer, more directional flow.
- Added `getNodeCenterLeft` and `getNodeCenterRight` utility functions to calculate the new connection points.
- nodeMap memoization — removes O(N) lookups per edge
- Edge path math: straight segments + cubic curve (aesthetic + readable).
- Marker arrowhead implementation
- Use an requestAnimationFrame throttle to cap updates to the display refresh rate
