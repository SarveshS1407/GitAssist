import { GitAnalyzer } from '../core/git-analyzer.js';

/**
 * GitService
 * Dedicated, strictly READ-ONLY service for querying Git repository history and status
 */
export class GitService {
  constructor(repoPath) {
    this.repoPath = repoPath;
    this.analyzer = new GitAnalyzer(repoPath);
  }

  /**
   * Retrieves current active branch name
   * @returns {Promise<string>}
   */
  async getCurrentBranch() {
    try {
      return await this.analyzer.getCurrentBranch();
    } catch {
      return 'unknown';
    }
  }

  /**
   * Retrieves HEAD commit hash
   * @returns {Promise<string>}
   */
  async getHeadCommit() {
    try {
      return await this.analyzer.getHeadCommit();
    } catch {
      return '';
    }
  }

  /**
   * Retrieves commit history
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getCommits(limit = 100) {
    try {
      return await this.analyzer.getCommitHistory(limit);
    } catch {
      return [];
    }
  }

  /**
   * Retrieves contributor leaderboard
   * @param {Array} commits Optional commits list
   * @returns {Promise<Array>}
   */
  async getContributors(commits = null) {
    try {
      const commitList = commits || (await this.getCommits(100));
      return await this.analyzer.getContributors(commitList);
    } catch {
      return [];
    }
  }

  /**
   * Retrieves read-only working tree status
   * @returns {Promise<Object>}
   */
  async getWorkingTreeStatus() {
    try {
      return await this.analyzer.getWorkingTreeStatus();
    } catch {
      return { clean: true, modified: [], added: [], deleted: [], untracked: [] };
    }
  }

  /**
   * Calculates commit velocity and deployment cadence
   * @param {number} limit
   * @returns {Promise<Object>}
   */
  async getCommitVelocity(limit = 100) {
    const commits = await this.getCommits(limit);
    if (commits.length === 0) {
      return { totalCommits: 0, velocityScore: 'QUIESCENT', averageDaysBetween: 0, latestCommitDate: null };
    }

    const dates = commits
      .map(c => new Date(c.date).getTime())
      .filter(t => !isNaN(t))
      .sort((a, b) => b - a);

    let averageDaysBetween = 0;
    if (dates.length > 1) {
      const spanMs = dates[0] - dates[dates.length - 1];
      const spanDays = Math.max(1, spanMs / (1000 * 60 * 60 * 24));
      averageDaysBetween = parseFloat((spanDays / dates.length).toFixed(1));
    }

    let velocityScore = 'STEADY';
    if (averageDaysBetween <= 1) velocityScore = 'HYPERACTIVE';
    else if (averageDaysBetween <= 7) velocityScore = 'HIGH VELOCITY';
    else if (averageDaysBetween <= 30) velocityScore = 'MODERATE';
    else velocityScore = 'LOW CADENCE';

    return {
      totalCommits: commits.length,
      velocityScore,
      averageDaysBetween,
      latestCommitDate: commits[0]?.date || null,
      oldestCommitDate: commits[commits.length - 1]?.date || null
    };
  }

  /**
   * Extracts detailed author statistics and contributions distribution
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getAuthorStats(limit = 100) {
    const commits = await this.getCommits(limit);
    const authorMap = new Map();

    for (const c of commits) {
      const author = c.author || 'Unknown';
      if (!authorMap.has(author)) {
        authorMap.set(author, {
          name: author,
          commitsCount: 0,
          latestDate: c.date,
          earliestDate: c.date
        });
      }
      const entry = authorMap.get(author);
      entry.commitsCount++;
      entry.earliestDate = c.date;
    }

    const total = commits.length || 1;
    return Array.from(authorMap.values())
      .map(a => ({
        ...a,
        percentage: Math.round((a.commitsCount / total) * 100)
      }))
      .sort((a, b) => b.commitsCount - a.commitsCount);
  }
}

