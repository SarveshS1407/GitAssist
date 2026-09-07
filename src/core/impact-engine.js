import path from 'node:path';

/**
 * Advanced Multi-Dimensional Change Impact Engine
 * Traces direct and transitive dependents, affected API endpoints,
 * affected test suites, architectural features, and historical bug patterns.
 */
export class AdvancedImpactEngine {
  /**
   * @param {Object} options
   * @param {import('./context-graph.js').ContextGraph} options.contextGraph
   * @param {import('./call-graph.js').CallGraphEngine} [options.callGraph]
   * @param {Array} [options.hotspots]
   * @param {Array} [options.commits]
   * @param {Array} [options.endpoints]
   */
  constructor({ contextGraph, callGraph = null, hotspots = [], commits = [], endpoints = [] }) {
    this.graph = contextGraph;
    this.callGraph = callGraph;
    this.hotspots = hotspots || [];
    this.commits = commits || [];
    this.endpoints = endpoints || [];
  }

  /**
   * Analyze multi-dimensional impact for a target file or symbol
   * @param {string} targetRef File path (e.g. 'src/services/payment.js') or symbol ID
   * @param {number} [maxDepth=4]
   */
  analyzeImpact(targetRef, maxDepth = 4) {
    if (!targetRef) {
      return null;
    }

    const isFile = targetRef.includes('/') || targetRef.includes('\\') || /\.[a-zA-Z0-9]+$/.test(targetRef);
    const isSymbol = targetRef.startsWith('sym:') || (!isFile && (targetRef.includes('.') || targetRef.includes('(')));
    const fileTarget = isSymbol ? this.resolveFileForSymbol(targetRef) : targetRef;

    // 1. Direct and Indirect Dependents
    const { directDependents, indirectDependents, allDependents } = this.calculateDependents(fileTarget, targetRef, isSymbol, maxDepth);

    // 2. Affected API Endpoints
    const affectedApis = this.calculateAffectedApis(fileTarget, allDependents);

    // 3. Affected Test Suites
    const affectedTests = this.calculateAffectedTests(fileTarget, allDependents);

    // 4. Affected Application Features
    const affectedFeatures = this.calculateAffectedFeatures(fileTarget, allDependents);

    // 5. Historical Bug Incidents & Churn
    const history = this.calculateHistory(fileTarget);

    // 6. Multi-Factor Risk Score Calculation (0 - 100)
    const riskAnalysis = this.calculateRiskScore({
      directCount: directDependents.length,
      indirectCount: indirectDependents.length,
      apiCount: affectedApis.length,
      testCount: affectedTests.length,
      churnScore: history.churnCount,
      bugCount: history.bugCommits.length
    });

    // 7. Recommended Review Areas
    const recommendedReviews = this.calculateRecommendedReviews(fileTarget, directDependents, affectedApis, allDependents);

    return {
      target: targetRef,
      isSymbol,
      targetFile: fileTarget,
      riskLevel: riskAnalysis.level,
      riskScore: riskAnalysis.score,
      riskBreakdown: riskAnalysis.breakdown,
      directDependents: directDependents.slice(0, 20),
      indirectDependents: indirectDependents.slice(0, 30),
      stats: {
        directCount: directDependents.length,
        indirectCount: indirectDependents.length,
        totalDependents: allDependents.length,
        affectedApiCount: affectedApis.length,
        affectedTestCount: affectedTests.length,
        affectedFeatureCount: affectedFeatures.length,
        historicalBugs: history.bugCommits.length,
        churnScore: history.churnCount
      },
      affectedApis: affectedApis.slice(0, 15),
      affectedTests: affectedTests.slice(0, 15),
      affectedFeatures,
      history: {
        churnCount: history.churnCount,
        bugCount: history.bugCommits.length,
        recentBugs: history.bugCommits.slice(0, 5)
      },
      recommendedReviews
    };
  }

  resolveFileForSymbol(symbolRef) {
    if (this.callGraph) {
      const sym = this.callGraph.resolveSymbol(symbolRef);
      if (sym && sym.file) return sym.file;
    }
    const node = this.graph.getNode(symbolRef);
    if (node && node.file) return node.file;
    return symbolRef;
  }

