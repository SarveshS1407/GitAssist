import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';
import { RepositoryScanner } from './core/scanner.js';
import { CodeParser } from './core/parser.js';
import { GitAnalyzer } from './core/git-analyzer.js';
import { DependencyAnalyzer } from './core/dependency-graph.js';
import { SearchIndex } from './core/search-index.js';

const PORT = process.env.PORT || 3333;
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

// In-memory cache for the currently active repository
let activeRepoState = {
  summary: null,
  files: [],
  commits: [],
  contributors: [],
  dependencyGraph: { nodes: [], edges: [], modules: [] },
  searchIndex: new SearchIndex([])
};

async function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  try {
    // 1. Ingest / Scan Repository
    if (req.method === 'POST' && pathname === '/api/scan') {
      const { repoPath } = await parseRequestBody(req);
      const targetPath = repoPath ? path.resolve(repoPath) : ROOT_DIR;

      console.log(`[Server] Scanning repository at: ${targetPath}`);

      const scanner = new RepositoryScanner();
      const scanResult = await scanner.scan(targetPath);

      // Parse code symbols, imports, and exports for each file
      for (const file of scanResult.files) {
        const parsed = CodeParser.parseFile(file);
        file.symbols = parsed.symbols;
        file.imports = parsed.imports;
        file.exports = parsed.exports;
      }

      // Build dependency graph
      const dependencyGraph = DependencyAnalyzer.buildGraph(scanResult.files);

      // Git Archaeology Analysis
      const gitAnalyzer = new GitAnalyzer(targetPath);
      let branch = 'unknown';
      let headCommit = '';
      let workingTreeStatus = { clean: true, modified: [], added: [], deleted: [], untracked: [] };
      let commits = [];
      let contributors = [];

      if (scanResult.isValidGit) {
        branch = await gitAnalyzer.getCurrentBranch();
        headCommit = await gitAnalyzer.getHeadCommit();
        workingTreeStatus = await gitAnalyzer.getWorkingTreeStatus();
        commits = await gitAnalyzer.getCommitHistory(100);
        contributors = await gitAnalyzer.getContributors(commits);
      }

      const summary = {
        path: scanResult.path,
        name: scanResult.name,
        isValidGit: scanResult.isValidGit,
        branch,
        headCommit,
        totalFiles: scanResult.totalFiles,
        totalDirectories: scanResult.totalDirectories,
        totalLines: scanResult.totalLines,
        totalSizeBytes: scanResult.totalSizeBytes,
        languages: scanResult.languages,
        workingTreeStatus
      };

      // Search index
      const searchIndex = new SearchIndex(scanResult.files);

      // Store in memory
      activeRepoState = {
        summary,
        files: scanResult.files,
        commits,
        contributors,
        dependencyGraph,
        searchIndex
      };

      sendJson(res, 200, {
        success: true,
        summary,
        filesCount: scanResult.files.length,
        commitsCount: commits.length,
        contributorsCount: contributors.length,
        modulesCount: dependencyGraph.modules.length,
        dependencyGraph,
        contributors,
        commits: commits.slice(0, 50),
        files: scanResult.files.map(f => ({
          name: f.name,
          relativePath: f.relativePath,
          language: f.language,
          lineCount: f.lineCount,
          sizeBytes: f.sizeBytes,
          symbolsCount: f.symbols.length,
          importsCount: f.imports.length,
          exportsCount: f.exports.length
        }))
      });
      return;
    }

    // 2. Search API
    if (req.method === 'GET' && pathname === '/api/search') {
      const q = parsedUrl.searchParams.get('q') || '';
      const type = parsedUrl.searchParams.get('type') || 'all';
      const language = parsedUrl.searchParams.get('language') || null;

      const results = activeRepoState.searchIndex.search({ query: q, type, language });
      sendJson(res, 200, { query: q, results });
      return;
    }

    // 3. File Detail API
    if (req.method === 'GET' && pathname === '/api/file') {
      const relPath = parsedUrl.searchParams.get('path');
      const file = activeRepoState.files.find(f => f.relativePath === relPath);

      if (!file) {
        sendJson(res, 404, { error: 'File not found in active repository' });
        return;
      }

      sendJson(res, 200, file);
      return;
    }

    // 4. Status API
    if (req.method === 'GET' && pathname === '/api/status') {
      sendJson(res, 200, {
        status: 'online',
        activeRepo: activeRepoState.summary ? activeRepoState.summary.name : null,
        totalFiles: activeRepoState.files.length
      });
      return;
    }

    // 5. Serve HTML Dashboard
    if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
      const htmlPath = path.join(ROOT_DIR, 'index.html');
      try {
        const html = await fs.readFile(htmlPath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
      } catch (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('index.html not found. Please ensure it is present in project root.');
        return;
      }
    }

    sendJson(res, 404, { error: 'Not Found' });
  } catch (err) {
    console.error('[Server Error]', err);
    sendJson(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  🏛️ Codebase Archaeologist Server Running`);
  console.log(`  🔗 Local UI: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
