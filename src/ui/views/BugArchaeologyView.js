import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Enhanced Bug Archaeology & Defect Intelligence View
 * Displays defect commit categories (security, crash, regression, perf, logic),
 * stability score gauge, and defect-prone module rankings.
 */
export class BugArchaeologyView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
    this.defectData = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Bug Archaeology & Defect Intelligence',
      description: 'Historical defect traces, regression commits, defect taxonomy classification, and defect hotspot rankings.',
      badge: 'Defect Tracer'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '🐛',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository to trace defect history and stability posture.'
      }).render());
      return container;
    }

    const card = document.createElement('div');
    card.className = 'landing-card';

    card.innerHTML = `
      <div class="landing-card-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="7" y="8" width="10" height="11" rx="4"></rect>
            <path d="M12 8V4m-5 9H3m18 0h-4M6 9l-3-2m18 0l-3 2m0 7l3 2m-18 0l3-2"></path>
          </svg>
          <h3 class="landing-card-title" style="margin: 0;">Historical Defect Taxonomy & Hotspots</h3>
        </div>
        <span class="landing-card-badge" id="bug-stability-badge">Analyzing Commits...</span>
      </div>

      <div id="bug-commits-container" style="margin-top: 16px;">
        <p style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.85rem;">Classifying defect commits and measuring module stability...</p>
      </div>
    `;

    const loadBugs = async () => {
      const el = card.querySelector('#bug-commits-container');
      const badge = card.querySelector('#bug-stability-badge');

      try {
        const res = await fetch('/api/bugs');
        const data = await res.json();
        this.defectData = data;

        const summary = data.summary || {
          stabilityRating: 'MODERATE',
          stabilityScore: 75,
          defectRatio: 0,
          totalDefectCommits: data.totalBugCommits || 0,
          totalAnalyzedCommits: data.totalAnalyzedCommits || 0,
          categories: {}
        };

        const ratingColor = summary.stabilityRating === 'EXCELLENT' ? 'var(--success)'
          : summary.stabilityRating === 'MODERATE' ? 'var(--accent-amber)'
          : 'var(--danger)';

        badge.textContent = `${summary.stabilityRating} // ${summary.stabilityScore}/100`;
        badge.style.color = ratingColor;
        badge.style.borderColor = ratingColor;

        const categories = summary.categories || {};

        el.innerHTML = `
          <!-- Scorecard Deck -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 18px;">
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">STABILITY POSTURE</div>
              <div style="font-size: 2rem; font-weight: 900; color: ${ratingColor}; font-family: var(--font-mono); margin-top: 4px;">
                ${summary.stabilityScore}<span style="font-size: 1rem; color: var(--text-muted);">/100</span>
              </div>
              <div style="font-size: 0.7rem; color: ${ratingColor}; font-weight: 700;">${summary.stabilityRating}</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">DEFECT COMMITS</div>
              <div style="font-size: 2rem; font-weight: 900; color: var(--danger); font-family: var(--font-mono); margin-top: 4px;">
                ${summary.totalDefectCommits}
              </div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">${summary.defectRatio}% Defect Ratio</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">SECURITY FIXES</div>
              <div style="font-size: 2rem; font-weight: 900; color: var(--accent-amber); font-family: var(--font-mono); margin-top: 4px;">
                ${categories.SECURITY_FIX || 0}
              </div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">CVE & Sanitization</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">CRASH FIXES</div>
              <div style="font-size: 2rem; font-weight: 900; color: var(--accent-cyan); font-family: var(--font-mono); margin-top: 4px;">
                ${categories.CRASH_FIX || 0}
              </div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">Null/Panic Handlers</div>
            </div>
          </div>

          <!-- Two-Column Grid: Defect Hotspots and Defect Commit Timeline -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
            <!-- Left: Defect Hotspots -->
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-weight: 700; color: var(--danger); font-family: var(--font-mono); font-size: 0.82rem;">
                  🔥 DEFECT-PRONE MODULES
                </span>
                <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">
                  ${(data.defectHotspots || []).length} modules
                </span>
              </div>
              ${(data.defectHotspots || []).length > 0 ? `
                <div style="max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
                  ${data.defectHotspots.map(h => {
                    const riskBadge = h.risk === 'CRITICAL' ? 'var(--danger)' : h.risk === 'HIGH' ? 'var(--accent-amber)' : 'var(--accent-cyan)';
                    return `
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: rgba(255,255,255,0.02); border-radius: 4px; font-family: var(--font-mono); font-size: 0.78rem;">
                        <span style="color: var(--text-primary);">${h.file}</span>
                        <span style="background: rgba(255,255,255,0.08); color: ${riskBadge}; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem; font-weight: 700;">
                          ${h.defectCount} bug fix(es)
                        </span>
                      </div>
                    `;
                  }).join('')}
                </div>
              ` : `
                <div style="color: var(--success); font-size: 0.82rem; font-family: var(--font-mono); padding: 12px 0;">
                  No recurring defect modules flagged.
                </div>
              `}
            </div>

            <!-- Right: Classified Defect Timeline -->
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-weight: 700; color: var(--accent-amber); font-family: var(--font-mono); font-size: 0.82rem;">
                  🐛 CLASSIFIED DEFECT TIMELINE
                </span>
                <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">
                  ${(data.bugCommits || []).length} commits
                </span>
              </div>
              <div style="max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
                ${(data.bugCommits || []).map(c => `
                  <div style="background: rgba(0,0,0,0.25); border-left: 3px solid var(--accent-amber); padding: 8px 10px; border-radius: 0 4px 4px 0; font-family: var(--font-mono); font-size: 0.78rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div>
                        <span style="color: var(--accent-amber); font-weight: 700;">${c.shortHash || (c.hash || '').substring(0, 7)}</span>
                        <span style="color: var(--text-primary); margin-left: 6px;">${c.message}</span>
                      </div>
                      <span style="font-size: 0.68rem; color: var(--accent-cyan); background: rgba(0,240,255,0.08); padding: 2px 6px; border-radius: 3px;">
                        ${c.category || 'BUG_FIX'}
                      </span>
                    </div>
                    <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">
                      By ${c.author} • ${c.date}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      } catch (err) {
        el.innerHTML = `<p style="color: var(--danger); font-size: 0.85rem;">Failed to trace bug archaeology: ${err.message}</p>`;
      }
    };

    loadBugs();
    container.appendChild(card);
    return container;
  }
}
