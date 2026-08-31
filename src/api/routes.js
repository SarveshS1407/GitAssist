import path from 'node:path';
import fs from 'node:fs/promises';
import { RepositoryScanner } from '../core/scanner.js';
import { CodeParser } from '../core/parser.js';
import { GitAnalyzer } from '../core/git-analyzer.js';
import { DependencyAnalyzer } from '../core/dependency-graph.js';
import { SearchIndex } from '../core/search-index.js';
import { CircularDependencyDetector } from '../core/circular-detector.js';
import { CodeMetrics } from '../core/metrics.js';
import { HotspotAnalyzer } from '../core/hotspot-analyzer.js';
import { MermaidGenerator } from '../core/mermaid-generator.js';
import { AIContextPackager } from '../ai/context-packager.js';
import { LocalQueryEngine } from '../ai/query-engine.js';

export class ApiRouter {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.activeRepoState = {
      summary: null,
      files: [],
      commits: [],
      contributors: [],
      dependencyGraph: { nodes: [], edges: [], modules: [] },
      searchIndex: new SearchIndex([])
    };
    this.contextPackager = new AIContextPackager();
  }

  async handleRequest(req, res, parsedUrl) {
    const pathname = parsedUrl.pathname;

    // 1. Ingest / Scan
    if (req.method === 'POST' && pathname === '/api/scan') {
      return this.handleScan(req, res);
    }

    // 2. Status
    if (req.method === 'GET' && pathname === '/api/status') {
      return this.sendJson(res, 200, {
        status: 'online',
        activeRepo: this.activeRepoState.summary ? this.activeRepoState.summary.name : null,
        totalFiles: this.activeRepoState.files.length,
        version: '0.1.0'
      });
    }

    // 3. Search
    if (req.method === 'GET' && pathname === '/api/search') {
      const q = parsedUrl.searchParams.get('q') || '';
      const type = parsedUrl.searchParams.get('type') || 'all';
      const language = parsedUrl.searchParams.get('language') || null;

      const results = this.activeRepoState.searchIndex.search({ query: q, type, language });
      return this.sendJson(res, 200, { query: q, results });
    }

    // 4. File Detail
    if (req.method === 'GET' && pathname === '/api/file') {
      const relPath = parsedUrl.searchParams.get('path');
      const file = this.activeRepoState.files.find(f => f.relativePath === relPath);

      if (!file) {
        return this.sendJson(res, 404, { error: 'File not found in active repository' });
      }
      return this.sendJson(res, 200, file);
    }

    // 5. Export Report
    if (req.method === 'GET' && pathname === '/api/export') {
      const format = parsedUrl.searchParams.get('format') || 'json';
      return this.handleExport(res, format);
    }

    // 6. Code Metrics
    if (req.method === 'GET' && pathname === '/api/metrics') {
      const totalLoc = this.activeRepoState.files.reduce((acc, f) => acc + (f.metrics?.loc || f.lineCount || 0), 0);
      const totalSloc = this.activeRepoState.files.reduce((acc, f) => acc + (f.metrics?.sloc || 0), 0);
      const avgMaintainability = this.activeRepoState.files.length > 0
        ? Math.round(this.activeRepoState.files.reduce((acc, f) => acc + (f.metrics?.maintainabilityIndex || 100), 0) / this.activeRepoState.files.length)
        : 100;
      const fileMetrics = this.activeRepoState.files.map(f => ({
        relativePath: f.relativePath,
        language: f.language,
        metrics: f.metrics
      }));
      return this.sendJson(res, 200, {
        totalLoc,
        totalSloc,
        avgMaintainability,
        files: fileMetrics
      });
    }

    // 7. Hotspot & Churn Analysis
    if (req.method === 'GET' && pathname === '/api/hotspots') {
      return this.sendJson(res, 200, {
        hotspots: this.activeRepoState.hotspots || []
      });
    }

    // 8. Circular Dependency Detection
    if (req.method === 'GET' && pathname === '/api/cycles') {
      return this.sendJson(res, 200, {
        cycles: this.activeRepoState.cycles || []
      });
    }

    // 9. Architecture & Class Mermaid Diagrams
    if (req.method === 'GET' && pathname === '/api/diagram') {
      const type = parsedUrl.searchParams.get('type') || 'module';
      const diagram = type === 'class'
        ? MermaidGenerator.generateClassDiagram(this.activeRepoState.files)
        : MermaidGenerator.generateModuleFlowchart(this.activeRepoState.dependencyGraph);
      return this.sendJson(res, 200, { type, diagram });
    }

    // 10. AI Query
    if (req.method === 'POST' && pathname === '/api/ai/query') {
      const body = await this.parseRequestBody(req);
      const engine = new LocalQueryEngine(this.activeRepoState);
      const response = engine.evaluateQuery(body.query);
      return this.sendJson(res, 200, response);
    }

    // 11. AI Context Package
    if (req.method === 'GET' && pathname === '/api/ai/context') {
      const targetFile = parsedUrl.searchParams.get('file');
      if (targetFile) {
        const pkg = this.contextPackager.packageFileBlastRadius(targetFile, this.activeRepoState);
        return this.sendJson(res, 200, pkg);
      }
      const pkg = this.contextPackager.packageArchitectureContext(this.activeRepoState);
      return this.sendJson(res, 200, pkg);
    }

    // 12. Serve UI Dashboard and Static Assets
    if (req.method === 'GET' && (pathname.startsWith('/src/ui/') || pathname.startsWith('/ui/') || pathname === '/' || pathname === '/index.html')) {
      const targetRelPath = pathname === '/' || pathname === '/index.html'
        ? 'index.html'
        : pathname.startsWith('/ui/')
          ? pathname.replace(/^\/ui\//, 'src/ui/')
          : pathname.replace(/^\//, '');

      const safePath = path.resolve(this.rootDir, targetRelPath);
      if (!safePath.startsWith(this.rootDir)) {
        return this.sendJson(res, 403, { error: 'Forbidden' });
      }

      try {
        const ext = path.extname(safePath).toLowerCase();
        const content = await fs.readFile(safePath);
        const mimeTypes = {
          '.html': 'text/html; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.json': 'application/json',
          '.svg': 'image/svg+xml',
          '.png': 'image/png'
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
        res.end(content);
        return;
      } catch (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Asset not found.');
        return;
      }
    }

    return this.sendJson(res, 404, { error: 'Not Found' });
  }

  async handleScan(req, res) {
    const { repoPath } = await this.parseRequestBody(req);
    const targetPath = repoPath ? path.resolve(repoPath) : this.rootDir;

    console.log(`[Server] Scanning repository at: ${targetPath}`);

    const scanner = new RepositoryScanner();
    const scanResult = await scanner.scan(targetPath);

    for (const file of scanResult.files) {
      const parsed = CodeParser.parseFile(file);
      file.symbols = parsed.symbols;
      file.imports = parsed.imports;
      file.exports = parsed.exports;
      file.metrics = CodeMetrics.calculateFileMetrics(file.content, file.language);
    }

    const dependencyGraph = DependencyAnalyzer.buildGraph(scanResult.files);
    const cycles = CircularDependencyDetector.detectCycles(dependencyGraph.edges);
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

    const hotspots = HotspotAnalyzer.analyzeHotspots(scanResult.files, commits);

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

    const searchIndex = new SearchIndex(scanResult.files);

    this.activeRepoState = {
      summary,
      files: scanResult.files,
      commits,
      contributors,
      dependencyGraph,
      searchIndex,
      cycles,
      hotspots
    };

    return this.sendJson(res, 200, {
      success: true,
      summary,
      filesCount: scanResult.files.length,
      commitsCount: commits.length,
      contributorsCount: contributors.length,
      modulesCount: dependencyGraph.modules.length,
      dependencyGraph,
      cyclesCount: cycles.length,
      cycles,
      hotspots: hotspots.slice(0, 10),
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
        exportsCount: f.exports.length,
        metrics: f.metrics
      }))
    });
  }

  handleExport(res, format) {
    const { summary, files, contributors, dependencyGraph } = this.activeRepoState;
    if (!summary) {
      return this.sendJson(res, 400, { error: 'No repository is currently scanned to export' });
    }

    if (format === 'markdown') {
      const langRows = Object.entries(summary.languages || {})
        .map(([l, s]) => `| ${l} | ${s.percentage}% | ${s.lines.toLocaleString()} | ${s.files} |`)
        .join('\n');

      const topContrib = contributors.slice(0, 5)
        .map(c => `- **${c.name}**: ${c.commitCount} commits (${c.email})`)
        .join('\n');

      const markdown = `# Architecture Summary: ${summary.name}

> Generated by GitAssist on ${new Date().toISOString()}

## Repository Overview
- **Branch**: \`${summary.branch}\`
- **Total Files**: ${summary.totalFiles}
- **Total LOC**: ${summary.totalLines.toLocaleString()} lines
- **Total Size**: ${(summary.totalSizeBytes / 1024).toFixed(1)} KB

## Language Breakdown
| Language | % Share | Lines | Files |
| :--- | :--- | :--- | :--- |
${langRows}

## Top Contributors
${topContrib || 'None identified'}

## Module Architecture
- **Identified Modules**: ${dependencyGraph.modules.map(m => `\`${m.name}\``).join(', ') || 'None'}
- **Total Dependency Edges**: ${dependencyGraph.edges.length}
`;
      res.writeHead(200, {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${summary.name}-report.md"`
      });
      res.end(markdown);
      return;
    }

    return this.sendJson(res, 200, {
      summary,
      filesCount: files.length,
      contributors,
      dependencyGraph
    });
  }

  async parseRequestBody(req) {
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

  sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
  }
}
