import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Contributors View
 * Author ownership distribution and commit chronology dynamically fetched from active repository
 */
export class ContributorsView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Contributors & Code Ownership',
      description: 'Author impact distribution, commit frequency, and subsystem ownership breakdown.',
      badge: 'Ownership Telemetry'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '👥',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository from the Central Telemetry overview to inspect contributor ownership.'
      }).render());
      return container;
    }

    const card = document.createElement('div');
    card.className = 'landing-card';

    card.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>👥</span>
          <span>Lead Contributors & Authors</span>
        </h3>
        <span class="landing-card-badge">Author Matrix</span>
      </div>
      <div class="forensic-timeline" id="contributors-list-container" style="margin-top: 12px;">
        <p style="color: var(--accent-cyan); font-size: 0.85rem; font-family: var(--font-mono);">Loading contributor telemetry...</p>
      </div>
    `;

    const loadContributors = async () => {
      const el = card.querySelector('#contributors-list-container');
      try {
        const res = await fetch('/api/repository/git');
        const data = await res.json();
        const contributors = data.contributors || [];

        if (contributors.length === 0) {
          el.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No contributor data found in active git repository.</p>';
          return;
        }

        const totalCommits = contributors.reduce((acc, c) => acc + (c.commitCount || c.commits || 1), 0) || 1;

        el.innerHTML = contributors.map(c => {
          const commits = c.commitCount || c.commits || 1;
          const pct = Math.round((commits / totalCommits) * 100);

          return `
            <div class="timeline-node" style="border-left-color: var(--accent-cyan);">
              <div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 1.2rem;">👤</span>
                  <span style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">${c.name || 'Author'}</span>
                  <span class="landing-card-badge" style="color: var(--accent-cyan); border-color: var(--accent-cyan);">CONTRIBUTOR</span>
                </div>
                <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px; font-family: var(--font-mono);">
                  ${c.email || 'Author in Git log'} • ${commits} recorded commits
                </div>
              </div>
              <div style="text-align: right; font-family: var(--font-mono);">
                <div style="color: var(--accent-cyan); font-weight: 800; font-size: 1rem;">${pct}%</div>
                <div style="font-size: 0.72rem; color: var(--text-muted);">CODE SHARE</div>
              </div>
            </div>
          `;
        }).join('');
      } catch (err) {
        el.innerHTML = `<p style="color: var(--danger);">Failed to load contributors: ${err.message}</p>`;
      }
    };

    loadContributors();

    container.appendChild(card);
    return container;
  }
}
