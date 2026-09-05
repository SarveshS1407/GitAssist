/**
 * Sidebar Navigation Component
 * Provides tactical archaeological lenses navigation
 */
export class Sidebar {
  constructor({ activePage = 'overview', onNavigate, onPinToggle }) {
    this.activePage = activePage;
    this.onNavigate = onNavigate;
    this.onPinToggle = onPinToggle;
    this.isPinned = false; // Default: push/pull hover drawer
    this.element = null;

    this.sections = [
      {
        title: 'Central Command',
        items: [
          { id: 'overview', label: 'Action Carousel', icon: '◈' },
          { id: 'explorer', label: 'Source Explorer', icon: '📁' },
          { id: 'search', label: 'Code Search', icon: '🔍' }
        ]
      },
      {
        title: 'Architecture & Graph',
        items: [
          { id: 'architecture', label: 'Architecture Topology', icon: '🕸️' },
          { id: 'impact', label: 'Impact & Blast Radius', icon: '💥' },
          { id: 'features', label: 'Feature Mapping', icon: '🗺️' }
        ]
      },
      {
        title: 'Forensic Lineage',
        items: [
          { id: 'git', label: 'Git Chrono-Strata', icon: '📜' },
          { id: 'analysis', label: 'Drift & Hotspots', icon: '⚡' },
          { id: 'archaeology', label: 'Evolutionary Synthesis', icon: '🏛️' },
          { id: 'bugs', label: 'Bug Archaeology', icon: '🐛' }
        ]
      },
      {
        title: 'Health & Quality Audit',
        items: [
          { id: 'risk', label: 'Risk Map', icon: '⚡' },
          { id: 'tests', label: 'Test Intelligence', icon: '🧪' },
          { id: 'deadcode', label: 'Dead Code Signals', icon: '🍂' },
          { id: 'manifests', label: 'Dependency Health', icon: '📦' },
          { id: 'duplication', label: 'Code Duplication', icon: '👯' },
          { id: 'security', label: 'Security Audit', icon: '🔒' },
          { id: 'review', label: 'Heuristic Review', icon: '🛡️' }
        ]
      },
      {
        title: 'Intelligence & Output',
        items: [
          { id: 'documentation', label: 'Subsystem Docs', icon: '📖' },
          { id: 'contributors', label: 'Contributors', icon: '👥' },
          { id: 'ai', label: 'Codebase Q&A', icon: '🤖' }
        ]
      }
    ];
  }

  setActive(pageId) {
    this.activePage = pageId;
    if (!this.element) return;

    const items = this.element.querySelectorAll('.nav-item');
    items.forEach(el => {
      if (el.dataset.page === pageId) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  render() {
    const sidebar = document.createElement('aside');
    sidebar.className = `app-sidebar ${this.isPinned ? 'is-pinned' : ''}`;
    sidebar.id = 'app-sidebar-drawer';

    const sectionsHtml = this.sections.map(sec => `
      <div class="sidebar-section">
        <div class="sidebar-section-title">${sec.title}</div>
        <ul class="sidebar-nav-list">
          ${sec.items.map(item => `
            <li>
              <a class="nav-item ${item.id === this.activePage ? 'active' : ''}" data-page="${item.id}">
                <span class="nav-icon">${item.icon}</span>
                <span>${item.label}</span>
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('');

    sidebar.innerHTML = `
      <div class="sidebar-header-bar">
        <div class="sidebar-brand-mini">
          <span class="brand-glyph">⚡</span>
          <span class="brand-text">TACTICAL LENSES</span>
        </div>
        <button type="button" class="btn-sidebar-pin ${this.isPinned ? 'active' : ''}" id="btn-sidebar-pin" title="${this.isPinned ? 'Unpin (Auto-collapse on exit)' : 'Pin Sidebar (Keep expanded)'}">
          ${this.isPinned ? '📌' : '📍'}
        </button>
      </div>

      <div class="sidebar-nav-container">
        ${sectionsHtml}
      </div>

      <div class="sidebar-footer">
        <span class="system-status-indicator">
          <span class="status-dot"></span>
          <span>HOLOMAP READY</span>
        </span>
        <span>v0.1.0</span>
      </div>
    `;

    // Pin toggle handler
    const pinBtn = sidebar.querySelector('#btn-sidebar-pin');
    pinBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.isPinned = !this.isPinned;
      sidebar.classList.toggle('is-pinned', this.isPinned);
      pinBtn.classList.toggle('active', this.isPinned);
      pinBtn.innerHTML = this.isPinned ? '📌' : '📍';
      pinBtn.title = this.isPinned ? 'Unpin (Auto-collapse on exit)' : 'Pin Sidebar (Keep expanded)';
      if (this.onPinToggle) this.onPinToggle(this.isPinned);
    });

    sidebar.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = item.dataset.page;
        this.setActive(pageId);
        if (this.onNavigate) this.onNavigate(pageId);
      });
    });

    this.element = sidebar;
    return sidebar;
  }
}
