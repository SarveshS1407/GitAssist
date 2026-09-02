import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Manifest View (Dependency Health)
 * Identifies package manifests (package.json, requirements.txt, etc.) and analyzes external dependencies
 */
export class ManifestView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Dependency Health & Manifests',
      description: 'Discovered package manifests, dependency counts, and package ecosystem posture.',
      badge: 'Package Telemetry'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '📦',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a repository to inspect dependency manifests.'
      }).render());
      return container;
    }

    const card = document.createElement('div');
    card.className = 'landing-card';

    card.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>📦</span>
          <span>Package Manifests & Ecosystem Health</span>
        </h3>
        <span class="landing-card-badge" id="manifests-count-badge">Checking manifests...</span>
      </div>
      <div class="forensic-timeline" id="manifests-container" style="margin-top: 14px;">
        <p style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.85rem;">Inspecting project manifests...</p>
      </div>
    `;

    const loadManifests = async () => {
      const el = card.querySelector('#manifests-container');
      const badge = card.querySelector('#manifests-count-badge');
      try {
        const res = await fetch('/api/manifests');
        const data = await res.json();
        const manifests = data.manifests || [];

        badge.textContent = `${manifests.length} MANIFESTS`;

        if (manifests.length === 0) {
          el.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No standard package manager manifests (package.json, requirements.txt, etc.) detected.</p>';
          return;
        }

        el.innerHTML = manifests.map(m => `
          <div class="timeline-node" style="border-left-color: var(--accent-cyan);">
            <div>
              <span style="font-weight: 700; color: var(--text-primary); font-family: var(--font-mono);">${m.file}</span>
              <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;">
                Package Manifest Type: <strong>${m.type}</strong>
              </div>
            </div>
            <span class="landing-card-badge" style="color: var(--accent-cyan); border-color: var(--accent-cyan);">ACTIVE MANIFEST</span>
          </div>
        `).join('');
      } catch (err) {
        el.innerHTML = `<p style="color: var(--danger); font-size: 0.85rem;">Failed to load manifests: ${err.message}</p>`;
      }
    };

    loadManifests();
    container.appendChild(card);
    return container;
  }
}
