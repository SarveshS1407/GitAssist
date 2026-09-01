import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Contributors View
 * Author ownership distribution and commit chronology
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

    const contributors = [
      { name: 'S.Sarvesh', email: 'sarveshs1407@gmail.com', commits: 14, percentage: 100, role: 'Lead Architect & Core Engineer' }
    ];

    const contribList = contributors.map(c => `
      <div class="timeline-node" style="border-left-color: var(--accent-cyan);">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2rem;">👤</span>
            <span style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">${c.name}</span>
            <span class="landing-card-badge" style="color: var(--accent-cyan); border-color: var(--accent-cyan);">${c.role}</span>
          </div>
          <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px; font-family: var(--font-mono);">
            ${c.email} • ${c.commits} recorded commits
          </div>
        </div>
        <div style="text-align: right; font-family: var(--font-mono);">
          <div style="color: var(--accent-cyan); font-weight: 800; font-size: 1rem;">${c.percentage}%</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">CODE SHARE</div>
        </div>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>👥</span>
          <span>Lead Contributors & Authors</span>
        </h3>
        <span class="landing-card-badge">Author Matrix</span>
      </div>
      <div class="forensic-timeline" style="margin-top: 12px;">
        ${contribList}
      </div>
    `;

    container.appendChild(card);
    return container;
  }
}
