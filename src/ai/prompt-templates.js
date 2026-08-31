/**
 * Structured prompt templates for AI reasoning over codebase topology and Git archaeology
 */

export const PromptTemplates = {
  SYSTEM_ARCHITECT: `You are an expert Principal Software Architect and Code Archaeologist.
Your role is to analyze codebase structures, dependency graphs, and historical Git churn to provide crisp, actionable, and accurate insights.`,

  buildArchitecturePrompt(summary, dependencyGraph, topModules) {
    const modulesSummary = (topModules || [])
      .map(m => `- Module: ${m.name} (${m.fileCount} files, ${m.totalLines} lines, imported by ${m.inDegree || 0} modules)`)
      .join('\n');

    return `
Analyze the following software architecture and provide:
1. Architectural Pattern (e.g. Layered, Monolith, Modular Monolith, Microservices, Event-Driven)
2. Core Modules & Responsibilities
3. High-Coupling / High-Risk Areas
4. Recommended Refactoring or Improvement Points

---
Repository Name: ${summary.name}
Total Files: ${summary.totalFiles}
Total Lines of Code: ${summary.totalLines}
Dominant Languages: ${Object.entries(summary.languages || {}).map(([l, d]) => `${l} (${d.percentage}%)`).join(', ')}

Top Modules:
${modulesSummary || 'None identified'}

Total Inter-Module Dependency Edges: ${dependencyGraph.edges?.length || 0}
`.trim();
  },

  buildBlastRadiusPrompt(targetFile, dependentFiles, recentCommits) {
    const depsList = (dependentFiles || []).map(f => `- ${f}`).join('\n');
    const commitList = (recentCommits || []).slice(0, 5).map(c => `- ${c.hash.substring(0, 7)}: ${c.subject} (${c.author})`).join('\n');

    return `
Assess the Blast Radius and Risk Level for modifying:
Target File: ${targetFile}

Direct & Transitive Dependents (${dependentFiles.length}):
${depsList || 'No direct dependents identified in workspace.'}

Recent Commits modifying this or related files:
${commitList || 'No recent commits.'}

Provide:
1. Risk Assessment (Low / Medium / High / Critical)
2. Likely Affected Systems & Interfaces
3. Recommended Testing Strategy
`.trim();
  },

  buildOnboardingGuidePrompt(summary, contributors, keyFiles) {
    const topFiles = (keyFiles || []).slice(0, 10).map(f => `- \`${f.relativePath}\` (${f.language}, ${f.lineCount} lines)`).join('\n');
    const topAuthors = (contributors || []).slice(0, 5).map(c => `- ${c.name} (${c.commitCount} commits)`).join('\n');

    return `
Generate a quick 10-minute developer onboarding guide for this repository:

Repository: ${summary.name}
Primary Languages: ${Object.keys(summary.languages || {}).join(', ')}

Key Entry Points / Significant Files:
${topFiles}

Key Domain Experts (Top Git Contributors):
${topAuthors}

Include:
1. High-level mental model of the codebase
2. Where to start reading first
3. Key files and their responsibilities
4. Common development workflow tips
`.trim();
  }
};
