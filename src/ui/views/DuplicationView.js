import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * DuplicationView
 * Visualizes copy-paste clones and duplication percentage across the repository
 */
export class DuplicationView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Code Duplication & Clone Detection',
      description: 'Identifies copy-pasted blocks and clone clusters across repository source files.',
      badge: 'Clone Engine'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '👯',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository to execute the duplication and clone detection audit.'
      }).render());
      return container;
    }

    const card = document.createElement('div');
    card.className = 'landing-card';
    card.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>👯</span>
          <span>Clone Clusters & Redundancy</span>
        </h3>
        <span class="landing-card-badge" id="duplication-status-badge">Scanning...</span>
      </div>
      <div id="duplication-content-container" style="margin-top: 14px;">
        <p style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.85rem;">Analyzing normalized tokens across repository...</p>
      </div>
    `;
    container.appendChild(card);

    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
      this.loadData(card);
    }
    return container;
  }

  async loadData(card) {
    const statusBadge = card.querySelector('#duplication-status-badge');
    const content = card.querySelector('#duplication-content-container');

    try {
      const res = await fetch('/api/analysis/duplication');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const { totalDuplicatedLines = 0, duplicationPercentage = 0, cloneCount = 0, cloneGroups = [] } = data;

      if (statusBadge) {
        statusBadge.textContent = `${duplicationPercentage}% Duplicated (${cloneCount} Clones)`;
        statusBadge.style.color = duplicationPercentage > 10 ? 'var(--danger)' : 'var(--success)';
      }

      if (cloneGroups.length === 0) {
        content.innerHTML = `
          <div style="padding: 24px; text-align: center; color: var(--text-muted); font-family: var(--font-mono);">
            ✨ Zero redundant clones detected. Codebase is clean and well-factored!
          </div>
        `;
        return;
      }

      content.innerHTML = `
        <div style="display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;">
          <div class="stat-pill"><strong>${totalDuplicatedLines.toLocaleString()}</strong> Duplicated Lines</div>
          <div class="stat-pill"><strong>${duplicationPercentage}%</strong> Redundancy Ratio</div>
          <div class="stat-pill"><strong>${cloneCount}</strong> Clone Groups</div>
        </div>
        ${cloneGroups.map((g, idx) => `
          <div class="card p-3 mb-3" style="background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 8px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-family: var(--font-cyber); font-size: 0.85rem; color: #00f0ff;">
                CLONE CLUSTER #${idx + 1} (${g.occurrences.length} Instances)
              </span>
              <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #38bdf8;">
                ${g.lineCount} Lines
              </span>
            </div>
            <div style="font-size: 0.76rem; font-family: var(--font-mono); color: #94a3b8; margin-bottom: 8px;">
              ${g.occurrences.map(o => `<div>📁 <strong style="color: #cbd5e1;">${o.file}</strong> (Lines ${o.startLine}–${o.endLine})</div>`).join('')}
            </div>
            <pre style="background: rgba(4, 8, 18, 0.9); padding: 10px; border-radius: 6px; font-size: 0.74rem; overflow-x: auto; color: #a5f3fc; border: 1px solid rgba(255, 255, 255, 0.08); margin: 0;"><code>${this.escapeHtml(g.sample)}</code></pre>
          </div>
        `).join('')}
      `;
    } catch (err) {
      if (statusBadge) statusBadge.textContent = 'Scan Failed';
      content.innerHTML = `<p style="color: var(--danger); font-size: 0.85rem;">Error: ${err.message}</p>`;
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
