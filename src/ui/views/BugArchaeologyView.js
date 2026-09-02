import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Bug Archaeology View
 * Searches historical Git commits for fix, bug, patch, and regression markers
 */
export class BugArchaeologyView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Bug Archaeology & Defect History',
      description: 'Historical defect traces, regression commits, and instability signals extracted from Git history.',
      badge: 'Defect Tracer'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '🐛',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a repository to trace bug and defect history.'
      }).render());
      return container;
    }

    const card = document.createElement('div');
    card.className = 'landing-card';

    card.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>🐛</span>
          <span>Historical Fix & Defect Commits</span>
        </h3>
        <span class="landing-card-badge" id="bug-commits-badge">Scanning Git log...</span>
      </div>
      <div class="forensic-timeline" id="bug-commits-container" style="margin-top: 14px;">
        <p style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.85rem;">Searching commit messages for defect markers...</p>
      </div>
    `;

    const loadBugs = async () => {
      const el = card.querySelector('#bug-commits-container');
      const badge = card.querySelector('#bug-commits-badge');
      try {
        const res = await fetch('/api/bugs');
        const data = await res.json();
        const bugCommits = data.bugCommits || [];

        badge.textContent = `${bugCommits.length} / ${data.totalAnalyzedCommits} COMMITS`;

        if (bugCommits.length === 0) {
          el.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No bug/fix keywords detected in recent commit history.</p>';
          return;
        }

        el.innerHTML = bugCommits.map(c => `
          <div class="timeline-node" style="border-left-color: var(--accent-amber);">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="timeline-hash" style="color: var(--accent-amber); background-color: var(--accent-amber-dim);">${(c.hash || '').substring(0, 7) || 'FIX'}</span>
                <span style="font-weight: 700; color: var(--text-primary); font-family: var(--font-mono);">${c.message}</span>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;">
                By ${c.author} • ${c.date}
              </div>
            </div>
            <span class="landing-card-badge" style="color: var(--accent-amber); border-color: var(--accent-amber);">BUG FIX</span>
          </div>
        `).join('');
      } catch (err) {
        el.innerHTML = `<p style="color: var(--danger); font-size: 0.85rem;">Failed to trace bug archaeology: ${err.message}</p>`;
      }
    };

    loadBugs();
    container.appendChild(card);
    return container;
  }
}
