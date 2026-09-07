/**
 * Call Graph Engine
 * High-precision caller/callee traversal, depth-controlled path resolution,
 * and call-tree visualization generation.
 */
export class CallGraphEngine {
  /**
   * @param {import('./context-graph.js').ContextGraph} contextGraph
   */
  constructor(contextGraph) {
    this.graph = contextGraph;
  }

  /**
   * Resolves a symbol query to an exact symbol node ID
   * Supports symbolId ('sym:...'), qualifiedName ('PaymentService.process'), or raw name ('process')
   */
  resolveSymbol(symbolRef) {
    if (!symbolRef) return null;

    // Direct ID match
    if (this.graph.nodes.has(symbolRef)) {
      return this.graph.nodes.get(symbolRef);
    }

    // Qualified name match
    for (const [id, node] of this.graph.nodes.entries()) {
      if (node.type === 'symbol') {
        if (node.qualifiedName === symbolRef || node.id === symbolRef) {
          return node;
        }
      }
    }

    // Name match fallback
    const byName = this.graph.symbolByName.get(symbolRef);
    if (byName && byName.size > 0) {
      const firstId = Array.from(byName)[0];
      return this.graph.nodes.get(firstId);
    }

    return null;
  }

  /**
   * Get all callers (reverse traversal: who calls this symbol?)
   * @param {string} symbolRef Symbol ID or name
   * @param {number} [maxDepth=2] Traversal depth
   */
  getCallers(symbolRef, maxDepth = 2) {
    const root = this.resolveSymbol(symbolRef);
    if (!root) return { symbol: null, callers: [], totalCallers: 0 };

    const callers = [];
    const visited = new Set([root.id]);
    const queue = [{ id: root.id, depth: 1 }];

    while (queue.length > 0) {
      const { id, depth } = queue.shift();
      if (depth > maxDepth) continue;

      const incomingEdges = this.graph.getIncomingEdges(id, 'CALLS');

      for (const edge of incomingEdges) {
        if (!visited.has(edge.source)) {
          visited.add(edge.source);
          const callerNode = this.graph.getNode(edge.source);
          if (callerNode) {
            callers.push({
              symbol: callerNode,
              depth,
              callCount: edge.callCount || 1,
              line: edge.metadata?.line,
              targetId: id
            });
            queue.push({ id: edge.source, depth: depth + 1 });
          }
        }
      }
    }

    return {
      symbol: root,
      callers,
      totalCallers: callers.length,
      directCallers: callers.filter(c => c.depth === 1).length
    };
  }

