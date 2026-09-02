import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Test Intelligence View
 * Static mapping of test suites, test density, and untested modules
 */
export class TestIntelligenceView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Test Intelligence & Verification Density',
      description: 'Static test harness mapping, automated suite discovery, and verification coverage signals.',
      badge: 'Verification Engine'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '🧪',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a repository to analyze test harness density.'
      }).render());
      return container;
    }

    const card = document.createElement('div');
    card.className = 'landing-card';

    card.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>🧪</span>
          <span>Test Harness Mapping</span>
        </h3>
        <span class="landing-card-badge" id="test-density-badge">Scanning...</span>
      </div>
      <div id="test-intel-container" style="margin-top: 14px;">
        <p style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.85rem;">Mapping test suites...</p>
      </div>
    `;

    const loadTests = async () => {
      const el = card.querySelector('#test-intel-container');
      const badge = card.querySelector('#test-density-badge');
      try {
        const res = await fetch('/api/tests');
        const data = await res.json();

        badge.textContent = `RATIO: ${data.testRatio}`;

        el.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">DISCOVERED TEST FILES</div>
              <div style="font-size: 1.8rem; font-weight: 900; color: var(--accent-cyan); font-family: var(--font-mono);">${data.totalTests}</div>
            </div>
            <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px; text-align: center;">
              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">SOURCE MODULES</div>
              <div style="font-size: 1.8rem; font-weight: 900; color: var(--text-primary); font-family: var(--font-mono);">${data.totalSourceFiles}</div>
            </div>
          </div>

          <div style="background: var(--bg-blade); border: 1px solid var(--border-strata); border-radius: 8px; padding: 14px;">
            <div style="font-weight: 700; color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.82rem; margin-bottom: 8px;">
              DISCOVERED TEST SUITES:
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px; max-height: 240px; overflow-y: auto;">
              ${(data.testFiles || []).map(t => `<div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-secondary);">✓ ${t}</div>`).join('') || '<div style="color: var(--text-muted);">No automated test files discovered.</div>'}
            </div>
          </div>
          <div style="margin-top: 10px; font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">${data.untestedNotice}</div>
        `;
      } catch (err) {
        el.innerHTML = `<p style="color: var(--danger); font-size: 0.85rem;">Failed to load test intelligence: ${err.message}</p>`;
      }
    };

    loadTests();
    container.appendChild(card);
    return container;
  }
}
