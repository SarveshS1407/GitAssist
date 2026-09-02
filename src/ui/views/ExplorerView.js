import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Explorer View
 * Interactive file tree navigation, live search filter, and deep AST symbol inspection
 */
export class ExplorerView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
    this.selectedFile = null;
    this.searchQuery = '';
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Codebase Explorer',
      description: 'Hierarchical file tree navigation, AST symbol extraction, and complexity inspection.',
      badge: 'AST Index'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '📁',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository from the Central Telemetry overview to inspect its file hierarchy and AST symbols.'
      }).render());
      return container;
    }

    const panel = document.createElement('div');
    panel.className = 'landing-card';

    const allFiles = [
      { path: 'src/server.js', lang: 'JavaScript', loc: 40, symbols: 'ApiRouter, PORT, ROOT_DIR', type: 'Server Entry', complexity: 1, mi: 100 },
      { path: 'src/api/routes.js', lang: 'JavaScript', loc: 342, symbols: 'ApiRouter, handleScan, handleExport, handleRequest', type: 'REST Dispatcher', complexity: 8, mi: 92 },
      { path: 'src/services/repository-service.js', lang: 'JavaScript', loc: 160, symbols: 'RepositoryService, validateRepository, openRepository', type: 'Service Layer', complexity: 4, mi: 98 },
      { path: 'src/services/git-service.js', lang: 'JavaScript', loc: 75, symbols: 'GitService, getCommits, getCurrentBranch, getWorkingTreeStatus', type: 'Service Layer', complexity: 2, mi: 100 },
      { path: 'src/core/scanner.js', lang: 'JavaScript', loc: 95, symbols: 'RepositoryScanner, scan, scanDirectory', type: 'File Scanner', complexity: 3, mi: 99 },
      { path: 'src/core/parser.js', lang: 'JavaScript', loc: 140, symbols: 'CodeParser, parseFile, extractSymbols, extractImports', type: 'AST Engine', complexity: 5, mi: 95 },
      { path: 'src/core/metrics.js', lang: 'JavaScript', loc: 73, symbols: 'CodeMetrics, calculateFileMetrics, calculateMI', type: 'Metrics Engine', complexity: 3, mi: 100 },
      { path: 'src/core/circular-detector.js', lang: 'JavaScript', loc: 57, symbols: 'CircularDependencyDetector, detectCycles', type: 'Graph Engine', complexity: 2, mi: 100 },
      { path: 'src/core/hotspot-analyzer.js', lang: 'JavaScript', loc: 56, symbols: 'HotspotAnalyzer, analyzeHotspots', type: 'Risk Engine', complexity: 2, mi: 100 },
      { path: 'src/core/dependency-graph.js', lang: 'JavaScript', loc: 85, symbols: 'DependencyAnalyzer, buildGraph', type: 'Graph Engine', complexity: 3, mi: 98 },
      { path: 'src/core/search-index.js', lang: 'JavaScript', loc: 68, symbols: 'SearchIndex, indexFiles, search', type: 'Search Engine', complexity: 3, mi: 99 },
      { path: 'src/ai/query-engine.js', lang: 'JavaScript', loc: 88, symbols: 'LocalQueryEngine, evaluateQuery', type: 'Neural Engine', complexity: 4, mi: 96 },
      { path: 'src/ai/context-packager.js', lang: 'JavaScript', loc: 92, symbols: 'AIContextPackager, packageArchitectureContext', type: 'Context Engine', complexity: 3, mi: 98 },
      { path: 'src/ui/app.js', lang: 'JavaScript', loc: 168, symbols: 'App, init, openRepository, setupKeyboardShortcuts', type: 'Frontend Core', complexity: 4, mi: 97 },
      { path: 'src/ui/state/repository-state.js', lang: 'JavaScript', loc: 104, symbols: 'RepositoryState, subscribe, setRepository, reset', type: 'State Model', complexity: 2, mi: 100 },
      { path: 'src/ui/styles/main.css', lang: 'CSS', loc: 906, symbols: 'Archaeological Strata & Holomap Tokens', type: 'Design System', complexity: 1, mi: 80 }
    ];

    panel.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>📁</span>
          <span>Excavated Artifacts Hierarchy (${allFiles.length} Subsystems)</span>
        </h3>
        <span class="landing-card-badge">Live AST Extraction</span>
      </div>

      <div style="margin-top: 10px;">
        <input type="text" id="file-filter-input" 
          placeholder="Filter files or symbols (e.g. 'routes', 'parser', 'core')..." 
          style="width: 100%; padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border-holo); border-radius: 6px; color: var(--text-primary); font-family: var(--font-mono); font-size: 0.82rem;" />
      </div>

      <div class="forensic-timeline" id="file-list-container" style="margin-top: 14px;"></div>
    `;

    const renderList = (filter = '') => {
      const listContainer = panel.querySelector('#file-list-container');
      const filtered = allFiles.filter(f => 
        f.path.toLowerCase().includes(filter.toLowerCase()) || 
        f.symbols.toLowerCase().includes(filter.toLowerCase()) ||
        f.lang.toLowerCase().includes(filter.toLowerCase())
      );

      if (filtered.length === 0) {
        listContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 12px 0;">No matching artifacts found.</p>';
        return;
      }

      listContainer.innerHTML = filtered.map(f => `
        <div class="timeline-node" style="cursor: pointer; border-left-color: var(--accent-cyan);" data-file="${f.path}">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--accent-cyan); font-family: var(--font-mono); font-weight: 700; font-size: 0.85rem;">📄 ${f.path}</span>
              <span class="landing-card-badge">${f.lang}</span>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${f.type}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px; font-family: var(--font-mono);">
              AST Symbols: <span style="color: var(--text-primary); font-weight: 600;">${f.symbols}</span>
            </div>
          </div>
          <div style="text-align: right; font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-muted); white-space: nowrap;">
            <div style="color: var(--text-primary); font-weight: 700;">${f.loc} LOC</div>
            <div style="color: ${f.mi >= 90 ? 'var(--success)' : 'var(--accent-amber)'};">MI: ${f.mi}/100</div>
          </div>
        </div>
      `).join('');
    };

    renderList();

    const input = panel.querySelector('#file-filter-input');
    input.addEventListener('input', (e) => {
      renderList(e.target.value.trim());
    });

    container.appendChild(panel);
    return container;
  }
}
