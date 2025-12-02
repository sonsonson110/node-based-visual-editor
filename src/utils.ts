import type { Node } from "./types";

export function getNodeCenter(node: Node) {
  return {
    cx: node.x + 40, // 80 / 2
    cy: node.y + 20, // 40 / 2
  };
}