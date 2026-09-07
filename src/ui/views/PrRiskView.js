import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * PR & Diff Risk Analyzer Workbench View
 * Provides unified git diff parsing, 0-100 risk score, affected symbol correlation,
 * exposed API paths, and recommended test suites checklist.
 */
export class PrRiskView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
    this.analysisData = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Pull Request & Diff Risk Analyzer',
      description: 'Evaluate code review risk, modified symbol blast radius, exposed endpoints, and prioritized test suites from unified git diffs.',
      badge: 'PR Intelligence'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '🛡️',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository to correlate diffs with AST symbols and call graphs.'
      }).render());
      return container;
    }

    const panel = document.createElement('div');
    panel.className = 'landing-card';

    panel.innerHTML = `
      <div class="landing-card-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
            <path d="M6 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
            <path d="M6 4v16"></path>
            <circle cx="18" cy="7" r="3"></circle>
            <path d="M18 10a8 8 0 0 1-8 8H6"></path>
          </svg>
          <h3 class="landing-card-title" style="margin: 0;">Pull Request Blast Radius Workbench</h3>
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="btn-load-sample-diff" class="btn-secondary" style="padding: 5px 12px; font-size: 0.75rem;">
            📄 LOAD SAMPLE DIFF
          </button>
          <span class="landing-card-badge">AST Blast Evaluation</span>
        </div>
      </div>

      <div style="margin-top: 14px;">
        <label style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-secondary); display: block; margin-bottom: 6px;">
          PASTE UNIFIED GIT DIFF OR PATCH:
        </label>
        <textarea id="pr-diff-textarea" rows="7" placeholder="Paste 'git diff main...feature' output here..." style="width: 100%; box-sizing: border-box; background: var(--bg-input); border: 1px solid var(--border-holo); border-radius: 6px; color: var(--text-primary); font-family: var(--font-mono); font-size: 0.8rem; padding: 10px; resize: vertical;"></textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; margin-top: 10px; gap: 10px;">
        <button class="btn-primary" id="btn-analyze-pr" style="padding: 8px 18px; font-size: 0.82rem;">
          <span>🛡️</span>
          <span>ANALYZE PR RISK</span>
        </button>
      </div>

      <div id="pr-results-container" style="margin-top: 20px;">
        <div style="background: var(--bg-blade); border: 1px dashed var(--border-strata); border-radius: 8px; padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.85rem; font-family: var(--font-mono);">
          Paste a git diff above or click "LOAD SAMPLE DIFF" to evaluate pull request impact.
        </div>
      </div>
    `;

    const diffTextarea = panel.querySelector('#pr-diff-textarea');
    const analyzeBtn = panel.querySelector('#btn-analyze-pr');
    const sampleBtn = panel.querySelector('#btn-load-sample-diff');
    const resultsContainer = panel.querySelector('#pr-results-container');

    sampleBtn.addEventListener('click', () => {
      diffTextarea.value = `diff --git a/src/services/repository-service.js b/src/services/repository-service.js
index a1b2c3d..e4f5g6h 100644
--- a/src/services/repository-service.js
+++ b/src/services/repository-service.js
@@ -190,6 +190,14 @@ export class RepositoryService {
         branch: validation.branch,
+        // Enhanced caching telemetry
+        telemetryEnabled: true,
+        auditTimestamp: Date.now(),
+      },
       files: files,
diff --git a/src/api/routes.js b/src/api/routes.js
index b2c3d4e..f5g6h7i 100644
--- a/src/api/routes.js
+++ b/src/api/routes.js
@@ -310,6 +310,12 @@ export class ApiRouter {
+    // Core routing modification
+    if (req.method === 'GET' && pathname === '/api/critical-payment') {
+      return this.sendJson(res, 200, { ok: true });
+    }
`;
    });

    analyzeBtn.addEventListener('click', async () => {
      const diffText = diffTextarea.value.trim();
      if (!diffText) {
        alert('Please paste a unified git diff first.');
        return;
      }

      resultsContainer.innerHTML = `<p style="color: var(--accent-cyan); font-size: 0.85rem; font-family: var(--font-mono);">Evaluating diff symbols and blast radius...</p>`;

      try {
        const res = await fetch('/api/pr/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ diffText })
        });
        const data = await res.json();
        this.analysisData = data;

        const riskColor = data.riskLevel === 'CRITICAL' ? 'var(--danger)' 
          : data.riskLevel === 'HIGH' ? 'var(--accent-amber)' 
          : data.riskLevel === 'MEDIUM' ? 'var(--accent-cyan)' 
          : 'var(--success)';

        resultsContainer.innerHTML = `
          <!-- Scorecards -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 18px;">
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">PR RISK SCORE</div>
              <div style="font-size: 2rem; font-weight: 900; color: ${riskColor}; font-family: var(--font-mono); margin-top: 4px;">
                ${data.overallRisk}<span style="font-size: 1rem; color: var(--text-muted);">/100</span>
              </div>
              <div style="font-size: 0.72rem; color: ${riskColor}; font-weight: 700;">${data.riskLevel} RISK LEVEL</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">CHANGED FILES</div>
              <div style="font-size: 2rem; font-weight: 900; color: var(--accent-cyan); font-family: var(--font-mono); margin-top: 4px;">
                ${data.filesChangedCount || 0}
              </div>
              <div style="font-size: 0.72rem; color: var(--text-secondary);">${data.affectedModulesCount || 0} Subsystems</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">CHANGED SYMBOLS</div>
              <div style="font-size: 2rem; font-weight: 900; color: var(--accent-neural); font-family: var(--font-mono); margin-top: 4px;">
                ${data.symbolsChangedCount || 0}
              </div>
              <div style="font-size: 0.72rem; color: var(--text-secondary);">Functions & Classes</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">AFFECTED APIS</div>
              <div style="font-size: 2rem; font-weight: 900; color: var(--accent-amber); font-family: var(--font-mono); margin-top: 4px;">
                ${data.affectedApisCount || 0}
              </div>
              <div style="font-size: 0.72rem; color: var(--text-secondary);">Exposed Endpoints</div>
            </div>
          </div>

          <!-- Changed Symbols Table -->
          <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <div style="font-weight: 700; color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.82rem; margin-bottom: 10px;">
              🔍 AST SYMBOLS DIRECTLY MODIFIED IN DIFF
            </div>
            ${(data.changedSymbols || []).length > 0
              ? `
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${data.changedSymbols.map(s => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: rgba(255,255,255,0.02); border-radius: 4px; font-family: var(--font-mono); font-size: 0.78rem;">
                      <div>
                        <span style="color: var(--accent-cyan); font-weight: 700;">${s.name}</span>
                        <span style="color: var(--text-muted); margin-left: 8px; font-size: 0.72rem;">${s.file}</span>
                      </div>
                      <span style="background: rgba(0, 240, 255, 0.1); color: var(--accent-cyan); padding: 2px 6px; border-radius: 3px; font-size: 0.7rem;">
                        ${s.kind || 'function'}
                      </span>
                    </div>
                  `).join('')}
                </div>
              `
              : '<div style="font-size: 0.78rem; color: var(--text-muted);">No top-level AST function/class symbols intersected by diff hunks.</div>'}
          </div>

          <!-- Affected Endpoints & Tests Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
            <!-- Left: Affected Endpoints -->
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 16px;">
              <div style="font-weight: 700; color: var(--accent-amber); font-family: var(--font-mono); font-size: 0.8rem; margin-bottom: 8px;">
                🌐 EXPOSED REST ENDPOINTS IN IMPACT PATH
              </div>
              ${(data.affectedApis || []).length > 0
                ? data.affectedApis.map(a => `
                  <div style="font-family: var(--font-mono); font-size: 0.78rem; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--text-primary);">
                    <span style="color: var(--accent-amber); font-weight: 700;">${a.method}</span> ${a.path}
                    <div style="font-size: 0.7rem; color: var(--text-muted);">${a.file}</div>
                  </div>
                `).join('')
                : '<div style="font-size: 0.78rem; color: var(--text-muted);">No REST API endpoints in blast radius.</div>'}
            </div>

            <!-- Right: Recommended Test Suites -->
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 16px;">
              <div style="font-weight: 700; color: var(--accent-emerald, #10b981); font-family: var(--font-mono); font-size: 0.8rem; margin-bottom: 8px;">
                🧪 TEST SUITES REQUIRED FOR VALIDATION
              </div>
              ${(data.recommendedTests || []).length > 0
                ? data.recommendedTests.map(t => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-family: var(--font-mono); font-size: 0.78rem;">
                    <div>
                      <span style="color: var(--text-primary); font-weight: 600;">${t.testFile}</span>
                      <div style="color: var(--text-muted); font-size: 0.7rem;">${t.reason}</div>
                    </div>
                    <span style="background: rgba(16, 185, 129, 0.1); color: var(--accent-emerald, #10b981); border: 1px solid var(--accent-emerald, #10b981); padding: 2px 6px; border-radius: 3px; font-size: 0.68rem; font-weight: 700;">
                      ${t.priority}
                    </span>
                  </div>
                `).join('')
                : '<div style="font-size: 0.78rem; color: var(--text-muted);">No direct test suites flagged.</div>'}
            </div>
          </div>
        `;
      } catch (err) {
        resultsContainer.innerHTML = `<p style="color: var(--danger);">Failed to analyze PR diff: ${err.message}</p>`;
      }
    });

    container.appendChild(panel);
    return container;
  }
}
