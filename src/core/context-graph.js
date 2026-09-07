import path from 'node:path';

/**
 * Unified Context Graph
 * Represents codebase entities (files, symbols, classes, functions, methods, endpoints)
 * and their multi-dimensional relationships (contains, imports, calls, exposes).
 */
export class ContextGraph {
  constructor() {
    this.nodes = new Map(); // id -> node
    this.edges = [];        // array of edge objects
    this.fileToSymbols = new Map(); // filePath -> Set of symbolIds
    this.symbolByName = new Map();   // name -> Set of symbolIds
    this.symbolByQualifiedName = new Map(); // qualifiedName -> symbolId
    this.fileImports = new Map();   // filePath -> Array of { source, resolvedPath, specifiers }
  }

  /**
   * Builds context graph from parsed files and dependency graph
   * @param {Array} parsedFiles Array of parsed file objects with symbols, imports, and calls
   * @param {Object} [depGraph] File-level dependency graph
   * @param {Array} [endpoints] Extracted API endpoints
   * @returns {ContextGraph}
   */
  static build(parsedFiles = [], depGraph = null, endpoints = []) {
    const graph = new ContextGraph();

    // 1. Index all files
    for (const f of parsedFiles) {
      const fileId = `file:${f.relativePath}`;
      const moduleName = f.relativePath.includes('/') || f.relativePath.includes('\\')
        ? f.relativePath.split(/[/\\]/)[0]
        : 'root';

      const fileNode = {
        id: fileId,
        type: 'file',
        path: f.relativePath,
        name: f.name,
        language: f.language,
        module: moduleName,
        lineCount: f.lineCount || 0,
        symbolCount: (f.symbols || []).length
      };

      graph.addNode(fileNode);
      graph.fileToSymbols.set(f.relativePath, new Set());
    }

    // 2. Index file-level import resolutions
    const fileMap = new Map();
    for (const f of parsedFiles) fileMap.set(f.relativePath, f);

    for (const f of parsedFiles) {
      const currentDir = path.dirname(f.relativePath);
      const resolvedImports = [];

      for (const imp of (f.imports || [])) {
        let resolvedPath = null;
        if (imp.source.startsWith('.')) {
          const norm = path.normalize(path.join(currentDir, imp.source));
          if (fileMap.has(norm)) {
            resolvedPath = norm;
          } else {
            const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '/index.ts', '/index.js'];
            for (const ext of possibleExtensions) {
              if (fileMap.has(norm + ext)) {
                resolvedPath = norm + ext;
                break;
              }
            }
          }
        }

        resolvedImports.push({
          source: imp.source,
          resolvedPath,
          specifiers: imp.specifiers || [],
          isDefault: !!imp.isDefault,
          line: imp.line
        });

        // Add file IMPORTS edge
        if (resolvedPath && resolvedPath !== f.relativePath) {
          graph.addEdge({
            id: `edge:import:${f.relativePath}->${resolvedPath}`,
            type: 'IMPORTS',
            source: `file:${f.relativePath}`,
            target: `file:${resolvedPath}`,
            metadata: { specifiers: imp.specifiers }
          });
        }
      }

      graph.fileImports.set(f.relativePath, resolvedImports);
    }

    // 3. Index all symbols and CONTAINS edges
    for (const f of parsedFiles) {
      const fileId = `file:${f.relativePath}`;

      for (const s of (f.symbols || [])) {
        const qualifiedName = s.parentClass ? `${s.parentClass}.${s.name}` : s.name;
        const symbolId = `sym:${f.relativePath}:${qualifiedName}`;

        const symbolNode = {
          id: symbolId,
          type: 'symbol',
          name: s.name,
          qualifiedName,
          kind: s.kind || 'function',
          file: f.relativePath,
          parentClass: s.parentClass || null,
          lineStart: s.lineStart || 1,
          lineEnd: s.lineEnd || s.lineStart || 1,
          exported: !!s.exported,
          signature: s.signature || `${s.name}()`,
          calls: s.calls || []
        };

        graph.addNode(symbolNode);
        graph.fileToSymbols.get(f.relativePath).add(symbolId);

        // Index by name for fast lookup
        if (!graph.symbolByName.has(s.name)) {
          graph.symbolByName.set(s.name, new Set());
        }
        graph.symbolByName.get(s.name).add(symbolId);
        graph.symbolByQualifiedName.set(`${f.relativePath}:${qualifiedName}`, symbolId);

        // Edge: File CONTAINS Symbol
        graph.addEdge({
          id: `edge:contains:${f.relativePath}->${symbolId}`,
          type: 'CONTAINS',
          source: fileId,
          target: symbolId
        });
      }
    }

