import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Architecture View
 * Visual dependency topology and subsystem interaction map
 */
export class ArchitectureView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
    this.currentType = 'module';
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Architecture & Dependency Topology',
      description: 'Interactive structural maps of modules, subsystems, and dependency relationships.',
      badge: 'Graph Engine'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '🕸️',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository from the Central Telemetry overview to inspect its subsystem architecture map.'
      }).render());
      return container;
    }

    const card = document.createElement('div');
    card.className = 'landing-card';

    card.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>🕸️</span>
          <span>Archaeological Dependency Topology</span>
        </h3>
        <div style="display: flex; gap: 8px;">
          <button class="btn-secondary" id="btn-toggle-module" style="padding: 4px 10px; font-size: 0.75rem;">Module Graph</button>
          <button class="btn-secondary" id="btn-toggle-class" style="padding: 4px 10px; font-size: 0.75rem;">Class Diagram</button>
        </div>
      </div>

      <div id="diagram-container" style="background: var(--bg-input); border: 1px solid var(--border-holo); border-radius: 8px; padding: 20px; font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.6; color: var(--text-secondary); margin-top: 10px; overflow-x: auto; max-height: 440px;">
        Loading diagram...
      </div>

      <div style="display: flex; gap: 12px; margin-top: 14px;">
        <button class="btn-primary" id="btn-export-diagram">
          <span>📊</span>
          <span>EXPORT ARCHITECTURE REPORT (MARKDOWN)</span>
        </button>
      </div>
    `;

    const loadDiagram = async (type = 'module') => {
      const el = card.querySelector('#diagram-container');
      el.innerHTML = '<span style="color: var(--accent-cyan);">Generating Mermaid diagram topology...</span>';
      try {
        const res = await fetch(`/api/diagram?type=${type}`);
        const data = await res.json();
        el.innerHTML = `<pre style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.8rem; white-space: pre-wrap;">${data.diagram || 'No diagram generated'}</pre>`;
      } catch (err) {
        el.innerHTML = `<span style="color: var(--danger);">Failed to load diagram: ${err.message}</span>`;
      }
    };

    card.querySelector('#btn-toggle-module').addEventListener('click', () => loadDiagram('module'));
    card.querySelector('#btn-toggle-class').addEventListener('click', () => loadDiagram('class'));
    card.querySelector('#btn-export-diagram').addEventListener('click', () => {
      window.open('/api/export?format=markdown', '_blank');
    });

    loadDiagram('module');

    container.appendChild(card);
    return container;
  }
}
