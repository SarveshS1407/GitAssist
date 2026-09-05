import path from 'node:path';

/**
 * StabilityForecaster
 * Analyzes commit frequency, recency, and velocity trends to categorize codebase module stability.
 */
export class StabilityForecaster {
  constructor() {}

  /**
   * Forecast stability across files and directories
   * @param {Array<{ date?: string, files?: string[], author?: string }>} commits
   * @param {Array<{ relativePath: string }>} files
   * @returns {{ summary: Object, modules: Array }}
   */
  forecast(commits = [], files = []) {
    const fileStats = new Map();

    for (const f of files) {
      if (!f || !f.relativePath) continue;
      fileStats.set(f.relativePath, {
        file: f.relativePath,
        commitCount: 0,
        recentCommitCount: 0,
        authors: new Set()
      });
    }

    const totalCommits = commits.length;
    // Assume recent commits are the top 30% of chronologically ordered commits
    const recentThreshold = Math.max(1, Math.round(totalCommits * 0.3));

    commits.forEach((c, idx) => {
      const isRecent = idx < recentThreshold;
      const modifiedFiles = c.files || [];

      for (const filePath of modifiedFiles) {
        let stats = fileStats.get(filePath);
        if (!stats) {
          stats = {
            file: filePath,
            commitCount: 0,
            recentCommitCount: 0,
            authors: new Set()
          };
          fileStats.set(filePath, stats);
        }

        stats.commitCount++;
        if (isRecent) {
          stats.recentCommitCount++;
        }
        if (c.author) {
          stats.authors.add(c.author);
        }
      }
    });

    const evaluated = [];
    const classificationCounts = {
      STABLE: 0,
      ACTIVE_DEVELOPMENT: 0,
      VOLATILE_CHURN: 0,
      DORMANT: 0
    };

    for (const stats of fileStats.values()) {
      let classification = 'STABLE';
      let confidence = 0.85;

      if (stats.commitCount === 0) {
        classification = 'DORMANT';
        confidence = 0.75;
      } else if (stats.commitCount >= 5 && stats.recentCommitCount >= 2) {
        classification = 'VOLATILE_CHURN';
        confidence = 0.92;
      } else if (stats.commitCount >= 2 || stats.recentCommitCount >= 1) {
        classification = 'ACTIVE_DEVELOPMENT';
        confidence = 0.88;
      }

      classificationCounts[classification]++;

      evaluated.push({
        file: stats.file,
        classification,
        confidence,
        totalCommits: stats.commitCount,
        recentCommits: stats.recentCommitCount,
        uniqueAuthors: stats.authors.size
      });
    }

    // Sort by most volatile first
    evaluated.sort((a, b) => b.totalCommits - a.totalCommits);

    return {
      summary: {
        totalEvaluated: evaluated.length,
        counts: classificationCounts,
        volatilePercentage: evaluated.length > 0
          ? Math.round((classificationCounts.VOLATILE_CHURN / evaluated.length) * 100)
          : 0
      },
      modules: evaluated.slice(0, 50)
    };
  }
}
