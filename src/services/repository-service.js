import fs from 'node:fs/promises';
import path from 'node:path';
import { RepositoryScanner } from '../core/scanner.js';
import { CodeParser } from '../core/parser.js';
import { DependencyAnalyzer } from '../core/dependency-graph.js';
import { CircularDependencyDetector } from '../core/circular-detector.js';
import { CodeMetrics } from '../core/metrics.js';
import { HotspotAnalyzer } from '../core/hotspot-analyzer.js';
import { SearchIndex } from '../core/search-index.js';
import { GitService } from './git-service.js';

/**
 * RepositoryService
 * Coordinates validation, file ingestion, AST symbol parsing, code metrics, and Git integration
 */
export class RepositoryService {
  /**
   * Validates a target filesystem path for accessibility and Git tracking
   * @param {string} targetPath Absolute or relative path to inspect
   * @returns {Promise<Object>} Validation result
   */
  static async validateRepository(targetPath) {
    if (!targetPath || typeof targetPath !== 'string') {
      return {
        valid: false,
        error: 'A valid filesystem path must be provided.',
        path: null,
        name: null,
        isGitRepository: false
      };
    }

    const resolvedPath = path.resolve(targetPath);

    try {
      const stats = await fs.stat(resolvedPath);
      if (!stats.isDirectory()) {
        return {
          valid: false,
          error: `Path "${resolvedPath}" is a file, not a directory.`,
          path: resolvedPath,
          name: path.basename(resolvedPath),
          isGitRepository: false
        };
      }

      // Check read permission
      await fs.access(resolvedPath, fs.constants.R_OK);

      // Check for .git directory
      let isGitRepository = false;
      let branch = 'unknown';
      try {
        const gitDir = path.join(resolvedPath, '.git');
        const gitStats = await fs.stat(gitDir);
        if (gitStats.isDirectory()) {
          isGitRepository = true;
          const gitService = new GitService(resolvedPath);
          branch = await gitService.getCurrentBranch();
        }
      } catch {
        isGitRepository = false;
      }

      return {
        valid: true,
        path: resolvedPath,
        name: path.basename(resolvedPath),
        isGitRepository,
        branch
      };
    } catch (err) {
      if (err.code === 'ENOENT') {
        return {
          valid: false,
          error: `Directory does not exist: ${resolvedPath}`,
          path: resolvedPath,
          name: path.basename(resolvedPath),
          isGitRepository: false
        };
      } else if (err.code === 'EACCES') {
        return {
          valid: false,
          error: `Permission denied accessing directory: ${resolvedPath}`,
          path: resolvedPath,
          name: path.basename(resolvedPath),
          isGitRepository: false
        };
      }
      return {
        valid: false,
        error: `Failed to inspect directory: ${err.message}`,
        path: resolvedPath,
        name: path.basename(resolvedPath),
        isGitRepository: false
      };
    }
  }

  /**
   * Opens and indexes a validated repository
   * @param {string} targetPath Absolute path to repository
   * @returns {Promise<Object>} Indexed repository state
   */
  static async openRepository(targetPath) {
    const validation = await this.validateRepository(targetPath);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid repository path');
    }

    const resolvedPath = validation.path;
    const scanner = new RepositoryScanner();
    const scanResult = await scanner.scan(resolvedPath);

    for (const file of scanResult.files) {
      const parsed = CodeParser.parseFile(file);
      file.symbols = parsed.symbols;
      file.imports = parsed.imports;
      file.exports = parsed.exports;
      file.metrics = CodeMetrics.calculateFileMetrics(file.content, file.language);
    }

    const dependencyGraph = DependencyAnalyzer.buildGraph(scanResult.files);
    const cycles = CircularDependencyDetector.detectCycles(dependencyGraph.edges);

    const gitService = new GitService(resolvedPath);
    let commits = [];
    let contributors = [];
    let workingTreeStatus = { clean: true, modified: [], added: [], deleted: [], untracked: [] };

    if (scanResult.isValidGit) {
      commits = await gitService.getCommits(100);
      contributors = await gitService.getContributors(commits);
      workingTreeStatus = await gitService.getWorkingTreeStatus();
    }

    const hotspots = HotspotAnalyzer.analyzeHotspots(scanResult.files, commits);
    const searchIndex = new SearchIndex(scanResult.files);

    const summary = {
      path: scanResult.path,
      name: scanResult.name,
      isValidGit: scanResult.isValidGit,
      branch: validation.branch || 'main',
      totalFiles: scanResult.totalFiles,
      totalDirectories: scanResult.totalDirectories,
      totalLines: scanResult.totalLines,
      totalSizeBytes: scanResult.totalSizeBytes,
      languages: scanResult.languages,
      workingTreeStatus,
      avgMaintainability: scanResult.files.length > 0
        ? Math.round(scanResult.files.reduce((acc, f) => acc + (f.metrics?.maintainabilityIndex || 100), 0) / scanResult.files.length)
        : 100
    };

    return {
      summary,
      files: scanResult.files,
      commits,
      contributors,
      dependencyGraph,
      searchIndex,
      cycles,
      hotspots
    };
  }
}
