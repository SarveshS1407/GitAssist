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
        <span class="landing-card-badge">Live Query Engine</span>
      </div>

      <div style="display: flex; gap: 12px; margin-top: 8px;">
        <input type="text" id="forensic-search-input" 
          placeholder="> Enter symbol name (e.g. RepositoryService, detectCycles, parseFile)..." 
          value="RepositoryService"
          style="flex: 1; padding: 10px 14px; background: var(--bg-input); border: 1px solid var(--border-holo); border-radius: 6px; color: var(--text-primary); font-family: var(--font-mono); font-size: 0.88rem;" />
        <button class="btn-primary" id="btn-run-trace">
          <span>⚡</span>
          <span>TRACE</span>
        </button>
      </div>

      <div id="trace-results-container" style="margin-top: 18px; display: flex; flex-direction: column; gap: 10px;"></div>
    `;

    const executeSearch = async (query) => {
      const resultsContainer = searchBox.querySelector('#trace-results-container');
      if (!query) {
        resultsContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">Enter a term to search the AST index.</p>';
        return;
      }

      resultsContainer.innerHTML = '<p style="color: var(--accent-cyan); font-size: 0.85rem; font-family: var(--font-mono);">Tracing symbols across index...</p>';

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        const results = data.results || [];

        if (results.length === 0) {
          resultsContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No traces found for "<strong>${query}</strong>".</p>`;
          return;
        }

        resultsContainer.innerHTML = results.map(r => `
          <div class="timeline-node" style="border-left-color: ${r.type === 'class' ? 'var(--accent-cyan)' : r.type === 'function' ? 'var(--accent-neural)' : 'var(--accent-amber)'};">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="timeline-hash" style="color: ${r.type === 'class' ? 'var(--accent-cyan)' : 'var(--accent-neural)'}; background-color: ${r.type === 'class' ? 'var(--accent-cyan-dim)' : 'var(--accent-neural-dim)'}; text-transform: uppercase;">
                  ${r.type || 'SYMBOL'}
                </span>
                <span style="font-weight: 700; color: var(--text-primary); font-family: var(--font-mono);">${r.name || r.relativePath}</span>
                <span style="font-size: 0.78rem; color: var(--accent-cyan); font-family: var(--font-mono);">${r.relativePath}${r.line ? ':' + r.line : ''}</span>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;">
                ${r.signature || 'Matched AST symbol definition in ' + r.relativePath}
              </div>
            </div>
            <span class="landing-card-badge" style="color: var(--success); border-color: var(--success);">MATCH: 100%</span>
          </div>
        `).join('');
      } catch (err) {
        resultsContainer.innerHTML = `<p style="color: var(--danger); font-size: 0.85rem;">Failed to execute search: ${err.message}</p>`;
      }
    };

    const input = searchBox.querySelector('#forensic-search-input');
    const btn = searchBox.querySelector('#btn-run-trace');

    btn.addEventListener('click', () => executeSearch(input.value.trim()));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeSearch(input.value.trim());
    });

    // Execute initial trace
    executeSearch(input.value.trim());

    container.appendChild(searchBox);
    return container;
  }
}
