/**
 * Hotspot & Churn Analyzer
 * Identifies architectural hotspots by combining file change frequency (churn)
 * with file complexity / line counts to calculate risk scores.
 */
export class HotspotAnalyzer {
  /**
   * Calculates hotspot risk scores for all scanned files based on Git commits
   * @param {Array} files Array of file metadata objects
   * @param {Array} commits Array of Git commit objects with file lists
   * @returns {Array} List of hotspots sorted by risk score descending
   */
  static analyzeHotspots(files, commits) {
    const churnMap = new Map();

    // Tally how many times each file was touched in commits
    for (const commit of (commits || [])) {
      const commitFiles = commit.files || [];
      for (const filePath of commitFiles) {
        churnMap.set(filePath, (churnMap.get(filePath) || 0) + 1);
      }
    }

    const hotspots = [];

    for (const file of files) {
      const churnCount = churnMap.get(file.relativePath) || 0;
      const lines = file.lineCount || 0;
      const symbolCount = (file.symbols || []).length;

      // Risk score: Logarithmic scaling of lines * churn frequency
      const complexityWeight = Math.log10(Math.max(lines, 10)) * (1 + symbolCount * 0.1);
      const score = Math.round(complexityWeight * (churnCount + 1) * 10) / 10;

      let riskLevel = 'Low';
      if (score >= 40 || (churnCount > 5 && lines > 300)) {
        riskLevel = 'High';
      } else if (score >= 20 || churnCount > 2) {
        riskLevel = 'Medium';
      }

      hotspots.push({
        relativePath: file.relativePath,
        language: file.language,
        lineCount: lines,
        symbolCount,
        churnCount,
        score,
        riskLevel
      });
    }

    return hotspots.sort((a, b) => b.score - a.score);
  }
}
