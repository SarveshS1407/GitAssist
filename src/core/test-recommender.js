import path from 'node:path';

/**
 * Automatic Test Recommendation Engine
 * Ranks test suites into HIGH, MEDIUM, and LOW priority based on
 * call relationships, import dependencies, test naming patterns, and co-change history.
 */
export class TestRecommender {
  /**
   * @param {Object} options
   * @param {import('./context-graph.js').ContextGraph} options.contextGraph
   * @param {import('./call-graph.js').CallGraphEngine} [options.callGraph]
   * @param {Array} [options.commits]
   */
  constructor({ contextGraph, callGraph = null, commits = [] }) {
    this.graph = contextGraph;
    this.callGraph = callGraph;
    this.commits = commits || [];
  }

  /**
   * Recommend and prioritize tests for a changed file or symbol
   * @param {string} targetRef File path or symbol ID
   * @returns {Object} Categorized and ranked test recommendations
   */
  recommend(targetRef) {
    if (!targetRef) return { high: [], medium: [], low: [], all: [] };

    const isFile = targetRef.includes('/') || targetRef.includes('\\') || /\.[a-zA-Z0-9]+$/.test(targetRef);
    const isSymbol = targetRef.startsWith('sym:') || (!isFile && (targetRef.includes('.') || targetRef.includes('(')));
    const fileTarget = isSymbol && this.callGraph
      ? (this.callGraph.resolveSymbol(targetRef)?.file || targetRef)
      : targetRef;

    const baseName = path.basename(fileTarget, path.extname(fileTarget)).toLowerCase();
    const scoredTests = new Map(); // testPath -> { testFile, priority, score, reason }

    // 1. Identify all test files in the ContextGraph
    const allTestNodes = [];
    for (const [id, node] of this.graph.nodes.entries()) {
      if (node.type === 'file' && (node.path.includes('test') || node.path.includes('spec'))) {
        allTestNodes.push(node);
      }
    }

    // 2. Co-change history analysis (files committed alongside this target file)
    const coChangedTests = new Map();
    for (const commit of this.commits) {
      const files = (commit.files || []).map(f => (typeof f === 'string' ? f : f.file || ''));
      if (files.some(f => f.includes(fileTarget))) {
        for (const f of files) {
          if (f.includes('test') || f.includes('spec')) {
            coChangedTests.set(f, (coChangedTests.get(f) || 0) + 1);
          }
        }
      }
    }

    // 3. Direct callers from CallGraph if target is a symbol
    const callers = new Set();
    if (isSymbol && this.callGraph) {
      const callerResult = this.callGraph.getCallers(targetRef, 3);
      for (const c of callerResult.callers) {
        callers.add(c.symbol.file);
      }
    }

    // 4. Evaluate each test file
    for (const testNode of allTestNodes) {
      const testPath = testNode.path;
      const testBase = path.basename(testPath, path.extname(testPath)).toLowerCase();
      let bestScore = 0;
      let primaryReason = '';

      // Rule A: Direct naming pattern match (e.g. payment.test.js for payment.js)
      if (testBase.includes(baseName) || baseName.includes(testBase.replace(/\.(test|spec)$/, ''))) {
        bestScore = Math.max(bestScore, 95);
        primaryReason = `Direct name correspondence (*${baseName}*)`;
      }

      // Rule B: Test directly imports target file
      const testImports = this.graph.getOutgoingEdges(testNode.id, 'IMPORTS');
      const directlyImports = testImports.some(e => e.target === `file:${fileTarget}`);
      if (directlyImports) {
        bestScore = Math.max(bestScore, 100);
        primaryReason = `Test directly imports \`${fileTarget}\``;
      }

      // Rule C: Test executes a caller from CallGraph
      if (callers.has(testPath)) {
        bestScore = Math.max(bestScore, 90);
        primaryReason = `Test file directly invokes target symbol \`${targetRef}\``;
      }

      // Rule D: Test imports an intermediate dependent (transitive 2-hop)
      if (bestScore < 70) {
        for (const imp of testImports) {
          const importedFile = imp.target.replace(/^file:/, '');
          const intermediateImports = this.graph.getOutgoingEdges(`file:${importedFile}`, 'IMPORTS');
          if (intermediateImports.some(e => e.target === `file:${fileTarget}`)) {
            bestScore = Math.max(bestScore, 65);
            primaryReason = `Imports intermediate subsystem \`${importedFile}\``;
            break;
          }
        }
      }

      // Rule E: Historical co-change pattern
      if (coChangedTests.has(testPath) && bestScore < 60) {
        const coCount = coChangedTests.get(testPath);
        bestScore = Math.max(bestScore, 60);
        primaryReason = `Co-committed in ${coCount} historical commit${coCount > 1 ? 's' : ''}`;
      }

      // Rule F: Same directory / subsystem module
      if (bestScore === 0) {
        const targetDir = path.dirname(fileTarget);
        const testDir = path.dirname(testPath);
        if (targetDir === testDir || testPath.includes(path.basename(targetDir))) {
          bestScore = 30;
          primaryReason = 'Same module directory domain';
        }
      }

      if (bestScore > 0) {
        let priority = 'LOW';
        if (bestScore >= 80) priority = 'HIGH';
        else if (bestScore >= 50) priority = 'MEDIUM';

        scoredTests.set(testPath, {
          testFile: testPath,
          priority,
          score: bestScore,
          reason: primaryReason
        });
      }
    }

    const all = Array.from(scoredTests.values()).sort((a, b) => b.score - a.score);
    const high = all.filter(t => t.priority === 'HIGH');
    const medium = all.filter(t => t.priority === 'MEDIUM');
    const low = all.filter(t => t.priority === 'LOW');

    return {
      target: targetRef,
      targetFile: fileTarget,
      totalRecommended: all.length,
      high,
      medium,
      low,
      all
    };
  }
}
