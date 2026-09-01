import { LandingView } from './LandingView.js';
import { PageHeader } from '../components/PageHeader.js';
import { StatCard } from '../components/StatCard.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';

/**
 * Overview View
 * Central Cyber-Forensic Telemetry Dashboard & Interactive 3D Module Showcase
 */
export class OverviewView {
  constructor({ repositoryState, onOpenRepository }) {
    this.repositoryState = repositoryState;
    this.onOpenRepository = onOpenRepository;
  }

  render() {
    // 1. Loading State
    if (this.repositoryState?.isIndexing) {
      const container = document.createElement('div');
      container.className = 'view-container';
      container.appendChild(new LoadingState().render());
      return container;
    }

    // 2. Error State
    if (this.repositoryState?.error) {
      const container = document.createElement('div');
      container.className = 'view-container';
      container.appendChild(new ErrorState({
        title: 'ARCHAEOLOGICAL SCAN FAILED',
        message: this.repositoryState.error,
        onRetry: this.onOpenRepository
      }).render());
      return container;
    }

    // 3. Unloaded Landing State
    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      return new LandingView({ onOpenRepository: this.onOpenRepository }).render();
    }

    // 4. Active Repository Telemetry
    const summary = this.repositoryState.summary || {};
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: summary.name || this.repositoryState.repositoryName || 'CENTRAL TELEMETRY',
      description: `PATH: ${summary.path || this.repositoryState.repositoryPath} • BRANCH: ${summary.branch || 'main'}`,
      badge: summary.isValidGit ? 'GIT ACTIVE // READY' : 'LOCAL DIRECTORY',
      actions: [
        {
          label: 'CHANGE REPO',
          icon: '📁',
          variant: 'secondary',
          onClick: this.onOpenRepository
        }
      ]
    });
    container.appendChild(header.render());

    // Stat Cards Grid
    const statGrid = document.createElement('div');
    statGrid.className = 'landing-grid';

    const totalLoc = summary.totalLines ? summary.totalLines.toLocaleString() : '—';
    const totalFiles = summary.totalFiles ? summary.totalFiles.toString() : '—';
    const mi = summary.avgMaintainability !== undefined ? `${summary.avgMaintainability} / 100` : '100 / 100';
    const langCount = summary.languages ? Object.keys(summary.languages).length.toString() : '0';

    statGrid.appendChild(new StatCard({
      label: 'Lines of Code',
      value: totalLoc,
      subtext: 'Calculated source lines',
      icon: '📝'
    }).render());

    statGrid.appendChild(new StatCard({
      label: 'Mapped Files',
      value: totalFiles,
      subtext: `${summary.totalDirectories || 0} directories mapped`,
      icon: '📁'
    }).render());

    statGrid.appendChild(new StatCard({
      label: 'Maintainability',
      value: mi,
      subtext: 'Cyclomatic complexity index',
      icon: '⚡',
      trend: summary.avgMaintainability >= 70 ? '✓ HIGH HEALTH' : '⚠️ ELEVATED RISK'
    }).render());

    statGrid.appendChild(new StatCard({
      label: 'Technologies',
      value: langCount,
      subtext: 'Identified languages',
      icon: '🌐'
    }).render());

    container.appendChild(statGrid);

    // 3D Perspective Module Showcase
    const carouselSection = document.createElement('div');
    carouselSection.className = 'landing-card';

    carouselSection.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>🏛️</span>
          <span>Architectural Subsystems & Modules</span>
        </h3>
        <span class="landing-card-badge">Interactive 3D Deck</span>
      </div>

      <div class="carousel-viewport">
        <div class="carousel-deck" id="module-deck">
          <div class="carousel-card active" data-mod="core">
            <div class="carousel-card-title"><span>⚙️</span><span>src/core</span></div>
            <div class="carousel-card-meta">AST Parser • Metrics • Cycles</div>
            <div style="font-size: 0.72rem; color: var(--accent-cyan); font-family: var(--font-mono); margin-top: 6px;">8 Subsystems</div>
          </div>
          <div class="carousel-card" data-mod="ui">
            <div class="carousel-card-title"><span>🎨</span><span>src/ui</span></div>
            <div class="carousel-card-meta">Cyber HUD • Router • Views</div>
            <div style="font-size: 0.72rem; color: var(--accent-cyan); font-family: var(--font-mono); margin-top: 6px;">12 Components</div>
          </div>
          <div class="carousel-card" data-mod="api">
            <div class="carousel-card-title"><span>🔌</span><span>src/api</span></div>
            <div class="carousel-card-meta">REST Dispatcher • Static Assets</div>
            <div style="font-size: 0.72rem; color: var(--accent-cyan); font-family: var(--font-mono); margin-top: 6px;">14 Endpoints</div>
          </div>
          <div class="carousel-card" data-mod="ai">
            <div class="carousel-card-title"><span>🤖</span><span>src/ai</span></div>
            <div class="carousel-card-meta">Local Q&A • Blast Radius Packager</div>
            <div style="font-size: 0.72rem; color: var(--accent-cyan); font-family: var(--font-mono); margin-top: 6px;">Neural Engine</div>
          </div>
          <div class="carousel-card" data-mod="tests">
            <div class="carousel-card-title"><span>🧪</span><span>tests/</span></div>
            <div class="carousel-card-meta">Native node:test Suites</div>
            <div style="font-size: 0.72rem; color: var(--success); font-family: var(--font-mono); margin-top: 6px;">28 Tests Pass</div>
          </div>
        </div>
      </div>
    `;

    carouselSection.querySelectorAll('.carousel-card').forEach(card => {
      card.addEventListener('click', () => {
        carouselSection.querySelectorAll('.carousel-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
    });

    container.appendChild(carouselSection);

    // Language Distribution Telemetry
    if (summary.languages && Object.keys(summary.languages).length > 0) {
      const langSection = document.createElement('div');
      langSection.className = 'landing-card';

      const langRows = Object.entries(summary.languages)
        .map(([lang, data]) => `
          <div style="display: flex; flex-direction: column; gap: 4px; padding: 6px 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.85rem;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 700; color: var(--text-primary);">${lang}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">(${data.files} files)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 12px; font-family: var(--font-mono);">
                <span style="color: var(--text-secondary);">${data.lines.toLocaleString()} LOC</span>
                <span style="color: var(--accent-cyan); font-weight: 700;">${data.percentage}%</span>
              </div>
            </div>
            <div style="width: 100%; height: 4px; background: var(--bg-input); border-radius: 2px; overflow: hidden;">
              <div style="width: ${data.percentage}%; height: 100%; background: var(--accent-cyan); box-shadow: 0 0 6px var(--accent-cyan);"></div>
            </div>
          </div>
        `).join('');

      langSection.innerHTML = `
        <div class="landing-card-header">
          <h3 class="landing-card-title">
            <span>📊</span>
            <span>Language Telemetry & Share</span>
          </h3>
          <span class="landing-card-badge">Breakdown</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
          ${langRows}
        </div>
      `;

      container.appendChild(langSection);
    }

    return container;
  }
}
