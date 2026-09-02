import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Feature Map View
 * Groups files into recognizable functional capabilities
 */
export class FeatureMapView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Feature-to-Code Mapping',
      description: 'Heuristic classification of source files into functional subsystems and product capabilities.',
      badge: 'Feature Topology'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '🗺️',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a repository to map code to features.'
      }).render());
      return container;
    }

    const card = document.createElement('div');
    card.className = 'landing-card';

    card.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>🗺️</span>
          <span>Identified Feature Subsystems</span>
        </h3>
        <span class="landing-card-badge">Static Classification</span>
      </div>
      <div id="feature-clusters-container" style="margin-top: 14px; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
        <p style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.85rem;">Clustering functional capabilities...</p>
      </div>
    `;

    const loadFeatures = async () => {
      const el = card.querySelector('#feature-clusters-container');
      try {
        const res = await fetch('/api/features');
        const data = await res.json();
        const features = data.features || [];

        el.innerHTML = features.map(f => `
          <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: 800; color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.9rem;">${f.category}</span>
              <span class="landing-card-badge">${f.count} files</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              ${f.files.map(file => `
                <span style="font-family: var(--font-mono); font-size: 0.76rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  • ${file}
                </span>
              `).join('')}
            </div>
          </div>
        `).join('');
      } catch (err) {
        el.innerHTML = `<p style="color: var(--danger); font-size: 0.85rem;">Failed to load features: ${err.message}</p>`;
      }
    };

    loadFeatures();
    container.appendChild(card);
    return container;
  }
}
