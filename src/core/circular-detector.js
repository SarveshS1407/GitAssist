/**
 * Circular Dependency Detector
 * Traverses module and file dependency graphs to detect cyclic import loops
 */
export class CircularDependencyDetector {
  /**
   * Detects cycles in the given dependency edges
   * @param {Array} edges List of { source, target } or { from, to } edges
   * @returns {Array} List of detected cycles
   */
  static detectCycles(edges) {
    const adj = new Map();

    for (const edge of (edges || [])) {
      const src = edge.source || edge.from;
      const tgt = edge.target || edge.to;
      if (!src || !tgt) continue;

      if (!adj.has(src)) adj.set(src, []);
      adj.get(src).push(tgt);
    }

    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];

    function dfs(node, path) {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, [...path]);
        } else if (recursionStack.has(neighbor)) {
          const cycleStartIdx = path.indexOf(neighbor);
          if (cycleStartIdx !== -1) {
            const cyclePath = path.slice(cycleStartIdx).concat(neighbor);
            cycles.push(cyclePath);
          }
        }
      }

      recursionStack.delete(node);
    }

    for (const node of adj.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }

    return cycles;
  }
}
