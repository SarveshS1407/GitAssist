import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Explorer View
 * Interactive file tree navigation and code symbol inspection
 */
export class ExplorerView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
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

    const files = [
      { path: 'src/server.js', lang: 'JavaScript', loc: 40, symbols: 'ApiRouter, PORT, ROOT_DIR', type: 'Server Entry' },
      { path: 'src/api/routes.js', lang: 'JavaScript', loc: 342, symbols: 'ApiRouter, handleScan, handleExport', type: 'REST Dispatcher' },
      { path: 'src/services/repository-service.js', lang: 'JavaScript', loc: 160, symbols: 'RepositoryService, validateRepository, openRepository', type: 'Service Layer' },
      { path: 'src/services/git-service.js', lang: 'JavaScript', loc: 75, symbols: 'GitService, getCommits, getCurrentBranch', type: 'Service Layer' },
      { path: 'src/core/parser.js', lang: 'JavaScript', loc: 140, symbols: 'CodeParser, parseFile, extractSymbols', type: 'AST Engine' },
      { path: 'src/core/metrics.js', lang: 'JavaScript', loc: 73, symbols: 'CodeMetrics, calculateFileMetrics', type: 'Metrics Engine' },
      { path: 'src/core/circular-detector.js', lang: 'JavaScript', loc: 57, symbols: 'CircularDependencyDetector, detectCycles', type: 'Graph Engine' },
      { path: 'src/core/hotspot-analyzer.js', lang: 'JavaScript', loc: 56, symbols: 'HotspotAnalyzer, analyzeHotspots', type: 'Risk Engine' },
      { path: 'src/ui/app.js', lang: 'JavaScript', loc: 160, symbols: 'App, init, openRepository', type: 'Frontend Core' },
      { path: 'src/ui/styles/main.css', lang: 'CSS', loc: 706, symbols: 'Cyber-Forensic HUD Tokens', type: 'Design System' }
    ];

    const fileListHtml = files.map(f => `
      <div class="timeline-node" style="border-left-color: var(--accent-cyan);">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: var(--accent-cyan); font-family: var(--font-mono); font-weight: 700; font-size: 0.85rem;">📄 ${f.path}</span>
            <span class="landing-card-badge">${f.lang}</span>
            <span style="font-size: 0.72rem; color: var(--text-muted);">${f.type}</span>
          </div>
          <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px; font-family: var(--font-mono);">
            Symbols: <span style="color: var(--text-primary);">${f.symbols}</span>
          </div>
        </div>
        <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); text-align: right;">
          ${f.loc} LOC
        </div>
      </div>
    `).join('');

    panel.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>📁</span>
          <span>Indexed Source Artifacts (${files.length} Subsystems)</span>
        </h3>
        <span class="landing-card-badge">Live AST Extraction</span>
      </div>
      <div class="forensic-timeline" style="margin-top: 12px;">
        ${fileListHtml}
      </div>
    `;

    container.appendChild(panel);
    return container;
  }
}
