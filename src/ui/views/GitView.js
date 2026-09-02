import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Git Archaeology View
 * Interactive timeline of historical Git commits and churn traces
 */
export class GitView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Git Archaeology Timeline',
      description: 'Historical commit lineage, author chronology, and code churn telemetry.',
      badge: 'Read-Only Git'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '📜',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository from the Central Telemetry overview to inspect its historical commit timeline.'
      }).render());
      return container;
    }

    const panel = document.createElement('div');
    panel.className = 'landing-card';

    panel.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>📜</span>
          <span>Archaeological Commit Stream (Branch: ${this.repositoryState.summary?.branch || 'main'})</span>
        </h3>
        <span class="landing-card-badge">Live Git Lineage</span>
      </div>
      <div class="forensic-timeline" id="git-commits-container" style="margin-top: 12px;">
        <p style="color: var(--accent-cyan); font-size: 0.85rem; font-family: var(--font-mono);">Loading commit lineage...</p>
      </div>
    `;

    const loadCommits = async () => {
      const el = panel.querySelector('#git-commits-container');
      try {
        const res = await fetch('/api/repository/git');
        const data = await res.json();
        const commits = data.commits || [];

        if (commits.length === 0) {
          el.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No commit history recorded or empty git repository.</p>';
          return;
        }

        el.innerHTML = commits.slice(0, 30).map(c => `
          <div class="timeline-node">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="timeline-hash">${(c.hash || '').substring(0, 7) || 'HEAD'}</span>
              <div>
                <div class="timeline-msg">${c.message || 'No commit message'}</div>
                <div class="timeline-meta" style="margin-top: 4px;">
                  Author: <span style="color: var(--text-primary); font-weight: 600;">${c.author || 'Unknown'}</span> • ${c.date || 'Recent'}
                </div>
              </div>
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--success); font-weight: 700; white-space: nowrap;">
              ${c.filesCount ? c.filesCount + ' files' : 'Active'}
            </div>
          </div>
        `).join('');
      } catch (err) {
        el.innerHTML = `<p style="color: var(--danger); font-size: 0.85rem;">Failed to fetch commits: ${err.message}</p>`;
      }
    };

    loadCommits();

    container.appendChild(panel);
    return container;
  }
}
