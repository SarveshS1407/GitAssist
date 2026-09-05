import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * TechDebtView
 * Visualizes SQALE technical debt metrics, remediation costs, and prioritized refactoring targets
 */
export class TechDebtView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Technical Debt & Remediation Cost',
      description: 'SQALE-aligned structural estimation of refactoring debt in engineering hours and remediation financial cost.',
      badge: 'SQALE Engine'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '⏱️',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository to calculate technical debt and remediation hours.'
      }).render());
      return container;
    }

    const card = document.createElement('div');
    card.className = 'landing-card';
    card.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>⏱️</span>
          <span>Technical Debt Matrix</span>
        </h3>
        <span class="landing-card-badge" id="techdebt-status-badge">Computing Debt...</span>
      </div>
      <div id="techdebt-content-container" style="margin-top: 14px;">
        <p style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.85rem;">Calculating SQALE refactoring hours...</p>
      </div>
    `;
    container.appendChild(card);

    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
      this.loadData(card);
    }

    return container;
  }

  async loadData(card) {
    const statusBadge = card.querySelector('#techdebt-status-badge');
    const content = card.querySelector('#techdebt-content-container');

    try {
      const res = await fetch('/api/analysis/tech-debt');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const { totalDebtHours = 0, remediationCostUsd = 0, sqaleRating = 'A', debtBreakdown = {}, topDebtFiles = [] } = data;

      if (statusBadge) {
        statusBadge.textContent = `SQALE Grade ${sqaleRating} • ${totalDebtHours}h Debt`;
        statusBadge.style.color = (sqaleRating === 'A' || sqaleRating === 'B') ? 'var(--success)' : 'var(--warning)';
      }

      const summaryHtml = `
        <div style="display: flex; gap: 14px; margin-bottom: 20px; flex-wrap: wrap;">
          <div class="stat-pill">
            Grade <strong style="color: #00f0ff;">${sqaleRating}</strong>
          </div>
          <div class="stat-pill">
            <strong>${totalDebtHours}h</strong> Total Debt
          </div>
          <div class="stat-pill">
            Est. Cost: <strong style="color: #38bdf8;">$${remediationCostUsd.toLocaleString()}</strong>
          </div>
        </div>
      `;

      const breakdownHtml = `
        <div style="margin-bottom: 24px; background: rgba(0,0,0,0.3); padding: 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
          <h4 style="font-family: var(--font-cyber); font-size: 0.88rem; color: #cbd5e1; margin-bottom: 12px;">
            Debt Hours Breakdown by Dimension
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; font-family: var(--font-mono); font-size: 0.78rem;">
            <div>Complexity: <strong style="color: #f1f5f9;">${debtBreakdown.complexityHours || 0}h</strong></div>
            <div>Architecture: <strong style="color: #f1f5f9;">${debtBreakdown.architectureHours || 0}h</strong></div>
            <div>Duplication: <strong style="color: #f1f5f9;">${debtBreakdown.duplicationHours || 0}h</strong></div>
            <div>Hotspots: <strong style="color: #f1f5f9;">${debtBreakdown.hotspotHours || 0}h</strong></div>
          </div>
        </div>
      `;

      const targetsHtml = topDebtFiles.length === 0
        ? `<div style="padding: 18px; text-align: center; color: var(--success); font-family: var(--font-mono); background: rgba(16, 185, 129, 0.08); border-radius: 8px;">
             ✨ Outstanding code hygiene. No high-debt modules identified!
           </div>`
        : `
          <div>
            <h4 style="font-family: var(--font-cyber); font-size: 0.95rem; color: #f1f5f9; margin-bottom: 12px;">
              Priority Refactoring Targets
            </h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${topDebtFiles.map(f => `
                <div class="card p-3" style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-left: 3px solid #38bdf8; border-radius: 8px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <strong style="color: #f1f5f9; font-family: var(--font-mono); font-size: 0.82rem;">📁 ${f.file}</strong>
                    <span style="color: #38bdf8; font-family: var(--font-mono); font-size: 0.76rem; font-weight: 700;">+${f.hours}h debt</span>
                  </div>
                  <ul style="margin: 0; padding-left: 18px; font-size: 0.76rem; color: #94a3b8; font-family: var(--font-display);">
                    ${f.issues.map(i => `<li>${i}</li>`).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>
        `;

      content.innerHTML = summaryHtml + breakdownHtml + targetsHtml;
    } catch (err) {
      if (statusBadge) statusBadge.textContent = 'Failed';
      content.innerHTML = `<p style="color: var(--danger); font-size: 0.85rem;">Error: ${err.message}</p>`;
    }
  }
}
