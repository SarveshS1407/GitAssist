import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * BusFactorView
 * Visualizes project bus factor, developer ownership silos, and module concentration risks
 */
export class BusFactorView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Bus Factor & Knowledge Silos',
      description: 'Quantifies organizational resilience, single-developer ownership silos, and module risk concentrations.',
      badge: 'Resilience Telemetry'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '👥',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository to calculate the Bus Factor and inspect developer ownership distribution.'
      }).render());
      return container;
    }

    const card = document.createElement('div');
    card.className = 'landing-card';
    card.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>👥</span>
          <span>Knowledge Silos & Maintainer Distribution</span>
        </h3>
        <span class="landing-card-badge" id="busfactor-status-badge">Analyzing Commits...</span>
      </div>
      <div id="busfactor-content-container" style="margin-top: 14px;">
        <p style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.85rem;">Tracing author commits across directory trees...</p>
      </div>
    `;
    container.appendChild(card);

    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
      this.loadData(card);
    }

    return container;
  }

  async loadData(card) {
    const statusBadge = card.querySelector('#busfactor-status-badge');
    const content = card.querySelector('#busfactor-content-container');

    try {
      const res = await fetch('/api/repository/git/bus-factor');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const { overallBusFactor = 1, riskLevel = 'LOW', totalAuthors = 0, siloCount = 0, silos = [], directoryBreakdown = [] } = data;

      if (statusBadge) {
        statusBadge.textContent = `Bus Factor: ${overallBusFactor} (${riskLevel} Risk)`;
        statusBadge.style.color = riskLevel === 'CRITICAL' ? 'var(--danger)' : riskLevel === 'HIGH' ? '#f97316' : 'var(--success)';
      }

      const metricsHtml = `
        <div style="display: flex; gap: 14px; margin-bottom: 20px; flex-wrap: wrap;">
          <div class="stat-pill" style="border-color: ${overallBusFactor <= 2 ? 'var(--danger)' : 'var(--success)'};">
            <strong>${overallBusFactor}</strong> Project Bus Factor
          </div>
          <div class="stat-pill"><strong>${totalAuthors}</strong> Active Authors</div>
          <div class="stat-pill" style="border-color: ${siloCount > 0 ? '#f97316' : 'rgba(255,255,255,0.1)'};">
            <strong>${siloCount}</strong> Knowledge Silos
          </div>
        </div>
      `;

      const silosHtml = silos.length === 0
        ? `<div style="padding: 18px; text-align: center; color: var(--success); font-family: var(--font-mono); background: rgba(16, 185, 129, 0.08); border-radius: 8px; margin-bottom: 20px;">
             ✨ No single-maintainer silos detected. Knowledge is healthy and cross-pollinated!
           </div>`
        : `
          <div style="margin-bottom: 24px;">
            <h4 style="font-family: var(--font-cyber); font-size: 0.95rem; color: #f87171; margin-bottom: 12px;">
              ⚠️ High Risk Ownership Silos (>80% Single Maintainer)
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
              ${silos.map(s => `
                <div class="card p-3" style="background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(248, 113, 113, 0.3); border-radius: 8px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <strong style="color: #cbd5e1; font-size: 0.85rem;">${s.module}</strong>
                    <span style="color: var(--danger); font-family: var(--font-mono); font-size: 0.76rem; font-weight: 700;">
                      ${s.ownershipPercentage}%
                    </span>
                  </div>
                  <div style="font-size: 0.78rem; color: #94a3b8; font-family: var(--font-mono);">
                    Dominant: <span style="color: #00f0ff;">${s.soleMaintainer}</span> (${s.edits} commits)
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;

      const breakdownHtml = `
        <div>
          <h4 style="font-family: var(--font-cyber); font-size: 0.95rem; color: #f1f5f9; margin-bottom: 12px;">
            Directory Ownership Distribution
          </h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${directoryBreakdown.slice(0, 15).map(d => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(0,0,0,0.3); border-radius: 6px; border: 1px solid rgba(255,255,255,0.06); font-family: var(--font-mono); font-size: 0.78rem;">
                <span style="color: #cbd5e1; width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  📁 ${d.directory}
                </span>
                <span style="color: #94a3b8;">
                  Top: <strong style="color: #38bdf8;">${d.dominantAuthor || 'N/A'}</strong> (${d.ownershipPercentage}%)
                </span>
                <span style="color: #64748b;">${d.totalEdits} edits</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      content.innerHTML = metricsHtml + silosHtml + breakdownHtml;
    } catch (err) {
      if (statusBadge) statusBadge.textContent = 'Analysis Failed';
      content.innerHTML = `<p style="color: var(--danger); font-size: 0.85rem;">Error: ${err.message}</p>`;
    }
  }
}
