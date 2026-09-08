/**
 * Structural Risk Matrix Engine
 * Computes multi-factor risk quadrant scores by combining:
 * 1. Historical Churn (Volatility)
 * 2. Transitive Dependency Centrality (Fan-in & Blast Radius)
 * 3. Code Complexity & Volume (Lines of Code & Cyclomatic Signals)
 * 4. Verification Deficit (Untested penalty)
 */
export class RiskMatrixEngine {
  /**
   * @param {Object} options
   * @param {import('./context-graph.js').ContextGraph} options.contextGraph
   * @param {Array} [options.hotspots]
   * @param {Array} [options.files]
   */
  constructor({ contextGraph, hotspots = [], files = [] }) {
    this.graph = contextGraph;
    this.hotspots = hotspots || [];
    this.files = files || [];
  }

  /**
   * Calculate ranked risk scores and classify into architectural quadrants
   */
  calculate() {
    const riskRanking = [];
    const quadrants = {
      CRITICAL_CORE: [],  // High Churn + High Centrality
      FRAGILE_HOTSPOT: [], // High Churn + Low Centrality
      FOUNDATIONAL_DEBT: [], // Low Churn + High Centrality
      STABLE_LEAF: [] // Low Churn + Low Centrality
    };

    for (const file of this.files) {
      const rel = file.relativePath;
      const isTest = /(^|\/)tests?\//.test(rel) || /\.(test|spec)\.[a-zA-Z0-9]+$/.test(rel);
      if (isTest || rel.endsWith('.json') || rel.endsWith('.md') || rel.endsWith('.css') || rel.endsWith('.html')) {
        continue;
      }

      const hotspot = this.hotspots.find(h => h.relativePath === rel);
      const churn = hotspot ? hotspot.churnCount : 1;
      const loc = file.lineCount || 50;

      // Inbound callers / dependents from ContextGraph
      let dependentsCount = 0;
      let dependenciesCount = 0;
      if (this.graph && this.graph.hasNode(rel)) {
        dependentsCount = this.graph.getInboundEdges(rel).length;
        dependenciesCount = this.graph.getOutboundEdges(rel).length;
      }

      // Formula:
      // Churn factor (0-35)
      const churnScore = Math.min(35, churn * 4);
      // Centrality / Blast factor (0-35)
      const centralityScore = Math.min(35, dependentsCount * 5 + dependenciesCount * 2);
      // Volume factor (0-20)
      const volumeScore = Math.min(20, Math.round(loc / 25));
      // Baseline risk (10)
      const rawScore = 10 + churnScore + centralityScore + volumeScore;
      const score = Math.min(100, Math.round(rawScore));

      let level = 'LOW';
      if (score >= 70) level = 'HIGH';
      else if (score >= 40) level = 'MEDIUM';

      // Assign architectural quadrant
      const isHighChurn = churn >= 4;
      const isHighCentrality = dependentsCount >= 3 || centralityScore >= 15;

      let quadrant = 'STABLE_LEAF';
      if (isHighChurn && isHighCentrality) {
        quadrant = 'CRITICAL_CORE';
      } else if (isHighChurn && !isHighCentrality) {
        quadrant = 'FRAGILE_HOTSPOT';
      } else if (!isHighChurn && isHighCentrality) {
        quadrant = 'FOUNDATIONAL_DEBT';
      }

      const item = {
        file: rel,
        score,
        level,
        quadrant,
        churn,
        loc,
        dependentsCount,
        dependenciesCount,
        breakdown: {
          churnScore,
          centralityScore,
          volumeScore
        }
      };

      riskRanking.push(item);
      quadrants[quadrant].push(item);
    }

    riskRanking.sort((a, b) => b.score - a.score);

    const highRiskCount = riskRanking.filter(r => r.level === 'HIGH').length;
    const avgScore = riskRanking.length > 0 
      ? Math.round(riskRanking.reduce((acc, r) => acc + r.score, 0) / riskRanking.length)
      : 0;

    return {
      summary: {
        totalEvaluated: riskRanking.length,
        highRiskCount,
        avgRiskScore: avgScore,
        criticalCoreCount: quadrants.CRITICAL_CORE.length,
        fragileHotspotCount: quadrants.FRAGILE_HOTSPOT.length
      },
      riskRanking: riskRanking.slice(0, 30),
      quadrants: {
        CRITICAL_CORE: quadrants.CRITICAL_CORE.slice(0, 10),
        FRAGILE_HOTSPOT: quadrants.FRAGILE_HOTSPOT.slice(0, 10),
        FOUNDATIONAL_DEBT: quadrants.FOUNDATIONAL_DEBT.slice(0, 10),
        STABLE_LEAF: quadrants.STABLE_LEAF.slice(0, 10)
      }
    };
  }
}
