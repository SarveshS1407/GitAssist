import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Advanced Multi-Dimensional Impact & Change Intelligence View
 * Renders live dependency blast radius, "Before You Change This" change brief,
 * affected API endpoints, affected test suites, and markdown export.
 */
export class ImpactView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
    this.currentBrief = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Architectural Impact & Change Brief',
      description: 'Multi-dimensional change telemetry, "Before You Change This" pre-modification briefs, affected APIs, and test recommendations.',
      badge: 'Change Intelligence'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '💥',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository to calculate real-time dependency blast radius and change briefs.'
      }).render());
      return container;
    }

    const panel = document.createElement('div');
    panel.className = 'landing-card';

    panel.innerHTML = `
      <div class="landing-card-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3 class="landing-card-title" style="margin: 0;">Before You Change This — Pre-Modification Intelligence</h3>
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="btn-copy-brief-md" class="btn-secondary" style="padding: 5px 12px; font-size: 0.75rem; display: none;">
            📋 COPY BRIEF (MARKDOWN)
          </button>
          <span class="landing-card-badge">Phase 2 Intelligence</span>
        </div>
      </div>

      <div style="display: flex; gap: 12px; margin-top: 14px; align-items: center; flex-wrap: wrap;">
        <label style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-secondary); white-space: nowrap;">Target File / Symbol:</label>
        <select id="impact-file-select" style="flex: 1; min-width: 260px; padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border-holo); border-radius: 6px; color: var(--text-primary); font-family: var(--font-mono); font-size: 0.82rem;">
          <option value="">Loading repository files...</option>
        </select>
        <button class="btn-primary" id="btn-calc-impact" style="padding: 8px 16px; font-size: 0.8rem;">
          <span>⚡</span>
          <span>ANALYZE IMPACT</span>
        </button>
      </div>

      <div id="impact-results-container" style="margin-top: 20px;">
        <p style="color: var(--accent-cyan); font-size: 0.85rem; font-family: var(--font-mono);">Evaluating multi-dimensional impact...</p>
      </div>
    `;

    const selectEl = panel.querySelector('#impact-file-select');
    const resultsEl = panel.querySelector('#impact-results-container');
    const copyMdBtn = panel.querySelector('#btn-copy-brief-md');

    const evaluateImpact = async (filePath) => {
      if (!filePath) return;
      resultsEl.innerHTML = `<p style="color: var(--accent-cyan); font-size: 0.85rem; font-family: var(--font-mono);">Synthesizing Change Brief & Blast Radius for ${filePath}...</p>`;
      copyMdBtn.style.display = 'none';

      try {
        const [briefRes, impactRes] = await Promise.all([
          fetch(`/api/change-brief?target=${encodeURIComponent(filePath)}&format=markdown`),
          fetch(`/api/impact/advanced?target=${encodeURIComponent(filePath)}&depth=3`)
        ]);

        const brief = await briefRes.json();
        const impact = await impactRes.json();
        this.currentBrief = brief;

        if (brief && brief.markdown) {
          copyMdBtn.style.display = 'inline-block';
        }

        const riskColor = brief.risk?.level === 'CRITICAL' ? 'var(--danger)' 
          : brief.risk?.level === 'HIGH' ? 'var(--accent-amber)' 
          : brief.risk?.level === 'MEDIUM' ? 'var(--accent-cyan)' 
          : 'var(--success)';

        resultsEl.innerHTML = `
          <!-- Primary Telemetry Metrics -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 18px;">
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">CHANGE RISK LEVEL</div>
              <div style="font-size: 1.8rem; font-weight: 900; color: ${riskColor}; font-family: var(--font-mono); margin-top: 4px;">
                ${brief.risk?.score || 0}<span style="font-size: 1rem; color: var(--text-muted);">/100</span>
              </div>
              <div style="font-size: 0.75rem; color: ${riskColor}; font-weight: 700;">${brief.risk?.level || 'LOW'} RISK</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">DOWNSTREAM CALLERS</div>
              <div style="font-size: 1.8rem; font-weight: 900; color: var(--accent-cyan); font-family: var(--font-mono); margin-top: 4px;">
                ${brief.potentialImpact?.dependentsCount || 0}
              </div>
              <div style="font-size: 0.72rem; color: var(--text-secondary);">Direct & Transitive</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">AFFECTED APIS</div>
              <div style="font-size: 1.8rem; font-weight: 900; color: var(--accent-neural); font-family: var(--font-mono); margin-top: 4px;">
                ${brief.potentialImpact?.apiCount || 0}
              </div>
              <div style="font-size: 0.72rem; color: var(--text-secondary);">Public REST Endpoints</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">RECOMMENDED TESTS</div>
              <div style="font-size: 1.8rem; font-weight: 900; color: var(--accent-emerald, #10b981); font-family: var(--font-mono); margin-top: 4px;">
                ${brief.potentialImpact?.testCount || 0}
              </div>
              <div style="font-size: 0.72rem; color: var(--text-secondary);">Ranked Test Suites</div>
            </div>
          </div>

          <!-- Developer Action Advisory Banner -->
          <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 14px; margin-bottom: 18px;">
            <div style="font-weight: 700; color: var(--accent-amber); font-family: var(--font-mono); font-size: 0.82rem; margin-bottom: 4px;">
              ⚡ RECOMMENDED ACTION ADVISORY:
            </div>
            <div style="font-size: 0.82rem; color: var(--text-primary); line-height: 1.5;">
              ${brief.recommendedAction || 'Safe to proceed with normal review standards.'}
            </div>
          </div>

          <!-- Two-Column Forensic Telemetry Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; margin-bottom: 18px;">
            <!-- Left: Callers & Direct Dependents -->
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-weight: 700; color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.8rem;">
                  💥 DIRECT & UPSTREAM CALLERS
                </span>
                <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">${brief.usedBy?.length || 0} callers</span>
              </div>
              <div style="max-height: 200px; overflow-y: auto;">
                ${(brief.usedBy || []).length > 0 
                  ? brief.usedBy.map(u => `
                    <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-primary); padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      • ${u}
                    </div>`).join('')
                  : '<div style="font-size: 0.78rem; color: var(--text-muted); padding: 8px 0;">No upstream callers found (Leaf subsystem).</div>'}
              </div>
            </div>

            <!-- Right: Affected API Endpoints -->
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-weight: 700; color: var(--accent-neural); font-family: var(--font-mono); font-size: 0.8rem;">
                  🌐 EXPOSED REST ENDPOINTS
                </span>
                <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">${brief.apiExposure?.length || 0} APIs</span>
              </div>
              <div style="max-height: 200px; overflow-y: auto;">
                ${(brief.apiExposure || []).length > 0
                  ? brief.apiExposure.map(api => `
                    <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--accent-amber); padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      ⚡ ${api}
                    </div>`).join('')
                  : '<div style="font-size: 0.78rem; color: var(--text-muted); padding: 8px 0;">No API endpoints transitively call this module.</div>'}
              </div>
            </div>
          </div>

          <!-- Bottom: Recommended Test Suites -->
          <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-weight: 700; color: var(--accent-emerald, #10b981); font-family: var(--font-mono); font-size: 0.82rem;">
                🧪 AUTOMATIC TEST RECOMMENDATIONS (RANKED)
              </span>
              <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">
                Run these suites before opening a PR
              </span>
            </div>
            <div>
              ${(brief.testCoverage?.recommended || []).length > 0
                ? brief.testCoverage.recommended.map(t => {
                    const badgeColor = t.priority === 'HIGH' ? 'var(--danger)' : t.priority === 'MEDIUM' ? 'var(--accent-amber)' : 'var(--accent-cyan)';
                    return `
                      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); font-family: var(--font-mono); font-size: 0.78rem;">
                        <div>
                          <span style="color: var(--text-primary); font-weight: 600;">${t.testFile}</span>
                          <span style="color: var(--text-muted); margin-left: 8px; font-size: 0.72rem;">(${t.reason})</span>
                        </div>
                        <span style="background: rgba(255,255,255,0.08); color: ${badgeColor}; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 0.7rem; border: 1px solid ${badgeColor};">
                          ${t.priority}
                        </span>
                      </div>
                    `;
                  }).join('')
                : '<div style="font-size: 0.78rem; color: var(--text-muted); padding: 8px 0;">No related test suites identified in the repository.</div>'}
            </div>
          </div>
        `;
      } catch (err) {
        resultsEl.innerHTML = `<p style="color: var(--danger);">Failed to calculate impact: ${err.message}</p>`;
      }
    };

    // Copy brief handler
    copyMdBtn.addEventListener('click', async () => {
      if (this.currentBrief && this.currentBrief.markdown) {
        try {
          await navigator.clipboard.writeText(this.currentBrief.markdown);
          const origText = copyMdBtn.textContent;
          copyMdBtn.textContent = '✅ COPIED!';
          setTimeout(() => { copyMdBtn.textContent = origText; }, 2000);
        } catch (e) {
          alert('Could not copy to clipboard: ' + e.message);
        }
      }
    });

    // Load available files into select
    fetch('/api/metrics')
      .then(res => res.json())
      .then(data => {
        const files = data.files || [];
        if (files.length === 0) {
          selectEl.innerHTML = '<option value="">No files found</option>';
          return;
        }
        selectEl.innerHTML = files.map(f => `<option value="${f.relativePath}">${f.relativePath} (${f.language})</option>`).join('');
        evaluateImpact(files[0].relativePath);
      })
      .catch(() => {
        selectEl.innerHTML = '<option value="src/api/routes.js">src/api/routes.js</option>';
        evaluateImpact('src/api/routes.js');
      });

    panel.querySelector('#btn-calc-impact').addEventListener('click', () => evaluateImpact(selectEl.value));
    selectEl.addEventListener('change', () => evaluateImpact(selectEl.value));

    container.appendChild(panel);
    return container;
  }
}

