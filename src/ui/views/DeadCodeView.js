import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Dead Code Signals View
 * Highlights unimported/isolated source files with 0 internal dependencies
 */
export class DeadCodeView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Dead & Isolated Code Signals',
      description: 'Heuristic identification of isolated source files with zero internal import linkages.',
      badge: 'Pruning Telemetry'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '🍂',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a repository to detect isolated code.'
      }).render());
      return container;
    }

    const card = document.createElement('div');
    card.className = 'landing-card';

    card.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>🍂</span>
          <span>Potentially Isolated Modules</span>
        </h3>
        <span class="landing-card-badge" id="dead-code-badge">Analyzing DAG...</span>
      </div>
      <div class="forensic-timeline" id="dead-code-container" style="margin-top: 14px;">
        <p style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.85rem;">Checking for isolated dependency graph nodes...</p>
      </div>
      <div style="margin-top: 12px; font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">
        * Note: These are heuristic signals. Files may be dynamically loaded or standalone entry points. Never automatically delete without inspection.
      </div>
    `;

    const loadDeadCode = async () => {
      const el = card.querySelector('#dead-code-container');
      const badge = card.querySelector('#dead-code-badge');
      try {
        const res = await fetch('/api/deadcode');
        const data = await res.json();
        const candidates = data.candidates || [];

        badge.textContent = `${candidates.length} CANDIDATES`;

        if (candidates.length === 0) {
          el.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">All non-entry source files are actively referenced within the dependency graph.</p>';
          return;
        }

        el.innerHTML = candidates.map(c => `
          <div class="timeline-node" style="border-left-color: var(--accent-amber);">
            <div>
              <span style="font-weight: 700; color: var(--text-primary); font-family: var(--font-mono);">${c.file}</span>
              <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;">
                ${c.reason}
              </div>
            </div>
            <span class="landing-card-badge">POTENTIALLY UNUSED</span>
          </div>
        `).join('');
      } catch (err) {
        el.innerHTML = `<p style="color: var(--danger); font-size: 0.85rem;">Failed to detect isolated code: ${err.message}</p>`;
      }
    };

    loadDeadCode();
    container.appendChild(card);
    return container;
  }
}
