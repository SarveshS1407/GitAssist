import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Impact & Blast Radius Analysis View
 * Calculates dependency blast radius and ripple effects dynamically from the active repository
 */
export class ImpactView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Architectural Impact & Blast Radius',
      description: 'Trace ripple effects, direct dependents, and affected subsystems for any file or symbol modification.',
      badge: 'Impact Engine'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '💥',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository to calculate real-time dependency blast radius and impact ripples.'
      }).render());
      return container;
    }

    const panel = document.createElement('div');
    panel.className = 'landing-card';

    panel.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>💥</span>
          <span>Real Dependency Blast Radius Calculator</span>
        </h3>
        <span class="landing-card-badge">Live Graph Adjacency</span>
      </div>

      <div style="display: flex; gap: 12px; margin-top: 10px; align-items: center;">
        <label style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-secondary); white-space: nowrap;">Target File:</label>
        <select id="impact-file-select" style="flex: 1; padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border-holo); border-radius: 6px; color: var(--text-primary); font-family: var(--font-mono); font-size: 0.82rem;">
          <option value="">Loading repository files...</option>
        </select>
        <button class="btn-primary" id="btn-calc-impact" style="padding: 8px 16px; font-size: 0.8rem;">
          <span>⚡</span>
          <span>CALCULATE</span>
        </button>
      </div>

      <div id="impact-results-container" style="margin-top: 20px;">
        <p style="color: var(--accent-cyan); font-size: 0.85rem; font-family: var(--font-mono);">Analyzing dependency graph...</p>
      </div>
    `;

    const selectEl = panel.querySelector('#impact-file-select');
    const resultsEl = panel.querySelector('#impact-results-container');

    const evaluateImpact = async (filePath) => {
      if (!filePath) return;
      resultsEl.innerHTML = `<p style="color: var(--accent-cyan); font-size: 0.85rem; font-family: var(--font-mono);">Calculating blast radius for ${filePath}...</p>`;

      try {
        const res = await fetch(`/api/impact?path=${encodeURIComponent(filePath)}`);
        const data = await res.json();

        const riskColor = data.risk === 'CRITICAL' ? 'var(--danger)' : data.risk === 'HIGH' ? 'var(--accent-amber)' : data.risk === 'MEDIUM' ? 'var(--accent-cyan)' : 'var(--success)';

        resultsEl.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 16px;">
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">BLAST RADIUS SCORE</div>
              <div style="font-size: 1.8rem; font-weight: 900; color: ${riskColor}; font-family: var(--font-mono); margin-top: 4px;">${data.blastScore}%</div>
              <div style="font-size: 0.72rem; color: ${riskColor}; font-weight: 700;">${data.risk} RISK LEVEL</div>
            </div>
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">DIRECT DEPENDENTS (CALLERS)</div>
              <div style="font-size: 1.8rem; font-weight: 900; color: var(--accent-cyan); font-family: var(--font-mono); margin-top: 4px;">${data.dependents.length}</div>
              <div style="font-size: 0.72rem; color: var(--text-secondary);">Files importing this</div>
            </div>
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">OUTBOUND DEPENDENCIES</div>
              <div style="font-size: 1.8rem; font-weight: 900; color: var(--accent-neural); font-family: var(--font-mono); margin-top: 4px;">${data.dependencies.length}</div>
              <div style="font-size: 0.72rem; color: var(--text-secondary);">Subsystems used</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px;">
              <div style="font-weight: 700; color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.8rem; margin-bottom: 8px;">
                ⚡ UPSTREAM CALLERS (Will break if signature changes):
              </div>
              ${data.dependents.length > 0 
                ? data.dependents.map(d => `<div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-primary); padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">• ${d}</div>`).join('')
                : '<div style="font-size: 0.78rem; color: var(--text-muted);">No upstream callers found. Safe to modify internally.</div>'}
            </div>

            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px;">
              <div style="font-weight: 700; color: var(--accent-neural); font-family: var(--font-mono); font-size: 0.8rem; margin-bottom: 8px;">
                🔗 DOWNSTREAM DEPENDENCIES (Files this relies on):
              </div>
              ${data.dependencies.length > 0 
                ? data.dependencies.map(d => `<div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-primary); padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">• ${d}</div>`).join('')
                : '<div style="font-size: 0.78rem; color: var(--text-muted);">No outbound imports (Leaf Subsystem).</div>'}
            </div>
          </div>
        `;
      } catch (err) {
        resultsEl.innerHTML = `<p style="color: var(--danger);">Failed to calculate impact: ${err.message}</p>`;
      }
    };

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
