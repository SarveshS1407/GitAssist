import path from 'node:path';

/**
 * Advanced Test Intelligence Engine
 * Computes verification density, identifies uncovered high-risk critical files,
 * maps test suite coverage to source modules, and calculates a verification readiness grade.
 */
export class AdvancedTestIntelligence {
  /**
   * @param {Object} options
   * @param {import('./context-graph.js').ContextGraph} options.contextGraph
   * @param {import('./call-graph.js').CallGraphEngine} [options.callGraph]
   * @param {Array} [options.hotspots]
   * @param {Array} [options.files]
   */
  constructor({ contextGraph, callGraph = null, hotspots = [], files = [] }) {
    this.graph = contextGraph;
    this.callGraph = callGraph;
    this.hotspots = hotspots || [];
    this.files = files || [];
  }

  /**
   * Run deep test verification analysis across the active repository
   */
  analyze() {
    const testFiles = [];
    const sourceFiles = [];

    for (const f of this.files) {
      const p = f.relativePath.toLowerCase();
      const isTest = /(^|\/)tests?\//.test(p) || /(^|\/)__tests__\//.test(p) || /\.(test|spec)\.[a-zA-Z0-9]+$/.test(p);
      if (isTest) {
        testFiles.push(f);
      } else {
        sourceFiles.push(f);
      }
    }

    const testPathSet = new Set(testFiles.map(t => t.relativePath));

    // 1. Map each source file to tests that verify it
    const moduleCoverage = [];
    const uncoveredHighRiskFiles = [];

    for (const sf of sourceFiles) {
      const rel = sf.relativePath;
      const baseName = path.basename(rel, path.extname(rel)).toLowerCase();
      const associatedTests = [];

      // A. Naming convention match
      for (const tf of testFiles) {
        const testBase = path.basename(tf.relativePath, path.extname(tf.relativePath)).toLowerCase();
        const testClean = testBase.replace(/\.(test|spec)$/, '').replace(/-(test|spec)$/, '').replace(/_(test|spec)$/, '');
        if (testClean === baseName || testClean.endsWith('/' + baseName) || testBase === `${baseName}.test` || testBase === `${baseName}.spec`) {
          associatedTests.push({ testFile: tf.relativePath, type: 'NAMING_CORRELATION' });
        }
      }

      // B. ContextGraph direct edge (test imports source)
      if (this.graph && this.graph.hasNode(rel)) {
        const inEdges = this.graph.getInboundEdges(rel);
        for (const edge of inEdges) {
          if (testPathSet.has(edge.source) && !associatedTests.some(t => t.testFile === edge.source)) {
            associatedTests.push({ testFile: edge.source, type: 'IMPORT_DEPENDENCY' });
          }
        }
      }

      // Find hotspot churn
      const hotspot = this.hotspots.find(h => h.relativePath === rel);
      const churn = hotspot ? hotspot.churnCount : 1;
      const lines = sf.lineCount || 50;
      const isCritical = churn >= 4 || lines >= 250;

      const coverageRatio = associatedTests.length > 0 ? 100 : 0;

      const modRecord = {
        file: rel,
        language: sf.language,
        lineCount: lines,
        churn,
        isCritical,
        verified: associatedTests.length > 0,
        associatedTests
      };

      moduleCoverage.push(modRecord);

      if (associatedTests.length === 0 && isCritical) {
        uncoveredHighRiskFiles.push({
          file: rel,
          lineCount: lines,
          churn,
          reason: churn >= 4 ? `High churn hotspot (${churn} commits) with zero automated tests` : `Large complex module (${lines} LOC) lacking test coverage`
        });
      }
    }

    // 2. Metrics & Readiness Grade
    const totalSource = sourceFiles.length;
    const verifiedCount = moduleCoverage.filter(m => m.verified).length;
    const coveragePercentage = totalSource > 0 ? Math.round((verifiedCount / totalSource) * 100) : 0;
    const testToSourceRatio = totalSource > 0 ? Number(((testFiles.length / totalSource) * 100).toFixed(1)) : 0;

    // Calculate Verification Readiness Grade (A, B, C, D, F)
    let grade = 'A';
    if (coveragePercentage < 30 || uncoveredHighRiskFiles.length >= 8) grade = 'F';
    else if (coveragePercentage < 50 || uncoveredHighRiskFiles.length >= 5) grade = 'D';
    else if (coveragePercentage < 70 || uncoveredHighRiskFiles.length >= 2) grade = 'C';
    else if (coveragePercentage < 85) grade = 'B';

    return {
      summary: {
        totalTestFiles: testFiles.length,
        totalSourceFiles: totalSource,
        verifiedSourceFiles: verifiedCount,
        unverifiedSourceFiles: totalSource - verifiedCount,
        coveragePercentage,
        testToSourceRatio,
        uncoveredHighRiskCount: uncoveredHighRiskFiles.length,
        verificationGrade: grade
      },
      uncoveredHighRiskFiles: uncoveredHighRiskFiles.sort((a, b) => b.churn - a.churn),
      moduleCoverage: moduleCoverage.slice(0, 50),
      testSuites: testFiles.map(t => ({
        file: t.relativePath,
        lineCount: t.lineCount || 50,
        language: t.language
      }))
    };
  }
}
