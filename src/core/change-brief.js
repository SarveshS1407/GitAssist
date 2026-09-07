/**
 * "Before You Change This" Change Brief Generator
 * Produces an actionable, developer-centric pre-modification brief
 * detailing risk, callers, API exposure, centrality, churn, bugs, and tests.
 */
export class ChangeBriefGenerator {
  /**
   * @param {Object} options
   * @param {import('./impact-engine.js').AdvancedImpactEngine} options.impactEngine
   * @param {import('./call-graph.js').CallGraphEngine} [options.callGraph]
   * @param {import('./context-graph.js').ContextGraph} [options.contextGraph]
   */
  constructor({ impactEngine, callGraph = null, contextGraph = null }) {
    this.impactEngine = impactEngine;
    this.callGraph = callGraph;
    this.contextGraph = contextGraph;
  }

  /**
   * Generate a comprehensive Change Brief
   * @param {string} targetRef File path or symbol ID/name
   * @returns {Object} Structured change brief
   */
  generateBrief(targetRef) {
    if (!targetRef) return null;

    const impact = this.impactEngine.analyzeImpact(targetRef);
    if (!impact) return null;

    // Determine target metadata
    let targetName = targetRef;
    let targetKind = impact.isSymbol ? 'symbol' : 'file';
    let fileLocation = impact.targetFile;

    if (this.callGraph && impact.isSymbol) {
      const sym = this.callGraph.resolveSymbol(targetRef);
      if (sym) {
        targetName = sym.qualifiedName || sym.name;
        targetKind = sym.kind || 'function';
        fileLocation = `${sym.file}:${sym.lineStart || 1}`;
      }
    }

    // Determine centrality
    let centrality = 'LOW';
    const totalDeps = impact.stats.totalDependents;
    if (totalDeps >= 10) centrality = 'CRITICAL';
    else if (totalDeps >= 5) centrality = 'HIGH';
    else if (totalDeps >= 2) centrality = 'MEDIUM';

    // Determine churn rating
    let churnRating = 'LOW';
    const churn = impact.history.churnCount;
    if (churn >= 15) churnRating = 'CRITICAL';
    else if (churn >= 8) churnRating = 'HIGH';
    else if (churn >= 3) churnRating = 'MEDIUM';

    // Formulate recommended actions
    const actions = [];
    if (impact.directDependents.length > 0) {
      actions.push(`Review ${impact.directDependents.slice(0, 3).join(', ')} before modifying.`);
    }
    if (impact.affectedApis.length > 0) {
      actions.push(`Verify interface contract for ${impact.affectedApis.map(a => `${a.method} ${a.path}`).join(', ')}.`);
    }
    if (impact.affectedTests.length > 0) {
      const highTests = impact.affectedTests.filter(t => t.priority === 'HIGH');
      if (highTests.length > 0) {
        actions.push(`Execute high-priority regression tests: ${highTests.map(t => t.testFile).join(', ')}.`);
      }
    }
    if (actions.length === 0) {
      actions.push('Internal isolated component; safe to modify with localized testing.');
    }

    const brief = {
      target: targetName,
      kind: targetKind,
      file: fileLocation,
      risk: {
        level: impact.riskLevel,
        score: impact.riskScore
      },
      usedBy: impact.directDependents.slice(0, 8),
      apiExposure: impact.affectedApis.slice(0, 6).map(a => `${a.method} ${a.path}`),
      dependencyCentrality: centrality,
      recentChurn: churnRating,
      bugHistory: {
        count: impact.history.bugCount,
        commits: impact.history.recentBugs.map(c => ({
          message: c.message,
          author: c.author || 'Contributor'
        }))
      },
      testCoverage: {
        count: impact.affectedTests.length,
        recommended: impact.affectedTests.slice(0, 6)
      },
      potentialImpact: {
        dependentsCount: impact.stats.totalDependents,
        apiCount: impact.stats.affectedApiCount,
        testCount: impact.stats.affectedTestCount,
        featuresCount: impact.stats.affectedFeatureCount
      },
      recommendedAction: actions.join(' ')
    };

    brief.formatMarkdown = () => this.toMarkdown(brief);

    return brief;
  }

  toMarkdown(b) {
    const usedByList = b.usedBy.length > 0 ? b.usedBy.map(u => `• ${u}`).join('\n') : '• None (Leaf subsystem)';
    const apiList = b.apiExposure.length > 0 ? b.apiExposure.map(a => `• ${a}`).join('\n') : '• None (Internal logic)';
    const testList = b.testCoverage.recommended.length > 0 
      ? b.testCoverage.recommended.map(t => `• [${t.priority}] ${t.testFile} (${t.reason})`).join('\n')
      : '• No related test suites identified';

    return `
### BEFORE YOU MODIFY THIS: \`${b.target}\`

**RISK LEVEL**: **${b.risk.level}** (${b.risk.score}/100)
**LOCATION**: \`${b.file}\` (${b.kind})

**USED BY**:
${usedByList}

**API EXPOSURE**:
${apiList}

**DEPENDENCY CENTRALITY**: ${b.dependencyCentrality}
**RECENT CHURN**: ${b.recentChurn}
**BUG HISTORY**: ${b.bugHistory.count} related historical incident${b.bugHistory.count === 1 ? '' : 's'}

**TEST COVERAGE**: ${b.testCoverage.count} relevant test suite${b.testCoverage.count === 1 ? '' : 's'}
${testList}

**POTENTIAL IMPACT**:
• ${b.potentialImpact.dependentsCount} Subsystems / Callers
• ${b.potentialImpact.apiCount} API Endpoints
• ${b.potentialImpact.testCount} Test Suites

**RECOMMENDED ACTION**:
> ${b.recommendedAction}
    `.trim();
  }

  formatMarkdown(b) {
    return this.toMarkdown(b);
  }
}

