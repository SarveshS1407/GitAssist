/**
 * Future AI Intelligence Layer Interfaces and Context Packager
 * This defines the standard abstraction boundary for LLM/Agent reasoning over repository metadata.
 */

export class AIContextPackager {
  /**
   * Prepares compact, high-signal context prompts for LLM models
   */
  static buildRepoOverviewPrompt(summary, contributors, topFiles) {
    const langList = Object.entries(summary.languages || {})
      .map(([lang, s]) => `${lang} (${s.percentage}%)`)
      .join(', ');

    const topContribList = (contributors || [])
      .slice(0, 5)
      .map(c => `${c.name} (${c.commitCount} commits)`)
      .join(', ');

    return `
Repository: ${summary.name}
Branch: ${summary.branch}
Total Files: ${summary.totalFiles}
Total LOC: ${summary.totalLines}
Languages: ${langList}
Top Contributors: ${topContribList}
Key Modules/Files:
${topFiles.slice(0, 10).map(f => `- ${f.relativePath} (${f.language}, ${f.lineCount} lines)`).join('\n')}
    `.trim();
  }

  static buildFileContextPrompt(fileAnalysis) {
    const symbols = (fileAnalysis.symbols || [])
      .map(s => `  - [${s.kind}] ${s.signature || s.name} (line ${s.lineStart})`)
      .join('\n');

    const imports = (fileAnalysis.imports || [])
      .map(i => `  - from "${i.source}": [${i.specifiers.join(', ')}]`)
      .join('\n');

    return `
File: ${fileAnalysis.relativePath}
Language: ${fileAnalysis.language}
Lines: ${fileAnalysis.lineCount}
Imports:
${imports || '  None'}
Symbols Defined:
${symbols || '  None'}
    `.trim();
  }
}

/**
 * Pluggable AI Service Interface
 */
export class BaseAIService {
  async explainArchitecture(repoSummary, dependencyGraph) {
    throw new Error('Method not implemented: explainArchitecture');
  }

  async explainFile(fileAnalysis) {
    throw new Error('Method not implemented: explainFile');
  }

  async assessChangeRisk(changedFiles, dependencyGraph, gitHistory) {
    throw new Error('Method not implemented: assessChangeRisk');
  }

  async askQuestion(question, repoContext) {
    throw new Error('Method not implemented: askQuestion');
  }
}
