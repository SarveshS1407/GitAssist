import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { RepositoryScanner } from '../core/scanner.js';
import { CodeParser } from '../core/parser.js';
import { DependencyAnalyzer } from '../core/dependency-graph.js';
import { CircularDependencyDetector } from '../core/circular-detector.js';
import { CodeMetrics } from '../core/metrics.js';
import { HotspotAnalyzer } from '../core/hotspot-analyzer.js';
import { SearchIndex } from '../core/search-index.js';
import { GitService } from './git-service.js';

const execFileAsync = promisify(execFile);

/**
 * RepositoryService
 * Coordinates validation, file ingestion, AST symbol parsing, code metrics, and Git integration
 */
export class RepositoryService {
  /**
   * Resolves a local path or auto-clones a remote Git URL into temporary workspace
   * @param {string} targetPath 
   * @returns {Promise<string>} Local filesystem path
   */
  static async resolveLocalOrRemotePath(targetPath) {
    if (!targetPath || typeof targetPath !== 'string') return targetPath;
    const trimmed = targetPath.trim();

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('git@')) {
      const parts = trimmed.replace(/\.git$/, '').split('/');
      const repoName = parts[parts.length - 1] || 'remote-repo';
      const cacheDir = path.join('/tmp', 'codebase-archaeologist-repos', repoName);

      try {
        await fs.mkdir(path.dirname(cacheDir), { recursive: true });
        const exists = await fs.stat(cacheDir).then(() => true).catch(() => false);
        if (!exists) {
          await execFileAsync('git', ['clone', '--depth', '50', trimmed, cacheDir], { timeout: 30000 });
        }
        return cacheDir;
      } catch (err) {
        throw new Error(`Failed to clone remote repository "${trimmed}": ${err.message}`);
      }
    }

    return path.resolve(trimmed);
  }

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

    let resolvedPath;
    try {
      resolvedPath = await this.resolveLocalOrRemotePath(targetPath);
    } catch (err) {
      return {
        valid: false,
        error: err.message,
        path: targetPath,
        name: path.basename(targetPath),
        isGitRepository: false
      };
    }

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
   * Opens and ingests a repository, running full AST analysis, metrics, and Git inspection
   * @param {string} targetPath Target repository root path
   * @returns {Promise<Object>} Ingestion summary and analysis payloads
   */
  static async openRepository(targetPath) {
    const validation = await this.validateRepository(targetPath);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid repository path');
    }

    const repoPath = validation.path;
    const scanner = new RepositoryScanner();
    const scanResult = await scanner.scan(repoPath);
    const files = scanResult.files || [];

    const parsedFiles = [];
    let totalLines = 0;
    let totalMaintainability = 0;

    for (const file of files) {
      const parsed = CodeParser.parseFile(file);
      const metrics = CodeMetrics.calculateFileMetrics(file.content || '');
      parsedFiles.push({
        ...file,
        ...parsed,
        metrics
      });
      totalLines += (metrics.loc || file.lineCount || 0);
      totalMaintainability += metrics.maintainabilityIndex;
    }

    const avgMaintainability = parsedFiles.length > 0 
      ? Math.round(totalMaintainability / parsedFiles.length) 
      : 100;

    const dependencyGraph = DependencyAnalyzer.buildGraph(parsedFiles);
    const cycles = CircularDependencyDetector.detectCycles(dependencyGraph.edges);

    let commits = [];
    let contributors = [];
    if (validation.isGitRepository) {
      try {
        const gitService = new GitService(repoPath);
        commits = await gitService.getCommits(50);
        contributors = await gitService.getContributors();
      } catch (gitErr) {
        console.warn('[RepositoryService] Git metadata extraction warning:', gitErr.message);
      }
    }

    const hotspots = HotspotAnalyzer.analyzeHotspots(parsedFiles, commits);
    const searchIndex = new SearchIndex(parsedFiles);

    return {
      success: true,
      summary: {
        path: repoPath,
        name: validation.name,
        isValidGit: validation.isGitRepository,
        branch: validation.branch,
        totalFiles: files.length,
        totalLines: totalLines || scanResult.totalLines || 0,
        avgMaintainability,
        cyclesDetected: cycles.length,
        hotspotsCount: hotspots.length
      },
      files: parsedFiles,
      dependencyGraph,
      cycles,
      hotspots,
      searchIndex,
      commits,
      contributors
    };
  }
}
