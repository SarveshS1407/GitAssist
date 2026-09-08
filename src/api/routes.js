import path from 'node:path';
import fs from 'node:fs/promises';
import { RepositoryService } from '../services/repository-service.js';
import { GitService } from '../services/git-service.js';
import { MermaidGenerator } from '../core/mermaid-generator.js';
import { AIContextPackager } from '../ai/context-packager.js';
import { LocalQueryEngine } from '../ai/query-engine.js';
import { DuplicationDetector } from '../core/duplication-detector.js';
import { SecurityScanner } from '../core/security-scanner.js';
import { LicenseDetector } from '../core/license-detector.js';
import { TechDebtCalculator } from '../core/tech-debt-calculator.js';
import { BusFactorAnalyzer } from '../core/bus-factor-analyzer.js';
import { ApiExtractor } from '../core/api-extractor.js';
import { StabilityForecaster } from '../core/stability-forecaster.js';
import { ReportGenerator } from '../services/report-generator.js';
import { SettingsService } from '../services/settings-service.js';

export class ApiRouter {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.settingsService = new SettingsService(rootDir);
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

    // 4c. Git Bus Factor & Knowledge Silos (Lazy)
    if (req.method === 'GET' && pathname === '/api/repository/git/bus-factor') {
      const { commits } = await RepositoryService.getGitData(this.activeRepoState);
      const analyzer = new BusFactorAnalyzer();
      const busFactor = analyzer.analyze(commits || [], this.activeRepoState.files || []);
      return this.sendJson(res, 200, busFactor);
    }