  calculateDependents(fileTarget, targetRef, isSymbol, maxDepth) {
    const directSet = new Set();
    const allVisited = new Set([`file:${fileTarget}`]);
    const queue = [{ id: `file:${fileTarget}`, depth: 1 }];

    // If symbol-level call graph is available and target is a symbol
    if (isSymbol && this.callGraph) {
      const callResult = this.callGraph.getCallers(targetRef, maxDepth);
      const symbolDirect = callResult.callers.filter(c => c.depth === 1).map(c => c.symbol.qualifiedName || c.symbol.name);
      const symbolIndirect = callResult.callers.filter(c => c.depth > 1).map(c => c.symbol.qualifiedName || c.symbol.name);
      const symbolAll = callResult.callers.map(c => c.symbol.file);

      // Also get file-level callers
      const fileEdges = this.graph.getIncomingEdges(`file:${fileTarget}`, 'IMPORTS');
      for (const e of fileEdges) {
        directSet.add(e.source.replace(/^file:/, ''));
      }

      return {
        directDependents: symbolDirect.length > 0 ? symbolDirect : Array.from(directSet),
        indirectDependents: symbolIndirect,
        allDependents: Array.from(new Set([...symbolAll, ...directSet]))
      };
    }

    // File-level transitive BFS traversal
    const indirectSet = new Set();

    while (queue.length > 0) {
      const { id, depth } = queue.shift();
      if (depth > maxDepth) continue;

      const incomingEdges = this.graph.getIncomingEdges(id, 'IMPORTS');

      for (const edge of incomingEdges) {
        const depPath = edge.source.replace(/^file:/, '');
        if (!allVisited.has(edge.source)) {
          allVisited.add(edge.source);
          if (depth === 1) {
            directSet.add(depPath);
          } else {
            indirectSet.add(depPath);
          }
          queue.push({ id: edge.source, depth: depth + 1 });
        }
      }
    }

    return {
      directDependents: Array.from(directSet),
      indirectDependents: Array.from(indirectSet),
      allDependents: Array.from(allVisited).map(id => id.replace(/^file:/, '')).filter(p => p !== fileTarget)
    };
  }

  calculateAffectedApis(fileTarget, allDependents) {
    const relevantFiles = new Set([fileTarget, ...allDependents]);
    const matchedApis = [];

    for (const ep of this.endpoints) {
      if (ep.file && relevantFiles.has(ep.file)) {
        matchedApis.push({
          method: ep.method,
          path: ep.path,
          file: ep.file,
          isDirect: ep.file === fileTarget
        });
      }
    }

    return matchedApis;
  }

  calculateAffectedTests(fileTarget, allDependents) {
    const relevantFiles = new Set([fileTarget, ...allDependents]);
    const testResults = [];
    const baseName = path.basename(fileTarget, path.extname(fileTarget)).toLowerCase();

    for (const [id, node] of this.graph.nodes.entries()) {
      if (node.type !== 'file') continue;
      const isTestFile = node.path.includes('test') || node.path.includes('spec');
      if (!isTestFile) continue;

      let priority = 'LOW';
      let reason = 'General test suite';

      // 1. Direct name match (e.g. payment.test.js for payment.js)
      if (node.path.toLowerCase().includes(baseName)) {
        priority = 'HIGH';
        reason = `Direct naming match for ${baseName}`;
      } else {
        // 2. Checks if test imports target file or direct dependents
        const testEdges = this.graph.getOutgoingEdges(node.id, 'IMPORTS');
        const importsTarget = testEdges.some(e => e.target === `file:${fileTarget}`);
        if (importsTarget) {
          priority = 'HIGH';
          reason = `Imports ${fileTarget} directly`;
        } else {
          const importsDep = testEdges.some(e => relevantFiles.has(e.target.replace(/^file:/, '')));
          if (importsDep) {
            priority = 'MEDIUM';
            reason = 'Imports one of the impacted dependent subsystems';
          }
        }
      }

      testResults.push({
        testFile: node.path,
        priority,
        reason
      });
    }

    // Sort by priority (HIGH -> MEDIUM -> LOW)
    const priorityWeights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return testResults.sort((a, b) => priorityWeights[b.priority] - priorityWeights[a.priority]);
  }

