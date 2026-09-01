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
}
