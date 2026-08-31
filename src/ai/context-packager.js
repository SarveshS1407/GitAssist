import { PromptTemplates } from './prompt-templates.js';

/**
 * Packs repository structures and token-budgeted context for AI models
 */
export class AIContextPackager {
  constructor(options = {}) {
    this.maxTokens = options.maxTokens || 8000;
  }

  /**
   * Generates a complete architecture analysis context payload
   */
  packageArchitectureContext(state) {
    const { summary, dependencyGraph, files, contributors } = state;
    if (!summary) return null;

    const topFiles = [...files]
      .sort((a, b) => b.lineCount - a.lineCount)
      .slice(0, 15);

    const prompt = PromptTemplates.buildArchitecturePrompt(
      summary,
      dependencyGraph,
      dependencyGraph.modules || []
    );

    return {
      systemPrompt: PromptTemplates.SYSTEM_ARCHITECT,
      userPrompt: prompt,
      meta: {
        repoName: summary.name,
        totalFiles: summary.totalFiles,
        totalLines: summary.totalLines
      }
    };
  }

  /**
   * Generates blast-radius context for a specific file
   */
  packageFileBlastRadius(filePath, state) {
    const { files, dependencyGraph, commits } = state;
    const dependentFiles = [];

    for (const edge of (dependencyGraph.edges || [])) {
      if (edge.to === filePath) {
        dependentFiles.push(edge.from);
      }
    }

    const relevantCommits = (commits || []).filter(c => 
      c.files && c.files.some(f => f.includes(filePath))
    );

    const prompt = PromptTemplates.buildBlastRadiusPrompt(
      filePath,
      dependentFiles,
      relevantCommits
    );

    return {
      systemPrompt: PromptTemplates.SYSTEM_ARCHITECT,
      userPrompt: prompt,
      dependentFiles,
      directDependentCount: dependentFiles.length
    };
  }

  /**
   * Generates onboarding guide prompt
   */
  packageOnboardingContext(state) {
    const { summary, files, contributors } = state;
    if (!summary) return null;

    const keyFiles = [...files]
      .filter(f => f.lineCount > 10)
      .sort((a, b) => (b.symbols?.length || 0) - (a.symbols?.length || 0))
      .slice(0, 10);

    return {
      systemPrompt: PromptTemplates.SYSTEM_ARCHITECT,
      userPrompt: PromptTemplates.buildOnboardingGuidePrompt(summary, contributors, keyFiles)
    };
  }
}
