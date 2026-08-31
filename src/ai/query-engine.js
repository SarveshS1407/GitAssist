/**
 * Local Heuristic & AI Query Engine
 * Provides immediate codebase insights even without external API credentials
 */

export class LocalQueryEngine {
  constructor(activeRepoState) {
    this.state = activeRepoState;
  }

  /**
   * Evaluates common developer questions using in-memory metadata
   */
  evaluateQuery(query) {
    const q = (query || '').toLowerCase();
    const { summary, files, contributors, dependencyGraph } = this.state;

    if (!summary) {
      return { answer: 'No repository is currently scanned.', confidence: 0 };
    }

    if (q.includes('contributor') || q.includes('who wrote') || q.includes('author')) {
      const top = (contributors || []).slice(0, 5);
      if (!top.length) return { answer: 'No Git contributor history found.', confidence: 0.5 };
      const lines = top.map((c, i) => `${i + 1}. **${c.name}** (${c.email}): ${c.commitCount} commits`);
      return {
        type: 'contributors',
        answer: `Top contributors for **${summary.name}**:\n\n${lines.join('\n')}`,
        confidence: 0.95
      };
    }

    if (q.includes('largest') || q.includes('biggest') || q.includes('most lines')) {
      const largest = [...files].sort((a, b) => b.lineCount - a.lineCount).slice(0, 5);
      const lines = largest.map((f, i) => `${i + 1}. \`${f.relativePath}\` (${f.lineCount.toLocaleString()} lines, ${f.language})`);
      return {
        type: 'largest_files',
        answer: `Largest files in **${summary.name}**:\n\n${lines.join('\n')}`,
        confidence: 0.95
      };
    }

    if (q.includes('language') || q.includes('tech stack') || q.includes('stack')) {
      const langs = Object.entries(summary.languages || {})
        .sort((a, b) => b[1].lines - a[1].lines)
        .map(([k, v]) => `- **${k}**: ${v.percentage}% (${v.lines.toLocaleString()} lines across ${v.files} files)`);
      return {
        type: 'languages',
        answer: `Language breakdown for **${summary.name}**:\n\n${langs.join('\n')}`,
        confidence: 0.95
      };
    }

    if (q.includes('dependency') || q.includes('coupling') || q.includes('modules')) {
      const modules = dependencyGraph.modules || [];
      return {
        type: 'modules',
        answer: `Identified **${modules.length} modules** and **${dependencyGraph.edges?.length || 0} dependency connections**.\n\nModules: ${modules.map(m => `\`${m.name}\``).join(', ')}`,
        confidence: 0.9
      };
    }

    return {
      type: 'general',
      answer: `Repository **${summary.name}** contains **${summary.totalFiles} files** (${summary.totalLines.toLocaleString()} total lines) across **${Object.keys(summary.languages || {}).length} languages**. Branch: \`${summary.branch}\`.`,
      confidence: 0.7
    };
  }
}
