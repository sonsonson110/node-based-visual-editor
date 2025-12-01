## Node-Based Visual Editor

# Journal

## Phase 1: Basic Node Drag & Drop

- Built with React, TypeScript, and Vite.
- Displays nodes on a canvas.
- Nodes are draggable using mouse events (no external libraries).
- Node positions update in real time as you drag.
- Code is simple and easy to extend for future phases.


---

### Phase 1 Improvements

- Node rendering logic extracted to `NodeComponent` for better modularity.
- Drag-and-drop logic handled via props and mouse events in `NodeComponent`.
- Types for nodes are now defined in `types.ts` and used consistently.
- Visual feedback added: node border changes color when dragging.
