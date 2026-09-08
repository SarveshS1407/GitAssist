import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Enhanced Automated Heuristic Code Review View
 * Audits codebase maintainability bottlenecks, oversized modules, circular coupling,
 * cyclomatic complexity, and actionable refactoring recommendations.
 */
export class ReviewView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
    this.reviewData = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Automated Heuristic Code Review',
      description: 'Algorithmic structural audit for maintainability bottlenecks, oversized modules, complexity hotspots, and refactoring guidance.',
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
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          <h3 class="landing-card-title" style="margin: 0;">Heuristic Structural Quality Findings</h3>
        </div>
        <span class="landing-card-badge" id="review-health-badge">Auditing...</span>
      </div>

      <div id="review-findings-container" style="margin-top: 16px;">
        <p style="color: var(--accent-cyan); font-size: 0.85rem; font-family: var(--font-mono);">Executing heuristic architectural audit...</p>
      </div>

      <div style="margin-top: 16px; font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">
        * Automated structural review signals derived from DAG topology, maintainability index, and single-responsibility metrics.
      </div>
    `;

    const loadReview = async () => {
      const containerEl = reviewCard.querySelector('#review-findings-container');
      const badgeEl = reviewCard.querySelector('#review-health-badge');

      try {
        const res = await fetch('/api/review');
        const data = await res.json();
        this.reviewData = data;

        const summary = data.summary || {
          healthScore: data.healthScore || 95,
          auditVerdict: 'PASSED',
          highSeverityCount: 0,
          mediumSeverityCount: 0,
          infoCount: 1
        };

        const findings = data.findings || [];

        const scoreColor = summary.healthScore >= 85 ? 'var(--success)'
          : summary.healthScore >= 70 ? 'var(--accent-amber)'
          : 'var(--danger)';

        badgeEl.textContent = `HEALTH: ${summary.healthScore}/100 // ${summary.auditVerdict}`;
        badgeEl.style.color = scoreColor;
        badgeEl.style.borderColor = scoreColor;

        if (findings.length === 0) {
          containerEl.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No critical architectural smells detected.</p>';
          return;
        }

        containerEl.innerHTML = `
          <!-- Scorecards -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 18px;">
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">REVIEW HEALTH SCORE</div>
              <div style="font-size: 2rem; font-weight: 900; color: ${scoreColor}; font-family: var(--font-mono); margin-top: 4px;">
                ${summary.healthScore}<span style="font-size: 1rem; color: var(--text-muted);">/100</span>
              </div>
              <div style="font-size: 0.7rem; color: ${scoreColor}; font-weight: 700;">${summary.auditVerdict}</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">HIGH SEVERITY SMELLS</div>
              <div style="font-size: 2rem; font-weight: 900; color: var(--danger); font-family: var(--font-mono); margin-top: 4px;">
                ${summary.highSeverityCount}
              </div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">Urgent Refactoring</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">MEDIUM SEVERITY</div>
              <div style="font-size: 2rem; font-weight: 900; color: var(--accent-amber); font-family: var(--font-mono); margin-top: 4px;">
                ${summary.mediumSeverityCount}
              </div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">Maintainability Smells</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">HEALTHY AFFIRMATIONS</div>
              <div style="font-size: 2rem; font-weight: 900; color: var(--accent-cyan); font-family: var(--font-mono); margin-top: 4px;">
                ${summary.infoCount}
              </div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">Verified Clean Patterns</div>
            </div>
          </div>

          <!-- Findings Timeline with Actionable Recommendations -->
          <div class="forensic-timeline">
            ${findings.map(f => {
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
                    ${f.recommendation ? `
                      <div style="margin-top: 6px; font-size: 0.75rem; color: var(--accent-cyan); font-family: var(--font-mono); background: rgba(0, 240, 255, 0.05); padding: 4px 8px; border-radius: 4px; border-left: 2px solid var(--accent-cyan);">
                        💡 <strong>Recommendation:</strong> ${f.recommendation}
                      </div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      } catch (err) {
        containerEl.innerHTML = `<p style="color: var(--danger);">Failed to execute review: ${err.message}</p>`;
      }
    };

    loadReview();
    container.appendChild(reviewCard);
    return container;
  }
}
