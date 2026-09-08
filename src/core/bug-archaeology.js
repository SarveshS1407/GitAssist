/**
 * Bug Archaeology & Defect Intelligence Engine
 * Classifies historical defect commits into architectural categories (syntax, security, logic, regression, perf),
 * identifies recurring defect hotspots, measures bug-fix velocity, and correlates bug density to codebase modules.
 */
export class BugArchaeologyEngine {
  /**
   * @param {Object} options
   * @param {Array} options.commits
   * @param {Array} [options.hotspots]
   * @param {Array} [options.files]
   */
  constructor({ commits = [], hotspots = [], files = [] }) {
    this.commits = commits || [];
    this.hotspots = hotspots || [];
    this.files = files || [];
  }

  /**
   * Execute defect analysis and category correlation
   */
  analyze() {
    const bugKeywords = [
      { pattern: /\b(vuln|cve|security|exploit|sanitize)\b/i, category: 'SECURITY_FIX' },
      { pattern: /\b(regression|broken|broke)\b/i, category: 'REGRESSION_FIX' },
      { pattern: /\b(leak|perf|slow|timeout|oom|memory)\b/i, category: 'PERFORMANCE_FIX' },
      { pattern: /\b(crash|null|undefined|unhandled|panic|exception)\b/i, category: 'CRASH_FIX' },
      { pattern: /\b(bug|fix|hotfix|patch|issue|resolve|flaky)\b/i, category: 'LOGIC_FIX' }
    ];

    const defectCommits = [];
    const categoryCounts = {
      SECURITY_FIX: 0,
      REGRESSION_FIX: 0,
      PERFORMANCE_FIX: 0,
      CRASH_FIX: 0,
      LOGIC_FIX: 0
    };

    const moduleDefectMap = new Map(); // file -> count

    for (const commit of this.commits) {
      const msg = commit.message || '';
      let matchedCategory = null;

      for (const { pattern, category } of bugKeywords) {
        if (pattern.test(msg)) {
          matchedCategory = category;
          break;
        }
      }

      if (matchedCategory) {
        categoryCounts[matchedCategory] = (categoryCounts[matchedCategory] || 0) + 1;

        const touchedFiles = (commit.files || []).map(f => (typeof f === 'string' ? f : f.file || ''));
        for (const file of touchedFiles) {
          if (file) {
            moduleDefectMap.set(file, (moduleDefectMap.get(file) || 0) + 1);
          }
        }

        defectCommits.push({
          hash: commit.hash,
          shortHash: (commit.hash || '').substring(0, 7),
          message: commit.message,
          author: commit.author,
          date: commit.date,
          category: matchedCategory,
          files: touchedFiles
        });
      }
    }

    // Identify Defect-Prone Subsystems / Modules
    const defectHotspots = Array.from(moduleDefectMap.entries())
      .map(([file, count]) => ({
        file,
        defectCount: count,
        risk: count >= 4 ? 'CRITICAL' : count >= 2 ? 'HIGH' : 'MEDIUM'
      }))
      .sort((a, b) => b.defectCount - a.defectCount)
      .slice(0, 15);

    const totalCommits = this.commits.length;
    const defectRatio = totalCommits > 0 
      ? Number(((defectCommits.length / totalCommits) * 100).toFixed(1))
      : 0;

    let stabilityScore = Math.max(10, Math.round(100 - defectRatio * 2.5));
    let stabilityRating = stabilityScore >= 80 ? 'EXCELLENT' : stabilityScore >= 60 ? 'MODERATE' : 'VOLATILE';

    return {
      summary: {
        totalAnalyzedCommits: totalCommits,
        totalDefectCommits: defectCommits.length,
        defectRatio,
        stabilityScore,
        stabilityRating,
        categories: categoryCounts
      },
      defectHotspots,
      defectCommits: defectCommits.slice(0, 30)
    };
  }
}