    // 4. Resolve CALLS edges (Symbol -> Symbol and File -> Symbol)
    for (const f of parsedFiles) {
      const fileImports = graph.fileImports.get(f.relativePath) || [];
      const fileSymbols = graph.fileToSymbols.get(f.relativePath) || new Set();

      // Intra-file and cross-file resolver function
      const resolveTargetSymbol = (calleeName, receiver, callerSym) => {
        // A. If receiver is 'this' and caller has parentClass:
        if (receiver === 'this' && callerSym?.parentClass) {
          const classQualified = `${callerSym.parentClass}.${calleeName}`;
          const targetId = graph.symbolByQualifiedName.get(`${f.relativePath}:${classQualified}`);
          if (targetId) return targetId;
        }

        // B. Check if target is a class method where receiver matches a class in this file or imported
        if (receiver) {
          const recQualified = `${receiver}.${calleeName}`;
          // In same file
          const sameFileId = graph.symbolByQualifiedName.get(`${f.relativePath}:${recQualified}`);
          if (sameFileId) return sameFileId;

          // Check if receiver is an imported class/module
          for (const imp of fileImports) {
            if (imp.resolvedPath && imp.specifiers.includes(receiver)) {
              const crossId = graph.symbolByQualifiedName.get(`${imp.resolvedPath}:${recQualified}`);
              if (crossId) return crossId;
            }
          }
        }

        // C. Check if callee is an imported function/class/symbol
        for (const imp of fileImports) {
          if (imp.resolvedPath && imp.specifiers.includes(calleeName)) {
            const crossFileSymbols = graph.fileToSymbols.get(imp.resolvedPath);
            if (crossFileSymbols) {
              for (const sId of crossFileSymbols) {
                const node = graph.nodes.get(sId);
                if (node && node.name === calleeName) {
                  return sId;
                }
              }
            }
          }
        }

        // D. Check if callee is in the same file
        for (const sId of fileSymbols) {
          const node = graph.nodes.get(sId);
          if (node && node.name === calleeName && node.id !== callerSym?.id) {
            return sId;
          }
        }

        // E. Fallback: search global symbols with exact matching name if unique
        const matches = graph.symbolByName.get(calleeName);
        if (matches && matches.size === 1) {
          return Array.from(matches)[0];
        }

        return null;
      };

      // Process calls inside each symbol
      for (const sId of fileSymbols) {
        const callerNode = graph.nodes.get(sId);
        if (!callerNode || !callerNode.calls) continue;

        for (const call of callerNode.calls) {
          const targetSymbolId = resolveTargetSymbol(call.name, call.receiver, callerNode);
          if (targetSymbolId && targetSymbolId !== callerNode.id) {
            const edgeId = `edge:calls:${callerNode.id}->${targetSymbolId}`;
            const existingEdge = graph.edges.find(e => e.id === edgeId);
            if (existingEdge) {
              existingEdge.callCount = (existingEdge.callCount || 1) + 1;
            } else {
              graph.addEdge({
                id: edgeId,
                type: 'CALLS',
                source: callerNode.id,
                target: targetSymbolId,
                callCount: 1,
                metadata: {
                  callee: call.name,
                  receiver: call.receiver,
                  line: call.line
                }
              });
            }
          }
        }
      }
    }

    // 5. Index API Endpoints and EXPOSES edges
    const endpointList = Array.isArray(endpoints) ? endpoints : (endpoints?.endpoints || []);
    for (const ep of endpointList) {
      const epId = `endpoint:${ep.method}:${ep.path}`;
      const epNode = {
        id: epId,
        type: 'endpoint',
        method: ep.method,
        path: ep.path,
        file: ep.file,
        line: ep.line,
        framework: ep.framework || 'REST'
      };

      graph.addNode(epNode);

      if (ep.file) {
        graph.addEdge({
          id: `edge:exposes:${ep.file}->${epId}`,
          type: 'EXPOSES',
          source: `file:${ep.file}`,
          target: epId
        });
      }
    }

    return graph;
  }

  addNode(node) {
    if (!this.nodes.has(node.id)) {
      this.nodes.set(node.id, node);
    }
  }

  addEdge(edge) {
    this.edges.push(edge);
  }

  getNode(id) {
    return this.nodes.get(id) || null;
  }

  getOutgoingEdges(nodeId, edgeType = null) {
    return this.edges.filter(e => e.source === nodeId && (!edgeType || e.type === edgeType));
  }

  getIncomingEdges(nodeId, edgeType = null) {
    return this.edges.filter(e => e.target === nodeId && (!edgeType || e.type === edgeType));
  }

  getSymbolsForFile(filePath) {
    const symbolIds = this.fileToSymbols.get(filePath) || new Set();
    return Array.from(symbolIds).map(id => this.nodes.get(id)).filter(Boolean);
  }

  searchSymbols(query = '', filter = {}) {
    const q = (query || '').toLowerCase().trim();
    const results = [];

    for (const [id, node] of this.nodes.entries()) {
      if (node.type !== 'symbol') continue;
      if (filter.kind && node.kind !== filter.kind) continue;
      if (filter.file && node.file !== filter.file) continue;

      if (!q || node.name.toLowerCase().includes(q) || node.qualifiedName.toLowerCase().includes(q) || node.file.toLowerCase().includes(q)) {
        results.push(node);
      }
    }

    return results;
  }
}
