import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Review View
 * Automated heuristic code review signals (Large files, high complexity, TODOs, circular coupling)
 */
export class ReviewView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Automated Heuristic Code Review',
      description: 'Algorithmic structural audit for maintainability bottlenecks, oversized modules, and complexity hotspots.',
      badge: 'Audit Engine'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '🛡️',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository to execute the automated heuristic code review audit.'
      }).render());
      return container;
    }

    const reviewCard = document.createElement('div');
    reviewCard.className = 'landing-card';

    reviewCard.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>🛡️</span>
          <span>Heuristic Code Quality Findings</span>
        </h3>
        <span class="landing-card-badge" id="review-health-badge">Auditing...</span>
      </div>

      <div class="forensic-timeline" id="review-findings-container" style="margin-top: 14px;">
        <p style="color: var(--accent-cyan); font-size: 0.85rem; font-family: var(--font-mono);">Running heuristic structural audit...</p>
      </div>

      <div style="margin-top: 16px; font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">
        * Note: These findings are heuristic automated signals designed to assist human architectural reviews.
      </div>
    `;

    const loadReview = async () => {
      const containerEl = reviewCard.querySelector('#review-findings-container');
      const badgeEl = reviewCard.querySelector('#review-health-badge');

      try {
        const res = await fetch('/api/review');
        const data = await res.json();
        const findings = data.findings || [];

        badgeEl.textContent = `HEALTH SCORE: ${data.healthScore || 95}/100`;
        badgeEl.style.color = (data.healthScore >= 80) ? 'var(--success)' : 'var(--accent-amber)';
        badgeEl.style.borderColor = (data.healthScore >= 80) ? 'var(--success)' : 'var(--accent-amber)';

        if (findings.length === 0) {
          containerEl.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No critical architectural smells detected.</p>';
          return;
        }

        containerEl.innerHTML = findings.map(f => {
          const color = f.severity === 'HIGH' ? 'var(--danger)' : f.severity === 'MEDIUM' ? 'var(--accent-amber)' : 'var(--accent-cyan)';
          const dim = f.severity === 'HIGH' ? 'var(--danger-dim)' : f.severity === 'MEDIUM' ? 'var(--accent-amber-dim)' : 'var(--accent-cyan-dim)';

          return `
            <div class="timeline-node" style="border-left-color: ${color};">
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="timeline-hash" style="color: ${color}; background-color: ${dim};">${f.severity} // ${f.category}</span>
                  <span style="font-weight: 700; color: var(--text-primary); font-family: var(--font-mono);">${f.file}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px; line-height: 1.45;">
                  ${f.message}
                </div>
              </div>
            </div>
          `;
        }).join('');
      } catch (err) {
        containerEl.innerHTML = `<p style="color: var(--danger);">Failed to execute review: ${err.message}</p>`;
      }
    };

    loadReview();

    container.appendChild(reviewCard);
    return container;
  }
}
