import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Documentation View
 * Deterministic architecture documentation and module specifications generated from AST symbols
 */
export class DocumentationView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Architectural Documentation & Specifications',
      description: 'Deterministic codebase documentation, subsystem interfaces, and exported AST contracts.',
      badge: 'Auto-Doc Generator'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '📖',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository to generate deterministic architectural documentation.'
      }).render());
      return container;
    }

    const docCard = document.createElement('div');
    docCard.className = 'landing-card';

    docCard.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>📖</span>
          <span>Subsystem Specifications & API Contracts</span>
        </h3>
        <button class="btn-primary" id="btn-export-docs" style="padding: 6px 14px; font-size: 0.78rem;">
          <span>📥</span>
          <span>EXPORT DOCS (MD)</span>
        </button>
      </div>

      <div id="docs-content-container" style="margin-top: 14px;">
        <p style="color: var(--accent-cyan); font-size: 0.85rem; font-family: var(--font-mono);">Generating architectural documentation...</p>
      </div>
    `;

    const loadDocs = async () => {
      const contentEl = docCard.querySelector('#docs-content-container');
      try {
        const res = await fetch('/api/docs');
        const data = await res.json();
        const modules = data.modules || [];

        if (modules.length === 0) {
          contentEl.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No module packages identified in this repository.</p>';
          return;
        }

        contentEl.innerHTML = modules.map(m => `
          <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 18px; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-weight: 800; color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.95rem;">📁 ${m.name}</span>
              <span class="landing-card-badge">${m.fileCount} Source Files</span>
            </div>
            <div style="margin-top: 10px; font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono);">
              Key Files: <span style="color: var(--text-primary);">${m.files.join(', ')}</span>
            </div>
            ${m.symbols && m.symbols.length > 0 ? `
              <div style="margin-top: 6px; font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono);">
                Exported AST Symbols: <span style="color: var(--accent-neural); font-weight: 600;">${m.symbols.join(', ')}</span>
              </div>
            ` : ''}
          </div>
        `).join('');
      } catch (err) {
        contentEl.innerHTML = `<p style="color: var(--danger);">Failed to load documentation: ${err.message}</p>`;
      }
    };

    docCard.querySelector('#btn-export-docs').addEventListener('click', () => {
      window.open('/api/export?format=markdown', '_blank');
    });

    loadDocs();

    container.appendChild(docCard);
    return container;
  }
}
