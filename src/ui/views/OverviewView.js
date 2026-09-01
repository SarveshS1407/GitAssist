import { LandingView } from './LandingView.js';
import { PageHeader } from '../components/PageHeader.js';
import { StatCard } from '../components/StatCard.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';

/**
 * Overview View
 * Displays repository summary, language distribution, and architectural health metrics
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
      container.appendChild(new LoadingState({
        message: 'Analyzing Codebase Architecture...',
        subtext: 'Scanning files, parsing AST symbols, and calculating maintainability index...'
      }).render());
      return container;
    }

    // 2. Error State
    if (this.repositoryState?.error) {
      const container = document.createElement('div');
      container.className = 'view-container';
      container.appendChild(new ErrorState({
        title: 'Failed to Open Repository',
        message: this.repositoryState.error,
        onRetry: this.onOpenRepository
      }).render());
      return container;
    }

    // 3. Unloaded Landing State
    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      return new LandingView({ onOpenRepository: this.onOpenRepository }).render();
    }

    // 4. Active Repository Overview
    const summary = this.repositoryState.summary || {};
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: summary.name || this.repositoryState.repositoryName || 'Repository Overview',
      description: `Path: ${summary.path || this.repositoryState.repositoryPath} • Branch: ${summary.branch || 'main'}`,
      badge: summary.isValidGit ? 'Git Active' : 'Local Directory',
      actions: [
        {
          label: 'Change Repository',
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
      subtext: 'Total source lines',
      icon: '📝'
    }).render());

    statGrid.appendChild(new StatCard({
      label: 'Scanned Files',
      value: totalFiles,
      subtext: `${summary.totalDirectories || 0} directories`,
      icon: '📁'
    }).render());

    statGrid.appendChild(new StatCard({
      label: 'Maintainability',
      value: mi,
      subtext: 'Calculated complexity index',
      icon: '⚡',
      trend: summary.avgMaintainability >= 70 ? '✓ High Health' : '⚠️ Refactor Needed'
    }).render());

    statGrid.appendChild(new StatCard({
      label: 'Languages',
      value: langCount,
      subtext: 'Detected technologies',
      icon: '🌐'
    }).render());

    container.appendChild(statGrid);

    // Languages Breakdown Section
    if (summary.languages && Object.keys(summary.languages).length > 0) {
      const langSection = document.createElement('div');
      langSection.className = 'landing-card';

      const langRows = Object.entries(summary.languages)
        .map(([lang, data]) => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.88rem;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 600; color: var(--text-primary);">${lang}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">(${data.files} files)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="color: var(--text-secondary); font-family: var(--font-mono);">${data.lines.toLocaleString()} lines</span>
              <span style="color: var(--accent-primary); font-weight: 600;">${data.percentage}%</span>
            </div>
          </div>
        `).join('');

      langSection.innerHTML = `
        <div class="landing-card-header">
          <h3 class="landing-card-title">
            <span>📊</span>
            <span>Language Distribution</span>
          </h3>
          <span class="landing-card-badge">Breakdown</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;">
          ${langRows}
        </div>
      `;

      container.appendChild(langSection);
    }

    return container;
  }
}
