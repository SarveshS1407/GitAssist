/**
 * Code Metrics & Complexity Estimator
 * Calculates cyclomatic complexity, maintainability index, and comment density
 */
export class CodeMetrics {
  /**
   * Analyzes file content and calculates complexity heuristics
   * @param {string} content Source code string
   * @param {string} language Programming language
   * @returns {Object} Metric breakdown
   */
  static calculateFileMetrics(content, language = 'JavaScript') {
    if (!content || typeof content !== 'string') {
      return {
        loc: 0,
        sloc: 0,
        commentLines: 0,
        blankLines: 0,
        complexity: 1,
        maintainabilityIndex: 100,
        commentRatio: 0
      };
    }

    const lines = content.split('\n');
    let loc = lines.length;
    let sloc = 0;
    let commentLines = 0;
    let blankLines = 0;
    let complexity = 1;

    // Common branching keyword regex
    const branchingRegex = /\b(if|else\s+if|for|while|case|catch|&&|\|\||\?)\b/g;
    const singleCommentRegex = /^(\s*(\/\/|#|--|\*))/;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        blankLines++;
        continue;
      }

      if (singleCommentRegex.test(trimmed)) {
        commentLines++;
        continue;
      }

      sloc++;

      const branchMatches = line.match(branchingRegex);
      if (branchMatches) {
        complexity += branchMatches.length;
      }
    }

    const commentRatio = loc > 0 ? Math.round((commentLines / loc) * 100) : 0;

    // Simplified Maintainability Index (MI = 171 - 5.2 * ln(Halstead) - 0.23 * Complexity - 16.2 * ln(SLOC))
    const miRaw = 171 - (0.23 * complexity) - (16.2 * Math.log(Math.max(sloc, 1))) + (50 * Math.sin(Math.sqrt(2.4 * (commentRatio / 100))));
    const maintainabilityIndex = Math.max(0, Math.min(100, Math.round(miRaw)));

    return {
      loc,
      sloc,
      commentLines,
      blankLines,
      complexity,
      maintainabilityIndex,
      commentRatio
    };
  }
}