  /**
   * Get all callees (forward traversal: what does this symbol invoke?)
   * @param {string} symbolRef Symbol ID or name
   * @param {number} [maxDepth=2] Traversal depth
   */
  getCallees(symbolRef, maxDepth = 2) {
    const root = this.resolveSymbol(symbolRef);
    if (!root) return { symbol: null, callees: [], totalCallees: 0 };

    const callees = [];
    const visited = new Set([root.id]);
    const queue = [{ id: root.id, depth: 1 }];

    while (queue.length > 0) {
      const { id, depth } = queue.shift();
      if (depth > maxDepth) continue;

      const outgoingEdges = this.graph.getOutgoingEdges(id, 'CALLS');

      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          visited.add(edge.target);
          const calleeNode = this.graph.getNode(edge.target);
          if (calleeNode) {
            callees.push({
              symbol: calleeNode,
              depth,
              callCount: edge.callCount || 1,
              line: edge.metadata?.line,
              sourceId: id
            });
            queue.push({ id: edge.target, depth: depth + 1 });
          }
        }
      }
    }

    return {
      symbol: root,
      callees,
      totalCallees: callees.length,
      directCallees: callees.filter(c => c.depth === 1).length
    };
  }

  /**
   * Traces shortest execution path between two symbols using BFS
   * @param {string} sourceRef
   * @param {string} targetRef
   * @param {number} [maxDepth=5]
   */
  getCallPath(sourceRef, targetRef, maxDepth = 5) {
    const source = this.resolveSymbol(sourceRef);
    const target = this.resolveSymbol(targetRef);

    if (!source || !target) return { found: false, path: [] };
    if (source.id === target.id) return { found: true, path: [source] };

    const queue = [[source.id]];
    const visited = new Set([source.id]);

    while (queue.length > 0) {
      const currentPath = queue.shift();
      const currentId = currentPath[currentPath.length - 1];

      if (currentPath.length > maxDepth + 1) continue;

      if (currentId === target.id) {
        return {
          found: true,
          path: currentPath.map(id => this.graph.getNode(id)).filter(Boolean)
        };
      }

      const edges = this.graph.getOutgoingEdges(currentId, 'CALLS');
      for (const edge of edges) {
        if (!visited.has(edge.target)) {
          visited.add(edge.target);
          queue.push([...currentPath, edge.target]);
        }
      }
    }

    return { found: false, path: [] };
  }

  /**
   * Export bidirectional sub-graph around a symbol for interactive rendering
   * @param {string} symbolRef
   * @param {Object} [options]
   * @param {number} [options.depth=2]
   * @param {'both'|'callers'|'callees'} [options.direction='both']
   */
  exportCallTree(symbolRef, options = {}) {
    const depth = options.depth || 2;
    const direction = options.direction || 'both';
    const root = this.resolveSymbol(symbolRef);

    if (!root) {
      return { root: null, nodes: [], edges: [], stats: { callerCount: 0, calleeCount: 0 } };
    }

    const collectedNodes = new Map([[root.id, { ...root, isRoot: true }]]);
    const collectedEdges = [];
    const edgeSet = new Set();

    if (direction === 'both' || direction === 'callers') {
      const callersResult = this.getCallers(root.id, depth);
      for (const c of callersResult.callers) {
        if (!collectedNodes.has(c.symbol.id)) {
          collectedNodes.set(c.symbol.id, { ...c.symbol, depth: c.depth, direction: 'caller' });
        }
        const edgeKey = `${c.symbol.id}->${c.targetId}`;
        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey);
          collectedEdges.push({
            source: c.symbol.id,
            target: c.targetId,
            type: 'CALLS',
            callCount: c.callCount
          });
        }
      }
    }

    if (direction === 'both' || direction === 'callees') {
      const calleesResult = this.getCallees(root.id, depth);
      for (const c of calleesResult.callees) {
        if (!collectedNodes.has(c.symbol.id)) {
          collectedNodes.set(c.symbol.id, { ...c.symbol, depth: c.depth, direction: 'callee' });
        }
        const edgeKey = `${c.sourceId}->${c.symbol.id}`;
        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey);
          collectedEdges.push({
            source: c.sourceId,
            target: c.symbol.id,
            type: 'CALLS',
            callCount: c.callCount
          });
        }
      }
    }

    const callerCount = Array.from(collectedNodes.values()).filter(n => n.direction === 'caller').length;
    const calleeCount = Array.from(collectedNodes.values()).filter(n => n.direction === 'callee').length;

    return {
      root,
      nodes: Array.from(collectedNodes.values()),
      edges: collectedEdges,
      stats: {
        callerCount,
        calleeCount,
        totalNodes: collectedNodes.size,
        totalEdges: collectedEdges.length,
        depth
      }
    };
  }

  /**
   * Calculate top central symbols across the entire repository
   */
  getCallMetrics(limit = 10) {
    const fanIn = new Map();  // incoming calls count
    const fanOut = new Map(); // outgoing calls count

    for (const edge of this.graph.edges) {
      if (edge.type === 'CALLS') {
        fanIn.set(edge.target, (fanIn.get(edge.target) || 0) + (edge.callCount || 1));
        fanOut.set(edge.source, (fanOut.get(edge.source) || 0) + (edge.callCount || 1));
      }
    }

    const topCalled = Array.from(fanIn.entries())
      .map(([id, count]) => ({ symbol: this.graph.getNode(id), count }))
      .filter(item => item.symbol !== null)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    const topCallers = Array.from(fanOut.entries())
      .map(([id, count]) => ({ symbol: this.graph.getNode(id), count }))
      .filter(item => item.symbol !== null)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return { topCalled, topCallers };
  }
}
