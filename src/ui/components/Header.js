/**
 * Header Component
 * Top-level application bar containing branding, global search trigger, and utility actions
 */
export class Header {
  constructor({ onSearchClick, onSettingsClick, onBrandClick }) {
    this.onSearchClick = onSearchClick;
    this.onSettingsClick = onSettingsClick;
    this.onBrandClick = onBrandClick;
    this.element = null;
  }

  render() {
    const header = document.createElement('header');
    header.className = 'app-header';

    header.innerHTML = `
      <div class="header-left">
        <a class="app-brand" id="brand-link" title="Codebase Archaeologist Home">
          <span class="brand-icon">🏛️</span>
          <span>Codebase Archaeologist</span>
          <span class="brand-badge">Local-First</span>
        </a>
      </div>

      <div class="header-center">
        <div class="header-search-bar" id="global-search-bar" title="Quick Search">
          <span>🔍</span>
          <span>Search symbols, files, or commits...</span>
          <span class="search-shortcut">⌘K</span>
        </div>
      </div>

      <div class="header-right">
        <button class="header-btn" id="btn-settings" title="Settings & Configuration">
          <span>⚙️</span>
          <span>Settings</span>
        </button>
      </div>
    `;

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

    this.element = header;
    return header;
  }
}
