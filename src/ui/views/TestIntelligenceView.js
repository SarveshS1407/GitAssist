import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Enhanced Test Intelligence & Verification Density View
 * Interactive workbench detailing verification readiness grade, coverage ratio,
 * uncovered high-risk hotspot files, and module-to-test mapping.
 */
export class TestIntelligenceView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
    this.intelData = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Test Intelligence & Verification Readiness',
      description: 'Automated test suite mapping, verification coverage density, uncovered high-risk files, and AST import validation.',
      badge: 'Verification Engine'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '🧪',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository to evaluate test harness verification density and uncovered hotspots.'
      }).render());
      return container;
    }

    const panel = document.createElement('div');
    panel.className = 'landing-card';

    panel.innerHTML = `
      <div class="landing-card-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 2v6.5a4 4 0 0 1-1.2 2.8L4 16.5A3 3 0 0 0 6.2 21h11.6a3 3 0 0 0 2.2-4.5l-3.8-5.2a4 4 0 0 1-1.2-2.8V2"></path>
            <line x1="7" y1="2" x2="17" y2="2"></line>
            <circle cx="12" cy="16" r="1.5" fill="currentColor"></circle>
          </svg>
          <h3 class="landing-card-title" style="margin: 0;">Verification Density & Coverage Readiness</h3>
        </div>
        <span class="landing-card-badge" id="test-readiness-grade">Analyzing...</span>
      </div>

      <div id="test-intel-container" style="margin-top: 16px;">
        <p style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.85rem;">Correlating test suites with AST import graphs...</p>
      </div>
    `;

    const loadTests = async () => {
      const el = panel.querySelector('#test-intel-container');
      const gradeBadge = panel.querySelector('#test-readiness-grade');

      try {
        const res = await fetch('/api/tests');
        const data = await res.json();
        this.intelData = data;

        const summary = data.summary || {
          verificationGrade: 'N/A',
          coveragePercentage: 0,
          totalTestFiles: data.totalTests || 0,
          totalSourceFiles: data.totalSourceFiles || 0,
          uncoveredHighRiskCount: 0
        };

        const gradeColor = summary.verificationGrade === 'A' ? 'var(--success)'
          : summary.verificationGrade === 'B' ? 'var(--accent-cyan)'
          : summary.verificationGrade === 'C' ? 'var(--accent-amber)'
          : 'var(--danger)';

        gradeBadge.textContent = `GRADE: ${summary.verificationGrade}`;
        gradeBadge.style.borderColor = gradeColor;
        gradeBadge.style.color = gradeColor;

        el.innerHTML = `
          <!-- Scorecards -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 18px;">
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">READINESS GRADE</div>
              <div style="font-size: 2rem; font-weight: 900; color: ${gradeColor}; font-family: var(--font-mono); margin-top: 4px;">${summary.verificationGrade}</div>
              <div style="font-size: 0.7rem; color: ${gradeColor}; font-weight: 700;">VERIFICATION POSTURE</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">VERIFIED MODULES</div>
              <div style="font-size: 2rem; font-weight: 900; color: var(--accent-cyan); font-family: var(--font-mono); margin-top: 4px;">
                ${summary.coveragePercentage}%
              </div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">${summary.verifiedSourceFiles || 0} / ${summary.totalSourceFiles} Files</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">TEST SUITES</div>
              <div style="font-size: 2rem; font-weight: 900; color: var(--accent-neural); font-family: var(--font-mono); margin-top: 4px;">
                ${summary.totalTestFiles}
              </div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">${data.testRatio} Suite Ratio</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">UNTESTED HOTSPOTS</div>
              <div style="font-size: 2rem; font-weight: 900; color: ${summary.uncoveredHighRiskCount > 0 ? 'var(--danger)' : 'var(--success)'}; font-family: var(--font-mono); margin-top: 4px;">
                ${summary.uncoveredHighRiskCount}
              </div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">High Churn & Complexity</div>
            </div>
          </div>

          <!-- Uncovered High-Risk Hotspots Advisory -->
          ${(data.uncoveredHighRiskFiles || []).length > 0 ? `
            <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 16px; margin-bottom: 18px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-weight: 700; color: var(--danger); font-family: var(--font-mono); font-size: 0.82rem;">
                  ⚠️ UNCOVERED HIGH-RISK MODULES (CRITICAL DEFICIT)
                </span>
                <span style="font-size: 0.72rem; color: var(--danger); font-weight: 700;">Action Required</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${data.uncoveredHighRiskFiles.map(u => `
                  <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.78rem;">
                    <div>
                      <span style="color: var(--text-primary); font-weight: 700;">${u.file}</span>
                      <span style="color: var(--text-muted); margin-left: 8px; font-size: 0.72rem;">(${u.lineCount} LOC, ${u.churn} commits)</span>
                    </div>
                    <span style="color: var(--accent-amber); font-size: 0.72rem;">${u.reason}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : `
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 12px 16px; margin-bottom: 18px; font-size: 0.82rem; color: var(--success); font-family: var(--font-mono);">
              ✅ Excellent! Zero high-risk hotspot files are currently lacking test coverage.
            </div>
          `}

          <!-- Two-Column Verification Map -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
            <!-- Left: Module Verification Matrix -->
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-weight: 700; color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.82rem;">
                  🔍 SOURCE MODULE VERIFICATION MATRIX
                </span>
                <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">
                  ${(data.moduleCoverage || []).length} modules scanned
                </span>
              </div>
              <div style="max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
                ${(data.moduleCoverage || []).map(m => {
                  const statusColor = m.verified ? 'var(--success)' : 'var(--text-muted)';
                  return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: rgba(255,255,255,0.02); border-radius: 4px; font-family: var(--font-mono); font-size: 0.78rem;">
                      <div>
                        <span style="color: ${statusColor}; font-weight: 700; margin-right: 6px;">${m.verified ? '✓' : '✗'}</span>
                        <span style="color: var(--text-primary);">${m.file}</span>
                      </div>
                      <span style="font-size: 0.7rem; color: ${m.verified ? 'var(--accent-cyan)' : 'var(--text-muted)'};">
                        ${m.verified ? `${m.associatedTests.length} suite(s)` : 'untested'}
                      </span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Right: Discovered Test Suites -->
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-weight: 700; color: var(--accent-neural); font-family: var(--font-mono); font-size: 0.82rem;">
                  🧪 ACTIVE TEST SUITES IN REPOSITORY
                </span>
                <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">
                  ${(data.testSuites || []).length} suites
                </span>
              </div>
              <div style="max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
                ${(data.testSuites || []).map(t => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: rgba(255,255,255,0.02); border-radius: 4px; font-family: var(--font-mono); font-size: 0.78rem;">
                    <span style="color: var(--text-primary); font-weight: 600;">${t.file}</span>
                    <span style="font-size: 0.7rem; color: var(--text-muted);">${t.lineCount} LOC</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      } catch (err) {
        el.innerHTML = `<p style="color: var(--danger); font-size: 0.85rem;">Failed to load test intelligence: ${err.message}</p>`;
      }
    };

    loadTests();
    container.appendChild(panel);
    return container;
  }
}
