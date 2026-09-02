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

    const modules = [
      {
        name: 'src/core',
        role: 'Analytical & Parsing Engine Layer',
        description: 'Low-level AST symbol extraction, cyclomatic metrics calculation, circular dependency loop detection, and search indexing.',
        exports: ['RepositoryScanner', 'CodeParser', 'CodeMetrics', 'DependencyAnalyzer', 'CircularDependencyDetector', 'HotspotAnalyzer', 'SearchIndex']
      },
      {
        name: 'src/services',
        role: 'Orchestration & Git Integration Layer',
        description: 'Coordinates filesystem validation, local/remote cloning, AST ingestion, and read-only Git commit extraction.',
        exports: ['RepositoryService', 'GitService']
      },
      {
        name: 'src/api',
        role: 'Native HTTP REST Dispatcher',
        description: 'Zero-dependency Node.js HTTP server routing REST endpoints for status, search, metrics, diagrams, and static UI assets.',
        exports: ['ApiRouter']
      },
      {
        name: 'src/ui',
        role: 'Archaeological Holomap & Forensic UI',
        description: 'Reactive single-page application shell, cylindrical investigation carousel, and 10 specialized archaeological lenses.',
        exports: ['App', 'AppShell', 'Router', 'RepositoryState']
      }
    ];

    const moduleCardsHtml = modules.map(m => `
      <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 18px; margin-bottom: 14px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 800; color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.95rem;">📁 ${m.name}</span>
          <span class="landing-card-badge">${m.role}</span>
        </div>
        <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 8px; line-height: 1.5;">
          ${m.description}
        </div>
        <div style="margin-top: 10px; font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono);">
          Exported Contracts: <span style="color: var(--text-primary); font-weight: 600;">${m.exports.join(', ')}</span>
        </div>
      </div>
    `).join('');

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

      <div style="margin-top: 14px;">
        ${moduleCardsHtml}
      </div>
    `;

    docCard.querySelector('#btn-export-docs').addEventListener('click', () => {
      window.open('/api/export?format=markdown', '_blank');
    });

    container.appendChild(docCard);
    return container;
  }
}
