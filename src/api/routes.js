import path from 'node:path';
import fs from 'node:fs/promises';
import { RepositoryService } from '../services/repository-service.js';
import { GitService } from '../services/git-service.js';
import { MermaidGenerator } from '../core/mermaid-generator.js';
import { AIContextPackager } from '../ai/context-packager.js';
import { LocalQueryEngine } from '../ai/query-engine.js';

export class ApiRouter {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.activeRepoState = {
      summary: null,
      files: [],
      directories: [],
      parsedFiles: null,
      commits: null,
      contributors: null,
      dependencyGraph: null,
      searchIndex: null,
      cycles: null,
      hotspots: null
    };
    this.contextPackager = new AIContextPackager();
  }

  async handleRequest(req, res, parsedUrl) {
    const pathname = parsedUrl.pathname;

    // 1. Repository Validation
    if (req.method === 'POST' && pathname === '/api/repository/validate') {
      const body = await this.parseRequestBody(req);
      const validation = await RepositoryService.validateRepository(body.path || this.rootDir);
      return this.sendJson(res, 200, validation);
    }

    // 2. Open / Ingest Repository (FAST FOUNDATIONAL EXCAVATION)
    if (req.method === 'POST' && (pathname === '/api/repository/open' || pathname === '/api/scan')) {
      const body = await this.parseRequestBody(req);
      const targetPath = body.path || body.repoPath || this.rootDir;

      try {
        console.log(`[Server] Fast Foundational Excavation for: ${targetPath}`);
        const result = await RepositoryService.openRepository(targetPath);
        this.activeRepoState = result;

        return this.sendJson(res, 200, {
          success: true,
          summary: result.summary,
          filesCount: result.files.length,
          directoriesCount: result.directories.length,
          files: result.files.map(f => ({
            name: f.name,
            relativePath: f.relativePath,
            language: f.language,
            lineCount: f.lineCount,
            sizeBytes: f.sizeBytes
          }))
        });
      } catch (err) {
        console.error(`[Server Error] Failed to open repository: ${err.message}`);
        return this.sendJson(res, 400, {
          success: false,
          error: err.message
        });
      }
    }

    // 3. Repository Status
    if (req.method === 'GET' && (pathname === '/api/repository/status' || pathname === '/api/status')) {
      return this.sendJson(res, 200, {
        status: 'online',
        isLoaded: !!this.activeRepoState.summary,
        activeRepo: this.activeRepoState.summary ? this.activeRepoState.summary.name : null,
        branch: this.activeRepoState.summary ? this.activeRepoState.summary.branch : null,
        totalFiles: this.activeRepoState.files.length,
        version: '0.1.0'
      });
    }

    // 4. Git Metadata (Lazy)
    if (req.method === 'GET' && pathname === '/api/repository/git') {
      const { commits, contributors } = await RepositoryService.getGitData(this.activeRepoState);
      return this.sendJson(res, 200, {
        branch: this.activeRepoState.summary ? this.activeRepoState.summary.branch : 'main',
        commits: commits || [],
        contributors: contributors || []
      });
    }

    // 4b. Git Velocity & Author Statistics
    if (req.method === 'GET' && pathname === '/api/repository/git/velocity') {
      const gitService = new GitService(this.activeRepoState.path);
      const velocity = await gitService.getCommitVelocity(100);
      const authors = await gitService.getAuthorStats(100);
      return this.sendJson(res, 200, {
        velocity,
        authors
      });
    }

    // 5. Code Search (Lazy)
    if (req.method === 'GET' && pathname === '/api/search') {
      const q = parsedUrl.searchParams.get('q') || '';
      const type = parsedUrl.searchParams.get('type') || 'all';
      const language = parsedUrl.searchParams.get('language') || null;

      if (!q.trim()) {
        return this.sendJson(res, 200, { query: q, results: [] });
      }

      const index = await RepositoryService.getSearchIndex(this.activeRepoState);
      const results = index.search({ query: q, type, language });
      return this.sendJson(res, 200, { query: q, results: results.slice(0, 50) });
    }

    // 6. File Detail
    if (req.method === 'GET' && pathname === '/api/file') {
      const relPath = parsedUrl.searchParams.get('path');
      const file = this.activeRepoState.files.find(f => f.relativePath === relPath);

      if (!file) {
        return this.sendJson(res, 404, { error: 'File not found in active repository' });
      }

      let content = file.content;
      if (content === null || content === undefined) {
        try {
          const buffer = await fs.readFile(file.path);
          if (!buffer.includes(0)) {
            content = buffer.toString('utf-8');
            file.content = content;
          }
        } catch {
          content = '// Binary or inaccessible file content';
        }
      }

      return this.sendJson(res, 200, {
        ...file,
        content
      });
    }

    // 7. Code Metrics (Lazy)
    if (req.method === 'GET' && pathname === '/api/metrics') {
      const files = this.activeRepoState.files || [];
      const totalLoc = this.activeRepoState.summary?.totalLines || files.reduce((acc, f) => acc + (f.lineCount || 0), 0);
      const totalSloc = Math.round(totalLoc * 0.8);
      const avgMaintainability = this.activeRepoState.summary?.avgMaintainability || 95;

      return this.sendJson(res, 200, {
        totalLoc,
        totalSloc,
        avgMaintainability,
        files: files.map(f => ({
          relativePath: f.relativePath,
          language: f.language,
          metrics: { loc: f.lineCount || 0, sloc: Math.round((f.lineCount || 0) * 0.8), maintainabilityIndex: 95 }
        }))
      });
    }

    // 8. Hotspot & Churn Analysis (Lazy)
    if (req.method === 'GET' && pathname === '/api/hotspots') {
      const hotspots = await RepositoryService.getHotspots(this.activeRepoState);
      return this.sendJson(res, 200, {
        hotspots: hotspots || []
      });
    }

    // 9. Circular Dependency Detection (Lazy)
    if (req.method === 'GET' && pathname === '/api/cycles') {
      const cycles = await RepositoryService.getCycles(this.activeRepoState);
      return this.sendJson(res, 200, {
        cycles: cycles || []
      });
    }

    // 10. Architecture & Class Mermaid Diagrams (Lazy)
    if (req.method === 'GET' && pathname === '/api/diagram') {
      const type = parsedUrl.searchParams.get('type') || 'module';
      let diagram = '';
      if (type === 'class') {
        const parsedFiles = await RepositoryService.getParsedFiles(this.activeRepoState);
        diagram = MermaidGenerator.generateClassDiagram(parsedFiles);
      } else {
        const graph = await RepositoryService.getDependencyGraph(this.activeRepoState);
        diagram = MermaidGenerator.generateModuleFlowchart(graph);
      }
      return this.sendJson(res, 200, { type, diagram });
    }

    // 11. Impact & Blast Radius Analysis (Lazy)
    if (req.method === 'GET' && pathname === '/api/impact') {
      const relPath = parsedUrl.searchParams.get('path') || (this.activeRepoState.files[0]?.relativePath || '');
      const graph = await RepositoryService.getDependencyGraph(this.activeRepoState);
      const edges = graph.edges || [];
      const totalFilesCount = Math.max(1, this.activeRepoState.files.length);

      const dependents = edges.filter(e => (e.target === relPath || e.to === relPath)).map(e => e.source || e.from);
      const dependencies = edges.filter(e => (e.source === relPath || e.from === relPath)).map(e => e.target || e.to);

      const uniqueDependents = [...new Set(dependents)];
      const uniqueDependencies = [...new Set(dependencies)];
      const blastScore = Math.min(100, Math.round(((uniqueDependents.length * 2 + uniqueDependencies.length) / totalFilesCount) * 100) + 15);
      const risk = blastScore >= 70 ? 'CRITICAL' : blastScore >= 40 ? 'HIGH' : blastScore >= 20 ? 'MEDIUM' : 'LOW';

      return this.sendJson(res, 200, {
        file: relPath,
        blastScore,
        risk,
        dependents: uniqueDependents,
        dependencies: uniqueDependencies,
        totalFiles: totalFilesCount
      });
    }

    // 12. Risk Map (Heuristic)
    if (req.method === 'GET' && pathname === '/api/risk') {
      const hotspots = await RepositoryService.getHotspots(this.activeRepoState);
      const files = this.activeRepoState.files || [];
      
      const riskRanking = files.slice(0, 15).map(f => {
        const hotspot = hotspots.find(h => h.relativePath === f.relativePath);
        const churn = hotspot?.churnCount || 1;
        const loc = f.lineCount || 50;
        const score = Math.min(100, Math.round(churn * 7 + loc / 15));
        return {
          file: f.relativePath,
          score,
          level: score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW',
          churn,
          loc
        };
      }).sort((a, b) => b.score - a.score);

      return this.sendJson(res, 200, { riskRanking });
    }

    // 13. Feature Mapping (Heuristic)
    if (req.method === 'GET' && pathname === '/api/features') {
      const files = this.activeRepoState.files || [];
      const categories = {
        'Core Logic': [],
        'API & Routes': [],
        'UI Components': [],
        'Data & State': [],
        'Tests': [],
        'Configuration': []
      };

      for (const f of files) {
        const p = f.relativePath.toLowerCase();
        if (p.includes('test') || p.includes('spec')) {
          categories['Tests'].push(f.relativePath);
        } else if (p.includes('api') || p.includes('route') || p.includes('server')) {
          categories['API & Routes'].push(f.relativePath);
        } else if (p.includes('ui') || p.includes('view') || p.includes('component') || p.includes('style') || p.endsWith('.css') || p.endsWith('.html')) {
          categories['UI Components'].push(f.relativePath);
        } else if (p.includes('state') || p.includes('store') || p.includes('service') || p.includes('model')) {
          categories['Data & State'].push(f.relativePath);
        } else if (p.endsWith('.json') || p.endsWith('.yaml') || p.endsWith('.yml') || p.endsWith('.toml') || p.endsWith('.config.js')) {
          categories['Configuration'].push(f.relativePath);
        } else {
          categories['Core Logic'].push(f.relativePath);
        }
      }

      const features = Object.entries(categories).map(([category, fileList]) => ({
        category,
        count: fileList.length,
        files: fileList.slice(0, 8)
      }));

      return this.sendJson(res, 200, { features });
    }

    // 14. Test Intelligence
    if (req.method === 'GET' && pathname === '/api/tests') {
      const files = this.activeRepoState.files || [];
      const testFiles = files.filter(f => f.relativePath.includes('test') || f.relativePath.includes('spec'));
      const sourceFiles = files.filter(f => !f.relativePath.includes('test') && !f.relativePath.includes('spec'));

      return this.sendJson(res, 200, {
        totalTests: testFiles.length,
        totalSourceFiles: sourceFiles.length,
        testRatio: sourceFiles.length > 0 ? `${Math.round((testFiles.length / sourceFiles.length) * 100)}%` : '0%',
        testFiles: testFiles.map(t => t.relativePath),
        untestedNotice: 'Static test mapping derived from naming conventions (*.test.*, tests/*).'
      });
    }

    // 15. Bug Archaeology (Git commit keyword matching)
    if (req.method === 'GET' && pathname === '/api/bugs') {
      const { commits } = await RepositoryService.getGitData(this.activeRepoState);
      const bugKeywords = ['bug', 'fix', 'hotfix', 'patch', 'issue', 'crash', 'error', 'regression'];
      const bugCommits = (commits || []).filter(c => {
        const msg = (c.message || '').toLowerCase();
        return bugKeywords.some(kw => msg.includes(kw));
      });

      return this.sendJson(res, 200, {
        totalBugCommits: bugCommits.length,
        totalAnalyzedCommits: (commits || []).length,
        bugCommits: bugCommits.slice(0, 20)
      });
    }

    // 16. Dead Code Signals (Isolated unimported files)
    if (req.method === 'GET' && pathname === '/api/deadcode') {
      const graph = await RepositoryService.getDependencyGraph(this.activeRepoState);
      const edges = graph.edges || [];
      const files = this.activeRepoState.files || [];

      const connected = new Set();
      for (const e of edges) {
        connected.add(e.source);
        connected.add(e.target);
      }

      const isolated = files
        .filter(f => !connected.has(f.relativePath) && !f.relativePath.includes('index') && !f.relativePath.includes('server'))
        .map(f => ({
          file: f.relativePath,
          reason: 'No detected internal import edges (leaf or isolated module)'
        }));

      return this.sendJson(res, 200, {
        isolatedCount: isolated.length,
        candidates: isolated.slice(0, 15)
      });
    }

    // 17. Dependency Health & Manifests
    if (req.method === 'GET' && pathname === '/api/manifests') {
      const files = this.activeRepoState.files || [];
      const manifestNames = ['package.json', 'requirements.txt', 'pyproject.toml', 'Cargo.toml', 'go.mod', 'pom.xml'];
      const manifests = [];

      for (const f of files) {
        const baseName = path.basename(f.relativePath);
        if (manifestNames.includes(baseName)) {
          manifests.push({
            file: f.relativePath,
            type: baseName
          });
        }
      }

      return this.sendJson(res, 200, {
        manifestsCount: manifests.length,
        manifests
      });
    }

    // 18. Code Review Audit
    if (req.method === 'GET' && pathname === '/api/review') {
      const files = this.activeRepoState.files || [];
      const cycles = await RepositoryService.getCycles(this.activeRepoState);
      const findings = [];

      if (cycles.length > 0) {
        findings.push({
          severity: 'HIGH',
          category: 'Architectural Coupling',
          file: `${cycles.length} Circular Loops`,
          message: `Detected ${cycles.length} cyclic dependencies that impair tree-shaking and isolation.`
        });
      } else {
        findings.push({
          severity: 'INFO',
          category: 'Architecture Topology',
          file: 'Entire Codebase',
          message: '0 circular dependency loops detected. Subsystem imports form a clean Directed Acyclic Graph (DAG).'
        });
      }

      const oversized = files.filter(f => (f.lineCount || 0) > 300);
      for (const f of oversized.slice(0, 5)) {
        findings.push({
          severity: 'MEDIUM',
          category: 'Oversized Module',
          file: `${f.relativePath} (${f.lineCount} LOC)`,
          message: `File exceeds 300 LOC threshold. Consider splitting into focused sub-modules.`
        });
      }

      return this.sendJson(res, 200, {
        healthScore: Math.max(75, Math.round(this.activeRepoState.summary?.avgMaintainability || 95)),
        totalFiles: files.length,
        findings
      });
    }

    // 19. Subsystem Documentation Generator
    if (req.method === 'GET' && pathname === '/api/docs') {
      const files = this.activeRepoState.files || [];
      const modulesMap = new Map();

      for (const f of files) {
        const modName = f.relativePath.includes('/') ? f.relativePath.split('/')[0] : 'root';
        if (!modulesMap.has(modName)) {
          modulesMap.set(modName, { name: modName, files: [] });
        }
        modulesMap.get(modName).files.push(f.relativePath);
      }

      const modules = Array.from(modulesMap.values()).map(m => ({
        name: m.name,
        fileCount: m.files.length,
        files: m.files.slice(0, 10)
      }));

      return this.sendJson(res, 200, {
        repository: this.activeRepoState.summary?.name || 'Repository',
        totalModules: modules.length,
        modules
      });
    }

    // 20. AI / Q&A Query
    if (req.method === 'POST' && pathname === '/api/ai/query') {
      const body = await this.parseRequestBody(req);
      const parsedFiles = await RepositoryService.getParsedFiles(this.activeRepoState);
      const engine = new LocalQueryEngine({
        ...this.activeRepoState,
        files: parsedFiles
      });
      const response = engine.evaluateQuery(body.query);
      return this.sendJson(res, 200, response);
    }

    // 21. Export Report
    if (req.method === 'GET' && pathname === '/api/export') {
      const format = parsedUrl.searchParams.get('format') || 'json';
      return this.handleExport(res, format);
    }

    // 22. Serve UI Static Assets
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
        res.writeHead(200, {
          'Content-Type': mimeTypes[ext] || 'text/plain',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
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

  handleExport(res, format) {
    const { summary, files } = this.activeRepoState;
    if (!summary) {
      return this.sendJson(res, 400, { error: 'No repository is currently scanned to export' });
    }

    if (format === 'markdown') {
      const langRows = Object.entries(summary.languages || {})
        .map(([l, s]) => `| ${l} | ${s.percentage}% | ${s.lines.toLocaleString()} | ${s.files} |`)
        .join('\n');

      const markdown = `# Architecture Summary: ${summary.name}

> Generated by Codebase Archaeologist on ${new Date().toISOString()}

## Repository Overview
- **Branch**: \`${summary.branch}\`
- **Total Files**: ${summary.totalFiles}
- **Total LOC**: ${summary.totalLines.toLocaleString()} lines
- **Total Size**: ${(summary.totalSizeBytes / 1024).toFixed(1)} KB

## Language Breakdown
| Language | % Share | Lines | Files |
| :--- | :--- | :--- | :--- |
${langRows}
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
      filesCount: files.length
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
