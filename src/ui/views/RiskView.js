import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Enhanced Codebase Structural Risk Map & Quadrants View
 * Visualizes multi-factor risk, architectural quadrants (Critical Core, Fragile Hotspot,
 * Foundational Debt, Stable Leaf), and comprehensive blast radius factors.
 */
export class RiskView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
    this.riskData = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Codebase Structural Risk Map',
      description: 'Quantified multi-factor risk scores, architectural quadrant classification, and change fragility metrics.',
      badge: 'Risk Telemetry'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '⚡',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository to generate the multi-factor structural risk score map.'
      }).render());
      return container;
    }

    const card = document.createElement('div');
    card.className = 'landing-card';

    card.innerHTML = `
      <div class="landing-card-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <circle cx="12" cy="16" r="1" fill="currentColor"></circle>
          </svg>
          <h3 class="landing-card-title" style="margin: 0;">Multi-Factor Structural Risk Matrix</h3>
        </div>
        <span class="landing-card-badge" id="risk-posture-badge">Evaluating Graph...</span>
      </div>

      <div id="risk-ranking-container" style="margin-top: 16px;">
        <p style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.85rem;">Calculating structural centrality, churn, and volume risk scores...</p>
      </div>
    `;

    const loadRisk = async () => {
      const el = card.querySelector('#risk-ranking-container');
      const badge = card.querySelector('#risk-posture-badge');

      try {
        const res = await fetch('/api/risk');
        const data = await res.json();
        this.riskData = data;

        const summary = data.summary || {
          totalEvaluated: (data.riskRanking || []).length,
          highRiskCount: 0,
          avgRiskScore: 35,
          criticalCoreCount: 0,
          fragileHotspotCount: 0
        };

        const ranking = data.riskRanking || [];
        const quadrants = data.quadrants || {};

        const statusColor = summary.highRiskCount > 4 ? 'var(--danger)'
          : summary.highRiskCount > 1 ? 'var(--accent-amber)'
          : 'var(--success)';

        badge.textContent = `${summary.highRiskCount} HIGH RISK // AVG ${summary.avgRiskScore}%`;
        badge.style.color = statusColor;
        badge.style.borderColor = statusColor;

        if (ranking.length === 0) {
          el.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No elevated risk hotspots identified.</p>';
          return;
        }

        el.innerHTML = `
          <!-- Primary Scorecards -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 18px;">
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">AVERAGE RISK SCORE</div>
              <div style="font-size: 2rem; font-weight: 900; color: ${statusColor}; font-family: var(--font-mono); margin-top: 4px;">
                ${summary.avgRiskScore}<span style="font-size: 1rem; color: var(--text-muted);">%</span>
              </div>
              <div style="font-size: 0.7rem; color: ${statusColor}; font-weight: 700;">STRUCTURAL RISK</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">CRITICAL CORE FILES</div>
              <div style="font-size: 2rem; font-weight: 900; color: var(--danger); font-family: var(--font-mono); margin-top: 4px;">
                ${summary.criticalCoreCount || 0}
              </div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">High Churn + Centrality</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">FRAGILE HOTSPOTS</div>
              <div style="font-size: 2rem; font-weight: 900; color: var(--accent-amber); font-family: var(--font-mono); margin-top: 4px;">
                ${summary.fragileHotspotCount || 0}
              </div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">High Churn Leaf Modules</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">EVALUATED SOURCE FILES</div>
              <div style="font-size: 2rem; font-weight: 900; color: var(--accent-cyan); font-family: var(--font-mono); margin-top: 4px;">
                ${summary.totalEvaluated}
              </div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">Excluding Config & Tests</div>
            </div>
          </div>

          <!-- Architectural Quadrant Badges -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; margin-bottom: 18px;">
            <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 6px; padding: 10px 12px;">
              <div style="font-size: 0.72rem; font-weight: 700; color: var(--danger); font-family: var(--font-mono);">CRITICAL CORE (${(quadrants.CRITICAL_CORE || []).length})</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;">Heavily imported & frequently modified</div>
            </div>
            <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 6px; padding: 10px 12px;">
              <div style="font-size: 0.72rem; font-weight: 700; color: var(--accent-amber); font-family: var(--font-mono);">FRAGILE HOTSPOTS (${(quadrants.FRAGILE_HOTSPOT || []).length})</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;">High churn volatile logic</div>
            </div>
            <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 6px; padding: 10px 12px;">
              <div style="font-size: 0.72rem; font-weight: 700; color: var(--accent-neural); font-family: var(--font-mono);">FOUNDATIONAL DEBT (${(quadrants.FOUNDATIONAL_DEBT || []).length})</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;">High centrality but rarely changed</div>
            </div>
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 6px; padding: 10px 12px;">
              <div style="font-size: 0.72rem; font-weight: 700; color: var(--success); font-family: var(--font-mono);">STABLE LEAF (${(quadrants.STABLE_LEAF || []).length})</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;">Safe, isolated modules</div>
            </div>
          </div>

          <!-- Risk Ranking Timeline -->
          <div class="forensic-timeline">
            ${ranking.map(r => {
              const color = r.level === 'HIGH' ? 'var(--danger)' : r.level === 'MEDIUM' ? 'var(--accent-amber)' : 'var(--success)';
              const dim = r.level === 'HIGH' ? 'var(--danger-dim)' : r.level === 'MEDIUM' ? 'var(--accent-amber-dim)' : 'var(--success-dim)';

              return `
                <div class="timeline-node" style="border-left-color: ${color};">
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="timeline-hash" style="color: ${color}; background-color: ${dim};">${r.level} RISK</span>
                      <span style="font-weight: 700; color: var(--text-primary); font-family: var(--font-mono);">${r.file}</span>
                      <span style="font-size: 0.68rem; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 3px;">
                        ${r.quadrant || 'MODULE'}
                      </span>
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;">
                      ${r.churn} commits • ${r.dependentsCount || 0} callers • ${r.loc} LOC
                    </div>
                  </div>
                  <div style="font-family: var(--font-mono); font-weight: 900; font-size: 1.1rem; color: ${color};">
                    ${r.score}%
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      } catch (err) {
        el.innerHTML = `<p style="color: var(--danger); font-size: 0.85rem;">Failed to load risk map: ${err.message}</p>`;
      }
    };

    loadRisk();
    container.appendChild(card);
    return container;
  }
}
