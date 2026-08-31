import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * Read-Only Git History & Archeology Analyzer
 * Strictly executes read-only inspection commands (log, status, rev-parse, diff, blame).
 */
export class GitAnalyzer {
  constructor(repoPath) {
    this.repoPath = repoPath;
  }

  async runGit(args) {
    try {
      const { stdout } = await execFileAsync('git', args, {
        cwd: this.repoPath,
        maxBuffer: 10 * 1024 * 1024
      });
      return stdout.trim();
    } catch (err) {
      console.warn(`[GitAnalyzer] git ${args.join(' ')} failed:`, err.message);
      return '';
    }
  }

  async isGitRepo() {
    const output = await this.runGit(['rev-parse', '--is-inside-work-tree']);
    return output === 'true';
  }

  async getCurrentBranch() {
    const branch = await this.runGit(['branch', '--show-current']);
    if (branch) return branch;
    // Fallback if detached HEAD
    return (await this.runGit(['rev-parse', '--short', 'HEAD'])) || 'HEAD';
  }

  async getHeadCommit() {
    return await this.runGit(['rev-parse', 'HEAD']);
  }

  async getWorkingTreeStatus() {
    const rawStatus = await this.runGit(['status', '--porcelain']);
    if (!rawStatus) {
      return { clean: true, modified: [], added: [], deleted: [], untracked: [] };
    }

    const modified = [];
    const added = [];
    const deleted = [];
    const untracked = [];

    const lines = rawStatus.split('\n');
    for (const line of lines) {
      if (!line) continue;
      const code = line.substring(0, 2);
      const file = line.substring(3).trim();

      if (code.includes('M')) modified.push(file);
      else if (code.includes('A')) added.push(file);
      else if (code.includes('D')) deleted.push(file);
      else if (code.includes('?')) untracked.push(file);
      else modified.push(file);
    }

    return {
      clean: modified.length === 0 && added.length === 0 && deleted.length === 0 && untracked.length === 0,
      modified,
      added,
      deleted,
      untracked
    };
  }

  async getCommitHistory(limit = 100) {
    // Delimited format: hash|shortHash|author|email|date|timestamp|subject
    const format = '%H%x1f%h%x1f%an%x1f%ae%x1f%ad%x1f%at%x1f%s';
    const rawLog = await this.runGit(['log', `-n${limit}`, `--pretty=format:${format}`, '--numstat', '--date=iso']);

    if (!rawLog) return [];

    const commits = [];
    const rawCommits = rawLog.split('\n\n');

    for (const raw of rawCommits) {
      const lines = raw.trim().split('\n');
      if (lines.length === 0 || !lines[0]) continue;

      const header = lines[0].split('\x1f');
      if (header.length < 7) continue;

      const [hash, shortHash, authorName, authorEmail, date, timestamp, message] = header;

      const changedFiles = [];
      let insertions = 0;
      let deletions = 0;

      for (let i = 1; i < lines.length; i++) {
        const statLine = lines[i].trim();
        if (!statLine) continue;
        const [ins, del, file] = statLine.split(/\s+/);
        if (file) {
          const insNum = ins === '-' ? 0 : parseInt(ins, 10) || 0;
          const delNum = del === '-' ? 0 : parseInt(del, 10) || 0;
          insertions += insNum;
          deletions += delNum;
          changedFiles.push({
            file,
            status: insNum > 0 && delNum === 0 ? 'added' : delNum > 0 && insNum === 0 ? 'deleted' : 'modified',
            insertions: insNum,
            deletions: delNum
          });
        }
      }

      commits.push({
        hash,
        shortHash,
        authorName,
        authorEmail,
        date,
        timestamp: parseInt(timestamp, 10) * 1000,
        message,
        filesChanged: changedFiles.length,
        insertions,
        deletions,
        changedFiles
      });
    }

    return commits;
  }

  async getContributors(commits) {
    const contributorMap = new Map();

    for (const commit of commits) {
      const key = commit.authorEmail || commit.authorName;
      if (!contributorMap.has(key)) {
        contributorMap.set(key, {
          name: commit.authorName,
          email: commit.authorEmail,
          commitCount: 0,
          linesAdded: 0,
          linesDeleted: 0,
          firstCommitDate: commit.date,
          lastCommitDate: commit.date,
          fileTouchCounts: {},
          topFiles: [],
          ownershipScore: 0
        });
      }

      const contrib = contributorMap.get(key);
      contrib.commitCount += 1;
      contrib.linesAdded += commit.insertions;
      contrib.linesDeleted += commit.deletions;
      contrib.lastCommitDate = commit.date;

      for (const cf of commit.changedFiles) {
        contrib.fileTouchCounts[cf.file] = (contrib.fileTouchCounts[cf.file] || 0) + 1;
      }
    }

    const contributors = Array.from(contributorMap.values()).map(c => {
      const sortedFiles = Object.entries(c.fileTouchCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([f]) => f);

      return {
        ...c,
        topFiles: sortedFiles,
        ownershipScore: c.commitCount * 10 + c.linesAdded
      };
    });

    return contributors.sort((a, b) => b.commitCount - a.commitCount);
  }

  async getFileBlameSummary(relativeFilePath) {
    const raw = await this.runGit(['log', '-n5', '--pretty=format:%h|%an|%ad|%s', '--date=short', '--', relativeFilePath]);
    if (!raw) return null;

    const lines = raw.split('\n');
    const recentCommits = lines.map(line => {
      const [hash, author, date, message] = line.split('|');
      return { hash, author, date, message };
    });

    return {
      commitCount: recentCommits.length,
      lastCommit: recentCommits[0] || null,
      history: recentCommits
    };
  }
}
