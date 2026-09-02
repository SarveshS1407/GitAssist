import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Risk Map View
 * Measured codebase risk scores based on change frequency, centrality, and file volume
 */
export class RiskView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Codebase Risk Map',
      description: 'Quantified structural risk scores based on change frequency, dependency centrality, and complexity.',
      badge: 'Risk Telemetry'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '⚡',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a repository to generate the structural risk score map.'
      }).render());
      return container;
    }

    const card = document.createElement('div');
    card.className = 'landing-card';

    card.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>⚡</span>
          <span>Risk Ranking Matrix</span>
        </h3>
        <span class="landing-card-badge">Measurable Signals</span>
      </div>
      <div class="forensic-timeline" id="risk-ranking-container" style="margin-top: 14px;">
        <p style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.85rem;">Calculating structural risk rankings...</p>
      </div>
    `;

    const loadRisk = async () => {
      const el = card.querySelector('#risk-ranking-container');
      try {
        const res = await fetch('/api/risk');
        const data = await res.json();
        const ranking = data.riskRanking || [];

        if (ranking.length === 0) {
          el.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No elevated risk hotspots identified.</p>';
          return;
        }

        el.innerHTML = ranking.map(r => {
          const color = r.level === 'HIGH' ? 'var(--danger)' : r.level === 'MEDIUM' ? 'var(--accent-amber)' : 'var(--success)';
          const dim = r.level === 'HIGH' ? 'var(--danger-dim)' : r.level === 'MEDIUM' ? 'var(--accent-amber-dim)' : 'var(--success-dim)';

          return `
            <div class="timeline-node" style="border-left-color: ${color};">
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="timeline-hash" style="color: ${color}; background-color: ${dim};">${r.level} RISK</span>
                  <span style="font-weight: 700; color: var(--text-primary); font-family: var(--font-mono);">${r.file}</span>
                </div>
                <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;">
                  ${r.churn} churn commits • ${r.loc} LOC
                </div>
              </div>
              <div style="font-family: var(--font-mono); font-weight: 900; font-size: 1.1rem; color: ${color};">
                ${r.score}%
              </div>
            </div>
          `;
        }).join('');
      } catch (err) {
        el.innerHTML = `<p style="color: var(--danger); font-size: 0.85rem;">Failed to load risk map: ${err.message}</p>`;
      }
    };

    loadRisk();
    container.appendChild(card);
    return container;
  }
}
