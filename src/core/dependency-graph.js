import path from 'node:path';

/**
 * Dependency Graph Analyzer
 * Resolves relative imports across the codebase to construct file and module graphs
 */
export class DependencyAnalyzer {
  static buildGraph(files) {
    const fileMap = new Map();
    const nodes = [];
    const edges = [];
    const modulesSet = new Set();

    // Index all relative paths and module groups
    for (const file of files) {
      fileMap.set(file.relativePath, file);
      const moduleName = file.relativePath.includes('/') || file.relativePath.includes('\\')
        ? file.relativePath.split(/[/\\]/)[0]
        : 'root';
      
      modulesSet.add(moduleName);

      nodes.push({
        id: file.relativePath,
        label: file.name,
        language: file.language,
        module: moduleName,
        lineCount: file.lineCount || 0,
        symbolCount: (file.symbols || []).length
      });
    }

    // Resolve imports to file paths
    for (const file of files) {
      if (!file.imports || file.imports.length === 0) continue;

      const currentDir = path.dirname(file.relativePath);

      for (const imp of file.imports) {
        let targetPath = null;

        // Relative import resolution (./foo or ../bar)
        if (imp.source.startsWith('.')) {
          const resolved = path.normalize(path.join(currentDir, imp.source));
          
          // Try exact match or match with common extensions
          if (fileMap.has(resolved)) {
            targetPath = resolved;
          } else {
            const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '/index.ts', '/index.js'];
            for (const ext of possibleExtensions) {
              const withExt = resolved + ext;
              if (fileMap.has(withExt)) {
                targetPath = withExt;
                break;
              }
            }
          }
        }

        if (targetPath && targetPath !== file.relativePath) {
          const existingEdge = edges.find(e => (e.source === file.relativePath && e.target === targetPath));
          if (existingEdge) {
            existingEdge.importCount += 1;
            existingEdge.imports.push(...imp.specifiers);
          } else {
            edges.push({
              from: file.relativePath,
              to: targetPath,
              source: file.relativePath,
              target: targetPath,
              importCount: 1,
              imports: [...imp.specifiers]
            });
          }
        }
      }
    }

    return {
      nodes,
      edges,
      modules: Array.from(modulesSet).map(name => {
        const moduleFiles = files.filter(f => f.relativePath.startsWith(name + '/') || (name === 'root' && !f.relativePath.includes('/')));
        return {
          name,
          fileCount: moduleFiles.length,
          totalLines: moduleFiles.reduce((acc, f) => acc + (f.lineCount || 0), 0)
        };
      })
    };
  }
}
