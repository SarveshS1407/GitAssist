import { LandingView } from './LandingView.js';

/**
 * Overview View
 * Displays repository summary, language distribution, and high-level health
 */
export class OverviewView {
  constructor({ repositoryState, onOpenRepository }) {
    this.repositoryState = repositoryState;
    this.onOpenRepository = onOpenRepository;
  }

  render() {
    // If no repository is active, render LandingView
    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      return new LandingView({ onOpenRepository: this.onOpenRepository }).render();
    }

    const container = document.createElement('div');
    container.className = 'view-container';

    container.innerHTML = `
      <div class="view-header">
        <h1 class="view-title">Overview</h1>
        <p class="view-description">High-level codebase health, language distributions, and repository summary.</p>
      </div>

      <div class="placeholder-card">
        <div style="font-size: 2rem;">📊</div>
        <h3>Repository Overview</h3>
        <p>Active Repository: <code>${this.repositoryState.repositoryName || 'None'}</code></p>
        <span class="landing-card-badge" style="color: var(--accent-primary); border: 1px solid var(--border-default);">
          Feature Stage: Ready for Data Integration
        </span>
      </div>
    `;

    return container;
  }
}
