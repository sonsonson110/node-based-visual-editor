## Node-Based Visual Editor

Live Demo: [https://node-based-visual-editor.web.app/](https://node-based-visual-editor.web.app/)

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

## Phase 3: Viewport System (Panning & Zooming)

- Introduced the concept of a **camera/viewport** separate from world space.
- Implemented panning behavior by shifting the viewport’s x/y translation.
- Added zooming functionality using mouse wheel scroll, scaling the world container.
- Created `WorldContainer` to apply transforms to both nodes and edges together.
- Nodes and edges remain visually consistent and correctly positioned during zoom & pan.
- Disabled the browser native right-click menu to allow context-based interactions later.
- Middle/left-click now pans smoothly across the world while left-click continues to drag nodes.

## Phase 5: Selection System (Multi-Select & Selection Box)

- Added multi-selection capabilities to allow manipulating groups of nodes, addressing a major limitation of earlier phases.
- Implemented a selection box (marquee selection) to support selecting many nodes efficiently, especially in larger graphs.

## Phase 6: Group Movement (Multi-Node Drag)

Goal:

When multiple nodes are selected, dragging any one of them should move the entire group smoothly — exactly like n8n, Figma, Node-RED, Godot, and Unreal Blueprint.

This requires several architectural updates:

- A new concept called group drag origin
- Drag offsets stored per-node (or shared offset reference)
- Consistent world-space dragging under zoom/pan
- Hit-testing logic that doesn’t confuse “dragging group” vs. “drawing selection box”

## Phase 7: Grid & Snap-to-Grid

- Introduced a grid system to the canvas for better alignment and organization of nodes. 
- Grid lines are rendered in the background of the canvas, scales with zoom level, pans with world movement.
- Implemented snap-to-grid functionality, allowing nodes to snap to the nearest grid intersection when moved.
- Overrides for snap-to-grid behavior when holding modifier keys (Alt).
