import { RepositoryBadge } from './RepositoryBadge.js';

/**
 * Header Component
 * Top-level application bar containing branding, active repository badge, global search trigger, and settings
 */
export class Header {
  constructor({ repositoryState, onSearchClick, onSettingsClick, onBrandClick }) {
    this.repositoryState = repositoryState;
    this.onSearchClick = onSearchClick;
    this.onSettingsClick = onSettingsClick;
    this.onBrandClick = onBrandClick;
    this.element = null;
    this.badgeContainer = null;
  }

  updateBadge(state) {
    if (!this.badgeContainer) return;
    this.badgeContainer.innerHTML = '';
    const badge = new RepositoryBadge({
      name: state.repositoryName,
      branch: state.branch || 'main',
      isGit: true
    });
    this.badgeContainer.appendChild(badge.render());
  }

  render() {
    const header = document.createElement('header');
    header.className = 'app-header';

    header.innerHTML = `
      <div class="header-left">
        <a class="app-brand" id="brand-link" title="GitAssist Home">
          <span class="brand-icon">⚡</span>
          <span>GitAssist</span>
          <span class="brand-badge">Local-First</span>
        </a>
        <div id="header-repo-badge-container"></div>
      </div>

      <div class="header-center">
        <div class="header-search-bar" id="global-search-bar" title="Quick Search">
          <span>🔍</span>
          <span>Search symbols, files, or commits...</span>
          <span class="search-shortcut">⌘K</span>
        </div>
      </div>

      <div class="header-right">
        <button class="header-btn" id="btn-export-report" title="Export Forensic Audit Report (Markdown)">
          <span>📄</span>
          <span>Audit Report</span>
        </button>
        <button class="header-btn" id="btn-settings" title="Settings & Configuration">
          <span>⚙️</span>
          <span>Settings</span>
        </button>
      </div>
    `;

    this.badgeContainer = header.querySelector('#header-repo-badge-container');

    if (this.repositoryState) {
      this.repositoryState.subscribe((state) => {
        this.updateBadge(state);
      });
    }

    header.querySelector('#brand-link').addEventListener('click', (e) => {
      e.preventDefault();
      if (this.onBrandClick) this.onBrandClick();
    });

    header.querySelector('#global-search-bar').addEventListener('click', () => {
      if (this.onSearchClick) this.onSearchClick();
    });

    header.querySelector('#btn-settings').addEventListener('click', () => {
      if (this.onSettingsClick) this.onSettingsClick();
    });

    const exportBtn = header.querySelector('#btn-export-report');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (!this.repositoryState || !this.repositoryState.isLoaded) {
          alert('Please open a repository before exporting an audit report.');
          return;
        }
        window.open('/api/report/export?format=markdown', '_blank');
      });
    }

    this.element = header;
    return header;
  }
}
