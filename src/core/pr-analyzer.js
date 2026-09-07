import path from 'node:path';

/**
 * PR & Diff Risk Analyzer
 * Analyzes unified git diffs, changed symbols, call graph impact,
 * affected APIs, risk indicators, and recommended test suites.
 */
export class PRRiskAnalyzer {
  /**
   * @param {Object} options
   * @param {import('./context-graph.js').ContextGraph} options.contextGraph
   * @param {import('./call-graph.js').CallGraphEngine} [options.callGraph]
   * @param {import('./impact-engine.js').AdvancedImpactEngine} [options.impactEngine]
   * @param {Array} [options.hotspots]
   * @param {Array} [options.endpoints]
   */
  constructor({ contextGraph, callGraph = null, impactEngine = null, hotspots = [], endpoints = [] }) {
    this.graph = contextGraph;
    this.callGraph = callGraph;
    this.impactEngine = impactEngine;
    this.hotspots = hotspots || [];
    this.endpoints = endpoints || [];
  }

  /**
   * Parses unified git diff into structured file change records
   * @param {string} diffText Raw git diff
   * @returns {Array<Object>} Array of changed file records
   */
  parseDiff(diffText = '') {
    if (!diffText || typeof diffText !== 'string') return [];

    const files = [];
    const normalized = diffText.replace(/\r\n/g, '\n').trim();
    const diffBlocks = normalized.split(/^diff --git\s+/m).filter(b => b && b.trim());

    for (const block of diffBlocks) {
      const lines = block.split('\n');
      const headerLine = lines[0] || '';
      const headerMatch = headerLine.match(/^(?:a\/)?(\S+)\s+(?:b\/)?(\S+)$/);
      const patchLine = lines.find(l => l.startsWith('+++ b/'));
      const filePath = patchLine ? patchLine.replace('+++ b/', '').trim() : (headerMatch ? headerMatch[2].replace(/^b\//, '') : null);

      if (!filePath || filePath === '/dev/null') continue;

      let insertions = 0;
      let deletions = 0;
      const modifiedLineNumbers = new Set();
      let currentNewLine = 0;

      for (const line of lines) {
        const hunkMatch = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
        if (hunkMatch) {
          currentNewLine = parseInt(hunkMatch[2], 10);
          continue;
        }

        if (line.startsWith('+') && !line.startsWith('+++')) {
          insertions++;
          modifiedLineNumbers.add(currentNewLine);
          currentNewLine++;
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          deletions++;
        } else if (!line.startsWith('\\')) {
          currentNewLine++;
        }
      }

      let status = 'modified';
      if (block.includes('new file mode')) status = 'added';
      else if (block.includes('deleted file mode')) status = 'deleted';

      files.push({
        file: filePath,
        status,
        insertions,
        deletions,
        totalLinesChanged: insertions + deletions,
        modifiedLineNumbers: Array.from(modifiedLineNumbers)
      });
    }

    return files;
  }

  /**
   * Analyze complete pull request risk
   * @param {string} diffText Unified git diff
   * @param {Object} [metadata] Optional author, branch info
   */
  analyze(diffText, metadata = {}) {
    const changedFiles = this.parseDiff(diffText);
    if (changedFiles.length === 0) {
      return {
        overallRisk: 0,
        riskLevel: 'LOW',
        filesChangedCount: 0,
        symbolsChangedCount: 0,
        affectedModulesCount: 0,
        highRiskChangesCount: 0,
        affectedApisCount: 0,
        changedFiles: [],
        changedSymbols: [],
        highRiskChanges: [],
        affectedApis: [],
        recommendedTests: []
      };
    }

    const changedSymbols = [];
    const allTouchedFiles = new Set(changedFiles.map(f => f.file));
    const highRiskChanges = [];
    const affectedModules = new Set();

    // 1. Correlate changed lines with symbols in ContextGraph
    for (const cf of changedFiles) {
      const moduleName = cf.file.includes('/') ? cf.file.split('/')[0] : 'root';
      affectedModules.add(moduleName);

      const fileSymbols = this.graph ? this.graph.getSymbolsForFile(cf.file) : [];
      let fileSymbolsChanged = 0;

      for (const sym of fileSymbols) {
        const touchesSymbol = cf.modifiedLineNumbers.some(
          line => line >= sym.lineStart && line <= (sym.lineEnd || sym.lineStart)
        );

        if (touchesSymbol) {
          fileSymbolsChanged++;
          changedSymbols.push({
            name: sym.name,
            qualifiedName: sym.qualifiedName,
            kind: sym.kind,
            file: cf.file,
            signature: sym.signature
          });
        }
      }

      // Check for high-risk signals
      const hotspot = this.hotspots.find(h => h.relativePath === cf.file);
      const isChurnHotspot = hotspot && hotspot.churnCount >= 8;
      const isLargeDiff = cf.totalLinesChanged >= 80;

      if (isChurnHotspot || isLargeDiff || cf.status === 'deleted') {
        highRiskChanges.push({
          file: cf.file,
          reason: isChurnHotspot 
            ? `High historical churn hotspot (${hotspot.churnCount} commits)` 
            : isLargeDiff 
            ? `Large modification blast (+${cf.insertions}/-${cf.deletions} lines)` 
            : 'File deletion may break downstream importers',
          linesChanged: cf.totalLinesChanged
        });
      }
    }

    // 2. Identify Affected APIs
    const affectedApis = [];
    for (const ep of this.endpoints) {
      if (allTouchedFiles.has(ep.file)) {
        affectedApis.push({
          method: ep.method,
          path: ep.path,
          file: ep.file,
          direct: true
        });
      }
    }

    // If impactEngine available, calculate transitive API impact
    if (this.impactEngine) {
      for (const cf of changedFiles) {
        const impact = this.impactEngine.analyzeImpact(cf.file, 2);
        if (impact && impact.affectedApis) {
          for (const api of impact.affectedApis) {
            if (!affectedApis.some(a => a.path === api.path && a.method === api.method)) {
              affectedApis.push({
                ...api,
                direct: false
              });
            }
          }
        }
      }
    }

    // 3. Recommended Tests
    const recommendedTests = [];
    const testMap = new Map();

    if (this.impactEngine) {
      for (const cf of changedFiles) {
        const impact = this.impactEngine.analyzeImpact(cf.file, 2);
        if (impact && impact.affectedTests) {
          for (const testItem of impact.affectedTests) {
            if (!testMap.has(testItem.testFile)) {
              testMap.set(testItem.testFile, testItem);
            }
          }
        }
      }
    }

    // 4. Calculate Overall PR Risk Score (0 to 100)
    const scopeScore = Math.min(30, changedFiles.length * 4 + changedFiles.reduce((acc, f) => acc + f.totalLinesChanged, 0) / 10);
    const symbolScore = Math.min(25, changedSymbols.length * 5);
    const apiScore = Math.min(25, affectedApis.length * 10);
    const highRiskScore = Math.min(20, highRiskChanges.length * 8);

    const rawRisk = scopeScore + symbolScore + apiScore + highRiskScore;
    const overallRisk = Math.max(15, Math.min(100, Math.round(rawRisk)));

    let riskLevel = 'LOW';
    if (overallRisk >= 75) riskLevel = 'CRITICAL';
    else if (overallRisk >= 50) riskLevel = 'HIGH';
    else if (overallRisk >= 25) riskLevel = 'MEDIUM';

    const testList = Array.from(testMap.values()).slice(0, 8);

    return {
      overallRisk,
      riskLevel,
      filesChangedCount: changedFiles.length,
      symbolsChangedCount: changedSymbols.length,
      affectedModulesCount: affectedModules.size,
      highRiskChangesCount: highRiskChanges.length,
      affectedApisCount: affectedApis.length,
      changedFiles,
      changedSymbols,
      highRiskChanges,
      affectedApis: affectedApis.slice(0, 10),
      recommendedTests: testList,
      metadata
    };
  }
}
