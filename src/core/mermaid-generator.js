/**
 * Mermaid Architecture & Dependency Diagram Generator
 * Automatically turns codebase dependency graphs and symbols into Mermaid.js diagrams
 */
export class MermaidGenerator {
  /**
   * Generates a Mermaid flowchart of module interactions
   * @param {Object} dependencyGraph { nodes, edges, modules }
   * @returns {string} Mermaid diagram definition string
   */
  static generateModuleFlowchart(dependencyGraph) {
    const { nodes, edges, modules } = dependencyGraph;
    const lines = ['flowchart TD'];

    // Group nodes by module subgraphs
    for (const mod of (modules || [])) {
      const modName = typeof mod === 'object' ? mod.name : mod;
      const cleanModId = modName.replace(/[^a-zA-Z0-9_]/g, '_');
      lines.push(`  subgraph ${cleanModId} ["📁 ${modName}"]`);

      const moduleNodes = (nodes || []).filter(n => n.module === modName);
      for (const node of moduleNodes) {
        const nodeId = node.id.replace(/[^a-zA-Z0-9_]/g, '_');
        lines.push(`    ${nodeId}["${node.label || node.id}"]`);
      }
      lines.push('  end');
    }

    // Add edges
    for (const edge of (edges || [])) {
      const srcId = (edge.source || edge.from).replace(/[^a-zA-Z0-9_]/g, '_');
      const tgtId = (edge.target || edge.to).replace(/[^a-zA-Z0-9_]/g, '_');
      lines.push(`  ${srcId} --> ${tgtId}`);
    }

    return lines.join('\n');
  }

  /**
   * Generates a Mermaid class diagram for AST symbols
   * @param {Array} files List of files with extracted symbols
   * @returns {string} Mermaid class diagram definition string
   */
  static generateClassDiagram(files) {
    const lines = ['classDiagram'];

    for (const file of (files || [])) {
      const classes = (file.symbols || []).filter(s => s.kind === 'class');
      for (const cls of classes) {
        const cleanName = cls.name.replace(/[^a-zA-Z0-9_]/g, '');
        lines.push(`  class ${cleanName} {`);
        lines.push(`    +${file.language} file`);
        lines.push('  }');
      }
    }

    return lines.length > 1 ? lines.join('\n') : 'classDiagram\n  class Empty';
  }
}
