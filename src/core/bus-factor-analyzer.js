import path from 'node:path';

/**
 * BusFactorAnalyzer
 * Analyzes developer contribution distribution across directories and files
 * to calculate project Bus Factor and identify dangerous knowledge silos.
 */
export class BusFactorAnalyzer {
  /**
   * @param {Object} [options]
   * @param {number} [options.siloThreshold=0.80] Fraction of edits that constitutes an ownership silo
   */
  constructor(options = {}) {
    this.siloThreshold = options.siloThreshold || 0.80;
  }

  /**
   * Analyze commits to calculate bus factor and knowledge silos
   * @param {Array<{ author: string, files?: string[], message?: string }>} commits
   * @param {Array<{ relativePath: string }>} files
   * @returns {{ overallBusFactor: number, riskLevel: string, totalAuthors: number, silos: Array, directoryBreakdown: Array }}
   */
  analyze(commits = [], files = []) {
    if (!commits || commits.length === 0) {
      return {
        overallBusFactor: 1,
        riskLevel: 'HIGH',
        totalAuthors: 0,
        silos: [],
        directoryBreakdown: []
      };
    }

    const authorCommits = new Map();
    const fileAuthorMap = new Map();
    const dirAuthorMap = new Map();

    for (const c of commits) {
      const author = c.author || 'Unknown';
      authorCommits.set(author, (authorCommits.get(author) || 0) + 1);

      const modifiedFiles = c.files || [];
      for (const f of modifiedFiles) {
        // Track file
        if (!fileAuthorMap.has(f)) {
          fileAuthorMap.set(f, new Map());
        }
        const fMap = fileAuthorMap.get(f);
        fMap.set(author, (fMap.get(author) || 0) + 1);

        // Track top-level or second-level directory
        const dir = path.dirname(f).split(path.sep).slice(0, 2).join('/');
        const cleanDir = (dir === '.' || dir === '') ? 'root' : dir;

        if (!dirAuthorMap.has(cleanDir)) {
          dirAuthorMap.set(cleanDir, new Map());
        }
        const dMap = dirAuthorMap.get(cleanDir);
        dMap.set(author, (dMap.get(author) || 0) + 1);
      }
    }

    const totalAuthors = authorCommits.size;

    // Calculate directory ownership & identify knowledge silos
    const directoryBreakdown = [];
    const silos = [];

    for (const [dir, authors] of dirAuthorMap.entries()) {
      let totalDirEdits = 0;
      let topAuthor = null;
      let topCount = 0;

      for (const [author, count] of authors.entries()) {
        totalDirEdits += count;
        if (count > topCount) {
          topCount = count;
          topAuthor = author;
        }
      }

      const ownershipRatio = totalDirEdits > 0 ? (topCount / totalDirEdits) : 0;
      const isSilo = ownershipRatio >= this.siloThreshold && totalDirEdits >= 2;

      const breakdown = {
        directory: dir,
        totalEdits: totalDirEdits,
        dominantAuthor: topAuthor,
        ownershipPercentage: Math.round(ownershipRatio * 100),
        authorCount: authors.size,
        isSilo
      };

      directoryBreakdown.push(breakdown);

      if (isSilo) {
        silos.push({
          module: dir,
          soleMaintainer: topAuthor,
          ownershipPercentage: Math.round(ownershipRatio * 100),
          edits: topCount,
          risk: ownershipRatio > 0.95 ? 'CRITICAL' : 'HIGH'
        });
      }
    }

    // Heuristic repository bus factor calculation
    // Sorted authors by total commit volume
    const sortedAuthors = Array.from(authorCommits.entries())
      .sort((a, b) => b[1] - a[1]);

    const totalCommits = commits.length;
    let accumulated = 0;
    let busFactor = 0;

    for (const [_, count] of sortedAuthors) {
      accumulated += count;
      busFactor++;
      if (accumulated >= totalCommits * 0.5) {
        break;
      }
    }

    busFactor = Math.max(1, busFactor);

    let riskLevel = 'LOW';
    if (busFactor === 1 && totalAuthors <= 2) riskLevel = 'CRITICAL';
    else if (busFactor <= 2) riskLevel = 'HIGH';
    else if (busFactor <= 3) riskLevel = 'MEDIUM';

    return {
      overallBusFactor: busFactor,
      riskLevel,
      totalAuthors,
      siloCount: silos.length,
      silos: silos.sort((a, b) => b.ownershipPercentage - a.ownershipPercentage),
      directoryBreakdown: directoryBreakdown.sort((a, b) => b.totalEdits - a.totalEdits)
    };
  }
}