  calculateAffectedFeatures(fileTarget, allDependents) {
    const allTouched = [fileTarget, ...allDependents];
    const featureMap = new Map();

    for (const f of allTouched) {
      const lower = f.toLowerCase();
      let cat = 'Core Business Logic';
      if (lower.includes('api') || lower.includes('route') || lower.includes('server')) cat = 'API & Gateway';
      else if (lower.includes('ui') || lower.includes('view') || lower.includes('component')) cat = 'User Interface & Views';
      else if (lower.includes('db') || lower.includes('store') || lower.includes('repository') || lower.includes('state')) cat = 'Data Persistence & State';
      else if (lower.includes('service')) cat = 'Domain Services';
      else if (lower.includes('auth') || lower.includes('security')) cat = 'Authentication & Security';

      if (!featureMap.has(cat)) featureMap.set(cat, 0);
      featureMap.set(cat, featureMap.get(cat) + 1);
    }

    return Array.from(featureMap.entries()).map(([feature, count]) => ({ feature, count }));
  }

  calculateHistory(fileTarget) {
    const hotspot = this.hotspots.find(h => h.relativePath === fileTarget);
    const churnCount = hotspot?.churnCount || 1;

    const bugKeywords = ['bug', 'fix', 'patch', 'issue', 'crash', 'regression', 'hotfix'];
    const bugCommits = this.commits.filter(c => {
      const msg = (c.message || '').toLowerCase();
      const files = (c.files || []).map(f => (typeof f === 'string' ? f : f.file || ''));
      const touchesFile = files.some(f => f.includes(fileTarget));
      return touchesFile && bugKeywords.some(kw => msg.includes(kw));
    });

    return { churnCount, bugCommits };
  }

  calculateRiskScore({ directCount, indirectCount, apiCount, testCount, churnScore, bugCount }) {
    // Weighted scoring model (0 to 100)
    const directScore = Math.min(30, directCount * 8);
    const indirectScore = Math.min(25, indirectCount * 4);
    const apiScore = Math.min(25, apiCount > 0 ? 10 + (apiCount - 1) * 5 : 0);
    const churnBugScore = Math.min(20, (churnScore >= 5 ? 10 : churnScore * 2) + bugCount * 5);
    const testDeficitScore = testCount === 0 ? 15 : testCount < 2 ? 8 : 0;

    const rawScore = directScore + indirectScore + apiScore + churnBugScore + testDeficitScore;
    const score = Math.max(10, Math.min(100, Math.round(rawScore)));

    let level = 'LOW';
    if (score >= 75) level = 'CRITICAL';
    else if (score >= 50) level = 'HIGH';
    else if (score >= 25) level = 'MEDIUM';

    return {
      score,
      level,
      breakdown: {
        directScore,
        indirectScore,
        apiScore,
        churnBugScore,
        testDeficitScore
      }
    };
  }

  calculateRecommendedReviews(fileTarget, directDependents, affectedApis, allDependents) {
    const reviews = [];

    // 1. Direct callers
    if (directDependents.length > 0) {
      reviews.push(`Review top direct dependents: ${directDependents.slice(0, 3).join(', ')}`);
    }

    // 2. Exposed APIs
    if (affectedApis.length > 0) {
      reviews.push(`Verify contract stability on exposed endpoints: ${affectedApis.slice(0, 2).map(a => `${a.method} ${a.path}`).join(', ')}`);
    }

    // 3. Structural depth
    if (allDependents.length > 5) {
      reviews.push(`High architectural ripple (${allDependents.length} subsystems touched); run regression test suites before merging`);
    } else {
      reviews.push('Localized blast radius; internal modification is relatively safe with standard unit testing');
    }

    return reviews;
  }
}
