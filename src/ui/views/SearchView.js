import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Forensic Search View
 * Real-time code symbol tracing and file matching console
 */
export class SearchView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Forensic Code Tracer',
      description: 'Trace symbols, function definitions, class hierarchies, and file blast radii across the repository.',
      badge: 'Index Tracer'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '🔍',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository to activate the Forensic Code Tracer index.'
      }).render());
      return container;
    }

    const searchBox = document.createElement('div');
    searchBox.className = 'landing-card';

    searchBox.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>🔎</span>
          <span>Trace Query Console</span>
        </h3>
        <span class="landing-card-badge">Instant Query</span>
      </div>

      <div style="display: flex; gap: 12px; margin-top: 8px;">
        <input type="text" id="forensic-search-input" 
          placeholder="> Enter symbol name (e.g. RepositoryService, detectCycles, parseFile)..." 
          value="RepositoryService"
          style="flex: 1; padding: 10px 14px; background: var(--bg-input); border: 1px solid var(--border-hud); border-radius: 6px; color: var(--text-primary); font-family: var(--font-mono); font-size: 0.88rem;" />
        <button class="btn-primary" id="btn-run-trace">
          <span>⚡</span>
          <span>TRACE</span>
        </button>
      </div>

      <div id="trace-results-container" style="margin-top: 18px; display: flex; flex-direction: column; gap: 10px;">
        <div class="timeline-node" style="border-left-color: var(--accent-cyan);">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="timeline-hash">CLASS</span>
              <span style="font-weight: 700; color: var(--text-primary); font-family: var(--font-mono);">RepositoryService</span>
              <span style="font-size: 0.78rem; color: var(--accent-cyan); font-family: var(--font-mono);">src/services/repository-service.js:14</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;">
              Coordinates validation, file ingestion, AST symbol parsing, code metrics, and Git integration
            </div>
          </div>
          <span class="landing-card-badge" style="color: var(--success); border-color: var(--success);">MATCH: 100%</span>
        </div>

        <div class="timeline-node" style="border-left-color: var(--accent-neural);">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="timeline-hash" style="color: var(--accent-neural); background-color: var(--accent-neural-dim);">FUNCTION</span>
              <span style="font-weight: 700; color: var(--text-primary); font-family: var(--font-mono);">validateRepository(targetPath)</span>
              <span style="font-size: 0.78rem; color: var(--accent-cyan); font-family: var(--font-mono);">src/services/repository-service.js:20</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;">
              Validates target filesystem path accessibility, permissions, and Git tracking presence
            </div>
          </div>
          <span class="landing-card-badge">METHOD</span>
        </div>
      </div>
    `;

    container.appendChild(searchBox);
    return container;
  }
}
