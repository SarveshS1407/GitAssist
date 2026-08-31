import fs from 'node:fs/promises';
import path from 'node:path';
import { LanguageDetector } from './language-detector.js';

export const DEFAULT_IGNORE_PATTERNS = [
  '.git',
  'node_modules',
  'dist',
  'build',
  'out',
  '.next',
  '.nuxt',
  'coverage',
  '.cache',
  '.vscode',
  '.idea',
  'vendor',
  'target',
  'bin',
  'obj',
  '__pycache__',
  '.pytest_cache',
  '.DS_Store',
  'Thumbs.db'
];

export class RepositoryScanner {
  constructor(options = {}) {
    this.ignorePatterns = new Set([...DEFAULT_IGNORE_PATTERNS, ...(options.customIgnores || [])]);
    this.maxFileSize = options.maxFileSize || 2 * 1024 * 1024; // 2MB max for indexing content
  }

  shouldIgnore(name) {
    return this.ignorePatterns.has(name) || name.startsWith('.git');
  }

  async isGitRepository(repoPath) {
    try {
      const gitDir = path.join(repoPath, '.git');
      const stat = await fs.stat(gitDir);
      return stat.isDirectory() || stat.isFile(); // submodule or worktree may have .git as file
    } catch {
      return false;
    }
  }

  async scan(repoPath, onProgress) {
    const rootPath = path.resolve(repoPath);
    const isValidGit = await this.isGitRepository(rootPath);

    const files = [];
    const directories = [];
    const languageStats = {};
    let totalSizeBytes = 0;
    let totalLines = 0;

    const traverse = async (currentDir, relativeDir = '') => {
      let entries;
      try {
        entries = await fs.readdir(currentDir, { withFileTypes: true });
      } catch (err) {
        console.warn(`[Scanner] Cannot read directory ${currentDir}:`, err.message);
        return;
      }

      for (const entry of entries) {
        if (this.shouldIgnore(entry.name)) {
          continue;
        }

        const fullPath = path.join(currentDir, entry.name);
        const relPath = path.join(relativeDir, entry.name);

        if (entry.isDirectory()) {
          directories.push({
            name: entry.name,
            path: fullPath,
            relativePath: relPath
          });
          await traverse(fullPath, relPath);
        } else if (entry.isFile()) {
          try {
            const stat = await fs.stat(fullPath);
            const language = LanguageDetector.detect(entry.name);
            const ext = path.extname(entry.name).toLowerCase();

            let lineCount = 0;
            let isBinary = false;
            let content = null;

            if (stat.size <= this.maxFileSize) {
              try {
                const buffer = await fs.readFile(fullPath);
                // Check for binary characters (null bytes)
                isBinary = buffer.includes(0);
                if (!isBinary) {
                  content = buffer.toString('utf-8');
                  lineCount = content.split('\n').length;
                }
              } catch {
                isBinary = true;
              }
            }

            totalSizeBytes += stat.size;
            totalLines += lineCount;

            if (!languageStats[language]) {
              languageStats[language] = { files: 0, lines: 0, sizeBytes: 0 };
            }
            languageStats[language].files += 1;
            languageStats[language].lines += lineCount;
            languageStats[language].sizeBytes += stat.size;

            files.push({
              name: entry.name,
              path: fullPath,
              relativePath: relPath,
              extension: ext,
              language,
              sizeBytes: stat.size,
              lineCount,
              isBinary,
              content: content,
              lastModified: stat.mtime.toISOString()
            });

            if (onProgress && files.length % 50 === 0) {
              onProgress({ scannedFiles: files.length, currentFile: relPath });
            }
          } catch (fileErr) {
            console.warn(`[Scanner] Error reading file ${fullPath}:`, fileErr.message);
          }
        }
      }
    };

    await traverse(rootPath);

    // Calculate percentage breakdown
    const languages = {};
    for (const [lang, stats] of Object.entries(languageStats)) {
      languages[lang] = {
        files: stats.files,
        lines: stats.lines,
        sizeBytes: stats.sizeBytes,
        percentage: totalLines > 0 ? Number(((stats.lines / totalLines) * 100).toFixed(1)) : 0
      };
    }

    return {
      path: rootPath,
      name: path.basename(rootPath),
      isValidGit,
      totalFiles: files.length,
      totalDirectories: directories.length,
      totalLines,
      totalSizeBytes,
      languages,
      files,
      directories
    };
  }
}
