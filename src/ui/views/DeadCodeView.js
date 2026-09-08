import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Enhanced Dead Code Signals & Pruning Workbench
 * Accurately surfaces unimported detached modules and unused internal functions
 * while protecting valid entry points, configurations, and test harnesses.
 */
export class DeadCodeView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
    this.deadCodeData = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Dead & Isolated Code Signals',
      description: 'AST-verified isolation detection, detached module identification, and unused internal helper symbol signals.',
      badge: 'Pruning Telemetry'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '🍂',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository to detect unreferenced modules and unused internal functions.'
      }).render());
      return container;
    }

    const card = document.createElement('div');
    card.className = 'landing-card';

    card.innerHTML = `
      <div class="landing-card-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="6" cy="6" r="2.5"></circle>
            <circle cx="18" cy="18" r="2.5"></circle>
            <line x1="6" y1="8.5" x2="6" y2="21"></line>
            <line x1="8" y1="14" x2="16" y2="16" stroke-dasharray="2 2"></line>
            <line x1="18" y1="8" x2="18" y2="15.5"></line>
            <line x1="14" y1="3" x2="20" y2="9"></line>
            <line x1="20" y1="3" x2="14" y2="9"></line>
          </svg>
          <h3 class="landing-card-title" style="margin: 0;">Dead Code & Detached Subsystems</h3>
        </div>
        <span class="landing-card-badge" id="dead-code-badge">Analyzing Graph...</span>
      </div>

      <div id="dead-code-container" style="margin-top: 16px;">
        <p style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.85rem;">Checking for isolated dependency graph nodes and call graph reachability...</p>
      </div>
      <div style="margin-top: 12px; font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">
        * Entry points (index, app, server), test suites, stylesheets, and configs are strictly whitelisted to prevent false positives.
      </div>
    `;

    const loadDeadCode = async () => {
      const el = card.querySelector('#dead-code-container');
      const badge = card.querySelector('#dead-code-badge');

      try {
        const res = await fetch('/api/deadcode');
        const data = await res.json();
        this.deadCodeData = data;

        const summary = data.summary || {
          orphanModulesCount: data.isolatedCount || 0,
          unusedSymbolsCount: 0,
          deadCodeDensity: 0,
          status: 'CLEAN'
        };

        const statusColor = summary.status === 'CLEAN' ? 'var(--success)' 
          : summary.status === 'MODERATE_DEBRIS' ? 'var(--accent-amber)' 
          : 'var(--danger)';

        badge.textContent = `${summary.status} // ${summary.orphanModulesCount} ORPHANS`;
        badge.style.color = statusColor;
        badge.style.borderColor = statusColor;

        el.innerHTML = `
          <!-- Telemetry Scorecards -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 18px;">
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">DETACHED MODULES</div>
              <div style="font-size: 2rem; font-weight: 900; color: ${summary.orphanModulesCount > 0 ? 'var(--accent-amber)' : 'var(--success)'}; font-family: var(--font-mono); margin-top: 4px;">
                ${summary.orphanModulesCount}
              </div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">Unreferenced Files</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">UNUSED INTERNAL SYMBOLS</div>
              <div style="font-size: 2rem; font-weight: 900; color: var(--accent-neural); font-family: var(--font-mono); margin-top: 4px;">
                ${summary.unusedSymbolsCount || 0}
              </div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">Uncalled Helpers</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">DEAD CODE DENSITY</div>
              <div style="font-size: 2rem; font-weight: 900; color: var(--accent-cyan); font-family: var(--font-mono); margin-top: 4px;">
                ${summary.deadCodeDensity}%
              </div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">Of Audited Source Files</div>
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">HEALTH STATUS</div>
              <div style="font-size: 1.4rem; font-weight: 900; color: ${statusColor}; font-family: var(--font-mono); margin-top: 8px;">
                ${summary.status}
              </div>
              <div style="font-size: 0.7rem; color: ${statusColor}; font-weight: 700;">CODEBASE PRUNING</div>
            </div>
          </div>

          <!-- Two-Column Grid: Orphan Modules and Unused Symbols -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
            <!-- Left: Detached Modules -->
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-weight: 700; color: var(--accent-amber); font-family: var(--font-mono); font-size: 0.82rem;">
                  🍂 DETACHED / UNREFERENCED SOURCE FILES
                </span>
                <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">
                  ${(data.orphanModules || []).length} files
                </span>
              </div>
              ${(data.orphanModules || []).length > 0 ? `
                <div style="max-height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
                  ${data.orphanModules.map(m => `
                    <div style="background: rgba(0,0,0,0.25); border-left: 3px solid ${m.confidence === 'HIGH' ? 'var(--danger)' : 'var(--accent-amber)'}; padding: 8px 12px; border-radius: 0 4px 4px 0; font-family: var(--font-mono); font-size: 0.78rem;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--text-primary); font-weight: 700;">${m.file}</span>
                        <span style="font-size: 0.68rem; color: var(--text-muted);">${m.lineCount} LOC</span>
                      </div>
                      <div style="color: var(--text-secondary); font-size: 0.72rem; margin-top: 4px;">
                        ${m.reason}
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div style="color: var(--success); font-size: 0.82rem; font-family: var(--font-mono); padding: 12px 0;">
                  ✓ All source files are actively referenced within the project dependency graph.
                </div>
              `}
            </div>

            <!-- Right: Unused Internal Symbols -->
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-weight: 700; color: var(--accent-neural); font-family: var(--font-mono); font-size: 0.82rem;">
                  🔍 UNREFERENCED INTERNAL FUNCTIONS / METHODS
                </span>
                <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">
                  ${(data.unusedSymbols || []).length} symbols
                </span>
              </div>
              ${(data.unusedSymbols || []).length > 0 ? `
                <div style="max-height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
                  ${data.unusedSymbols.map(s => `
                    <div style="background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.78rem;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--accent-cyan); font-weight: 700;">${s.name}()</span>
                        <span style="font-size: 0.68rem; color: var(--text-muted);">${s.file}:${s.lineStart}</span>
                      </div>
                      <div style="color: var(--text-muted); font-size: 0.7rem; margin-top: 4px;">
                        ${s.reason}
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div style="color: var(--text-muted); font-size: 0.82rem; font-family: var(--font-mono); padding: 12px 0;">
                  No unreferenced internal helper symbols flagged.
                </div>
              `}
            </div>
          </div>
        `;
      } catch (err) {
        el.innerHTML = `<p style="color: var(--danger); font-size: 0.85rem;">Failed to detect dead code: ${err.message}</p>`;
      }
    };

    loadDeadCode();
    container.appendChild(card);
    return container;
  }
}