    // 4d. Code Churn & Stability Forecasting (Lazy)
    if (req.method === 'GET' && pathname === '/api/repository/git/stability') {
      const { commits } = await RepositoryService.getGitData(this.activeRepoState);
      const forecaster = new StabilityForecaster();
      const stability = forecaster.forecast(commits || [], this.activeRepoState.files || []);
      return this.sendJson(res, 200, stability);
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

    // 10b. Symbol Code Intelligence Inventory (Lazy)
    if (req.method === 'GET' && pathname === '/api/symbols') {
      const query = parsedUrl.searchParams.get('q') || '';
      const kind = parsedUrl.searchParams.get('kind') || '';
      const file = parsedUrl.searchParams.get('file') || '';
      const limit = parseInt(parsedUrl.searchParams.get('limit') || '100', 10);

      const contextGraph = await RepositoryService.getContextGraph(this.activeRepoState);
      const symbols = contextGraph.searchSymbols(query, { kind: kind || undefined, file: file || undefined });

      return this.sendJson(res, 200, {
        total: symbols.length,
        symbols: symbols.slice(0, limit).map(s => ({
          id: s.id,
          name: s.name,
          qualifiedName: s.qualifiedName,
          kind: s.kind,
          file: s.file,
          parentClass: s.parentClass,
          lineStart: s.lineStart,
          lineEnd: s.lineEnd,
          signature: s.signature,
          callsCount: (s.calls || []).length
        }))
      });
    }

    // 10c. Symbol Call Graph (Lazy)
    if (req.method === 'GET' && pathname === '/api/call-graph') {
      const symbolRef = parsedUrl.searchParams.get('symbol');
      const depth = parseInt(parsedUrl.searchParams.get('depth') || '2', 10);
      const direction = parsedUrl.searchParams.get('direction') || 'both';

      const callGraph = await RepositoryService.getCallGraph(this.activeRepoState);

      if (!symbolRef) {
        // Return first available symbol or top central symbol if none provided
        const metrics = callGraph.getCallMetrics(1);
        const defaultRef = metrics.topCalled[0]?.symbol?.qualifiedName || 'default';
        const tree = callGraph.exportCallTree(defaultRef, { depth, direction });
        return this.sendJson(res, 200, tree);
      }

      const tree = callGraph.exportCallTree(symbolRef, { depth, direction });
      return this.sendJson(res, 200, tree);
    }

    // 10d. Symbol Call Path Trace (Lazy)
    if (req.method === 'GET' && pathname === '/api/call-graph/trace') {
      const from = parsedUrl.searchParams.get('from');
      const to = parsedUrl.searchParams.get('to');
      const depth = parseInt(parsedUrl.searchParams.get('depth') || '5', 10);

      if (!from || !to) {
        return this.sendJson(res, 400, { error: 'Both "from" and "to" symbol parameters are required' });
      }

      const callGraph = await RepositoryService.getCallGraph(this.activeRepoState);
      const traceResult = callGraph.getCallPath(from, to, depth);
      return this.sendJson(res, 200, traceResult);
    }

    // 10e. Call Graph Centrality Metrics (Lazy)
    if (req.method === 'GET' && pathname === '/api/call-graph/metrics') {
      const limit = parseInt(parsedUrl.searchParams.get('limit') || '10', 10);
      const callGraph = await RepositoryService.getCallGraph(this.activeRepoState);
      const metrics = callGraph.getCallMetrics(limit);
      return this.sendJson(res, 200, metrics);
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

    // 11b. Multi-Dimensional Impact Analysis Engine (Lazy)
    if (req.method === 'GET' && pathname === '/api/impact/advanced') {
      const target = parsedUrl.searchParams.get('target') || (this.activeRepoState.files[0]?.relativePath || '');
      const depth = parseInt(parsedUrl.searchParams.get('depth') || '3', 10);

      const impactEngine = await RepositoryService.getImpactEngine(this.activeRepoState);
      const report = impactEngine.analyzeImpact(target, depth);

      return this.sendJson(res, 200, report);
    }

    // 11c. "Before You Change This" Pre-Modification Change Brief (Lazy)
    if (req.method === 'GET' && pathname === '/api/change-brief') {
      const target = parsedUrl.searchParams.get('target') || (this.activeRepoState.files[0]?.relativePath || '');
      const format = parsedUrl.searchParams.get('format') || 'json';

      const briefGen = await RepositoryService.getChangeBriefGenerator(this.activeRepoState);
      const brief = briefGen.generateBrief(target);

      if (format === 'markdown' || format === 'md') {
        const markdown = briefGen.formatMarkdown(brief);
        return this.sendJson(res, 200, { ...brief, markdown });
      }

      return this.sendJson(res, 200, brief);
    }

    // 11d. Pull Request / Diff Risk Analyzer (POST)
    if (req.method === 'POST' && pathname === '/api/pr/analyze') {
      const body = await this.parseRequestBody(req);
      const diffText = body.diff || body.diffText || '';

      if (!diffText.trim()) {
        return this.sendJson(res, 400, { error: 'diff or diffText is required in request body' });
      }

      const analyzer = await RepositoryService.getPRAnalyzer(this.activeRepoState);
      const report = analyzer.analyze(diffText);

      return this.sendJson(res, 200, report);
    }

    // 11e. Automatic Test Recommendation Engine (Lazy)
    if (req.method === 'GET' && pathname === '/api/tests/recommend') {
      const target = parsedUrl.searchParams.get('target') || (this.activeRepoState.files[0]?.relativePath || '');

      const recommender = await RepositoryService.getTestRecommender(this.activeRepoState);
      const recommendations = recommender.recommend(target);

      return this.sendJson(res, 200, recommendations);
    }

    // 12. Structural Risk Map & Architectural Quadrants (Lazy)
    if (req.method === 'GET' && pathname === '/api/risk') {
      const riskEngine = await RepositoryService.getRiskMatrixEngine(this.activeRepoState);
      const matrix = riskEngine.calculate();

      return this.sendJson(res, 200, {
        riskRanking: matrix.riskRanking,
        summary: matrix.summary,
        quadrants: matrix.quadrants
      });
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

    // 14. Advanced Test Intelligence & Verification Density (Lazy)
    if (req.method === 'GET' && pathname === '/api/tests') {
      const intelEngine = await RepositoryService.getTestIntelligence(this.activeRepoState);
      const analysis = intelEngine.analyze();

      return this.sendJson(res, 200, {
        totalTests: analysis.summary.totalTestFiles,
        totalSourceFiles: analysis.summary.totalSourceFiles,
        testRatio: `${analysis.summary.testToSourceRatio}%`,
        testFiles: analysis.testSuites.map(t => t.file),
        untestedNotice: 'Verification analysis derived from AST import graphs, naming conventions, and hotspot churn correlation.',
        summary: analysis.summary,
        uncoveredHighRiskFiles: analysis.uncoveredHighRiskFiles,
        moduleCoverage: analysis.moduleCoverage,
        testSuites: analysis.testSuites
      });
    }

    // 15. Bug Archaeology & Defect Intelligence (Lazy)
    if (req.method === 'GET' && pathname === '/api/bugs') {
      const bugEngine = await RepositoryService.getBugArchaeologyEngine(this.activeRepoState);
      const report = bugEngine.analyze();

      return this.sendJson(res, 200, {
        totalBugCommits: report.summary.totalDefectCommits,
        totalAnalyzedCommits: report.summary.totalAnalyzedCommits,
        bugCommits: report.defectCommits,
        summary: report.summary,
        defectHotspots: report.defectHotspots,
        categories: report.summary.categories
      });
    }

    // 16. Dead & Isolated Code Detection (Lazy)
    if (req.method === 'GET' && pathname === '/api/deadcode') {
      const detector = await RepositoryService.getDeadCodeDetector(this.activeRepoState);
      const report = detector.detect();

      return this.sendJson(res, 200, {
        isolatedCount: report.summary.orphanModulesCount,
        candidates: report.orphanModules.map(o => ({
          file: o.file,
          reason: o.reason,
          confidence: o.confidence,
          lineCount: o.lineCount
        })),
        summary: report.summary,
        orphanModules: report.orphanModules,
        unusedSymbols: report.unusedSymbols
      });
    }

    // 16b. Code Duplication Analysis (Lazy)
    if (req.method === 'GET' && pathname === '/api/analysis/duplication') {
      const parsedFiles = await RepositoryService.getParsedFiles(this.activeRepoState);
      const detector = new DuplicationDetector({ minLines: 5 });
      const duplication = detector.detect(parsedFiles || []);
      return this.sendJson(res, 200, duplication);
    }

    // 16c. Security & Secret Vulnerability Audit (Lazy)
    if (req.method === 'GET' && pathname === '/api/analysis/security') {
      const parsedFiles = await RepositoryService.getParsedFiles(this.activeRepoState);
      const scanner = new SecurityScanner();
      const security = scanner.scan(parsedFiles || []);
      return this.sendJson(res, 200, security);
    }

    // 16d. License & Compliance Audit (Lazy)
    if (req.method === 'GET' && pathname === '/api/analysis/licenses') {
      const parsedFiles = await RepositoryService.getParsedFiles(this.activeRepoState);
      const detector = new LicenseDetector();
      const licenses = detector.detect(parsedFiles || []);
      return this.sendJson(res, 200, licenses);
    }

    // 16e. Technical Debt & Remediation Cost (Lazy)
    if (req.method === 'GET' && pathname === '/api/analysis/tech-debt') {
      const parsedFiles = await RepositoryService.getParsedFiles(this.activeRepoState);
      const cycles = await RepositoryService.getCycles(this.activeRepoState);
      const hotspots = await RepositoryService.getHotspots(this.activeRepoState);
      
      const dupDetector = new DuplicationDetector({ minLines: 5 });
      const dupResult = dupDetector.detect(parsedFiles || []);

      const calculator = new TechDebtCalculator({ hourlyRate: 100 });
      const debt = calculator.calculate({
        files: this.activeRepoState.files || [],
        cycles: cycles || [],
        hotspots: hotspots || [],
        duplicationLines: dupResult.totalDuplicatedLines || 0
      });

      return this.sendJson(res, 200, debt);
    }

    // 16f. API Endpoints & Route Inventory (Lazy)
    if (req.method === 'GET' && pathname === '/api/analysis/endpoints') {
      const parsedFiles = await RepositoryService.getParsedFiles(this.activeRepoState);
      const extractor = new ApiExtractor();
      const endpoints = extractor.extract(parsedFiles || []);
      return this.sendJson(res, 200, endpoints);
    }

    // 16g. Forensic Audit Executive Report (Markdown or JSON)
    if (req.method === 'GET' && pathname === '/api/report/export') {
      const format = parsedUrl.searchParams.get('format') || 'markdown';
      const parsedFiles = await RepositoryService.getParsedFiles(this.activeRepoState);
      const { commits } = await RepositoryService.getGitData(this.activeRepoState);
      const cycles = await RepositoryService.getCycles(this.activeRepoState);
      const hotspots = await RepositoryService.getHotspots(this.activeRepoState);

      const securityScanner = new SecurityScanner();
      const security = securityScanner.scan(parsedFiles || []);

      const dupDetector = new DuplicationDetector({ minLines: 5 });
      const duplication = dupDetector.detect(parsedFiles || []);

      const techDebtCalc = new TechDebtCalculator();
      const techDebt = techDebtCalc.calculate({
        files: this.activeRepoState.files || [],
        cycles: cycles || [],
        hotspots: hotspots || [],
        duplicationLines: duplication.totalDuplicatedLines || 0
      });

      const busFactorAnalyzer = new BusFactorAnalyzer();
      const busFactor = busFactorAnalyzer.analyze(commits || [], this.activeRepoState.files || []);

      const apiExtractor = new ApiExtractor();
      const endpoints = apiExtractor.extract(parsedFiles || []);

      const reportData = {
        repository: this.activeRepoState.summary?.name || 'GitAssist Core',
        summary: this.activeRepoState.summary || {},
        security,
        techDebt,
        busFactor,
        duplication,
        endpoints,
        hotspots,
        cycles
      };

      if (format === 'json') {
        return this.sendJson(res, 200, reportData);
      }

      const markdown = ReportGenerator.generateMarkdown(reportData);
      res.writeHead(200, {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'attachment; filename="gitassist-forensic-report.md"'
      });
      res.end(markdown);
      return;
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

    // 18. Automated Heuristic Code Review (Lazy)
    if (req.method === 'GET' && pathname === '/api/review') {
      const reviewEngine = await RepositoryService.getHeuristicReviewEngine(this.activeRepoState);
      const report = reviewEngine.review();

      return this.sendJson(res, 200, {
        healthScore: report.summary.healthScore,
        totalFiles: report.summary.totalFilesAudited,
        summary: report.summary,
        findings: report.findings
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

    // 23. Settings Management API
    if (req.method === 'GET' && pathname === '/api/settings') {
      const settings = await this.settingsService.getSettings();
      return this.sendJson(res, 200, { success: true, settings });
    }

    if (req.method === 'POST' && pathname === '/api/settings') {
      const body = await this.parseRequestBody(req);
      const updated = await this.settingsService.updateSettings(body.settings || body);
      return this.sendJson(res, 200, { success: true, settings: updated });
    }

    if (req.method === 'POST' && pathname === '/api/settings/reset') {
      const reset = await this.settingsService.resetSettings();
      return this.sendJson(res, 200, { success: true, settings: reset });
    }

    if (req.method === 'POST' && pathname === '/api/settings/test-connection') {
      const body = await this.parseRequestBody(req);
      const result = await this.settingsService.testConnection(body);
      return this.sendJson(res, 200, result);
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
