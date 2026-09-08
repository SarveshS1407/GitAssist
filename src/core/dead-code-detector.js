import path from 'node:path';

/**
 * Symbol & Module Dead Code Detector
 * Distinguishes true dead code candidates from entry points, exports, tests, and configurations.
 * Detects unused internal helper functions, orphan modules, and uncalled internal classes.
 */
export class DeadCodeDetector {
  /**
   * @param {Object} options
   * @param {import('./context-graph.js').ContextGraph} options.contextGraph
   * @param {import('./call-graph.js').CallGraphEngine} [options.callGraph]
   * @param {Array} [options.parsedFiles]
   * @param {Array} [options.files]
   */
  constructor({ contextGraph, callGraph = null, parsedFiles = [], files = [] }) {
    this.graph = contextGraph;
    this.callGraph = callGraph;
    this.parsedFiles = parsedFiles || [];
    this.files = files || [];
  }

  /**
   * Detect dead and isolated code across both module and symbol levels
   */
  detect() {
    const orphanModules = [];
    const unusedSymbols = [];

    // Common entry points, configs, and test patterns to never falsely flag
    const isSpecialFile = (relPath) => {
      const p = relPath.toLowerCase();
      const base = path.basename(p);
      return (
        base.startsWith('index.') ||
        base.startsWith('main.') ||
        base.startsWith('app.') ||
        base.startsWith('server.') ||
        base.includes('config') ||
        p.includes('tests/') ||
        p.includes('test/') ||
        /\.(test|spec)\.[a-zA-Z0-9]+$/.test(p) ||
        p.endsWith('.html') ||
        p.endsWith('.css') ||
        p.endsWith('.json') ||
        p.endsWith('.md')
      );
    };

    // 1. Module-level orphan analysis
    for (const file of this.files) {
      const rel = file.relativePath;
      if (isSpecialFile(rel)) continue;

      let inboundImports = 0;
      let outboundImports = 0;

      if (this.graph && this.graph.hasNode(rel)) {
        inboundImports = this.graph.getInboundEdges(rel).length;
        outboundImports = this.graph.getOutboundEdges(rel).length;
      }

      if (inboundImports === 0) {
        orphanModules.push({
          file: rel,
          language: file.language,
          lineCount: file.lineCount || 50,
          outboundImports,
          confidence: outboundImports === 0 ? 'HIGH' : 'MEDIUM',
          reason: outboundImports === 0 
            ? 'Completely detached: Zero inbound importers and zero outbound dependencies'
            : `Unreferenced module: Imports ${outboundImports} subsystems but is never imported itself`
        });
      }
    }

    // 2. Symbol-level unused function / method analysis
    if (this.callGraph && this.parsedFiles) {
      for (const parsed of this.parsedFiles) {
        const rel = parsed.relativePath;
        if (isSpecialFile(rel)) continue;

        const functions = parsed.functions || [];
        for (const fn of functions) {
          // Skip if exported or constructor or lifecycle
          if (fn.isExported || fn.name === 'constructor' || fn.name === 'render') continue;

          const qualified = `${rel}#${fn.name}`;
          const callers = this.callGraph.getCallers(qualified);

          if (callers.length === 0) {
            unusedSymbols.push({
              name: fn.name,
              qualifiedName: qualified,
              file: rel,
              lineStart: fn.lineStart || 1,
              kind: fn.kind || 'function',
              confidence: 'MEDIUM',
              reason: 'Internal helper symbol with zero detected call references within the call graph'
            });
          }
        }
      }
    }

    const totalAuditedFiles = this.files.filter(f => !isSpecialFile(f.relativePath)).length;
    const deadCodeDensity = totalAuditedFiles > 0 
      ? Number(((orphanModules.length / totalAuditedFiles) * 100).toFixed(1))
      : 0;

    return {
      summary: {
        totalAuditedFiles,
        orphanModulesCount: orphanModules.length,
        unusedSymbolsCount: unusedSymbols.length,
        deadCodeDensity,
        status: orphanModules.length === 0 ? 'CLEAN' : orphanModules.length > 5 ? 'HIGH_DEBRIS' : 'MODERATE_DEBRIS'
      },
      orphanModules: orphanModules.sort((a, b) => b.lineCount - a.lineCount),
      unusedSymbols: unusedSymbols.slice(0, 30)
    };
  }
}
