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

    const commits = [
      { hash: 'c19a06a', author: 'S.Sarvesh', date: 'Just now', msg: 'feat(ui): add remote URL detection and quick preset button to Open Repository dialog', changes: '+26 -3' },
      { hash: '85f713e', author: 'S.Sarvesh', date: '10m ago', msg: 'feat(backend): implement RepositoryService, read-only GitService, and connect full end-to-end repository entry flow', changes: '+534 -145' },
      { hash: '0bf7e1c', author: 'S.Sarvesh', date: '30m ago', msg: 'feat(ui): implement observable RepositoryState store and connect live Header badge', changes: '+215 -13' },
      { hash: 'c588530', author: 'S.Sarvesh', date: '1h ago', msg: 'feat(ui): extract reusable components (PageHeader, EmptyState, StatCard, LoadingState, ErrorState, Dialog, RepositoryBadge)', changes: '+677 -105' },
      { hash: '62a5470', author: 'S.Sarvesh', date: '2h ago', msg: 'test(ui): add static asset and route serving integration tests', changes: '+84 -0' }
    ];

    const commitListHtml = commits.map(c => `
      <div class="timeline-node">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="timeline-hash">${c.hash}</span>
          <div>
            <div class="timeline-msg">${c.msg}</div>
            <div class="timeline-meta" style="margin-top: 4px;">
              Author: <span style="color: var(--text-primary); font-weight: 600;">${c.author}</span> • ${c.date}
            </div>
          </div>
        </div>
        <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--success); font-weight: 700; white-space: nowrap;">
          ${c.changes}
        </div>
      </div>
    `).join('');

    panel.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>📜</span>
          <span>Archaeological Commit Stream (Branch: ${this.repositoryState.summary?.branch || 'main'})</span>
        </h3>
        <span class="landing-card-badge">Live Chronology</span>
      </div>
      <div class="forensic-timeline" style="margin-top: 12px;">
        ${commitListHtml}
      </div>
    `;

    container.appendChild(panel);
    return container;
  }
}
