/**
 * Sidebar Navigation Component
 * Provides tactical archaeological lenses navigation
 */
export class Sidebar {
  constructor({ activePage = 'overview', onNavigate }) {
    this.activePage = activePage;
    this.onNavigate = onNavigate;
    this.element = null;

    this.sections = [
      {
        title: 'Central Command',
        items: [
          { id: 'overview', label: 'Action Carousel', icon: '◈' }
        ]
      },
      {
        title: 'Structural Lenses',
        items: [
          { id: 'architecture', label: 'Architecture Topology', icon: '🕸️' },
          { id: 'impact', label: 'Impact & Blast Radius', icon: '💥' },
          { id: 'explorer', label: 'Source Explorer', icon: '📁' }
        ]
      },
      {
        title: 'Forensic Lenses',
        items: [
          { id: 'search', label: 'Forensic Code Tracer', icon: '🔍' },
          { id: 'git', label: 'Git Chrono-Strata', icon: '📜' },
          { id: 'analysis', label: 'Drift & Risk Hotspots', icon: '⚡' },
          { id: 'archaeology', label: 'Evolutionary Synthesis', icon: '🏛️' }
        ]
      },
      {
        title: 'Intelligence & Audit',
        items: [
          { id: 'documentation', label: 'Subsystem Docs', icon: '📖' },
          { id: 'review', label: 'Heuristic Review', icon: '🛡️' },
          { id: 'ai', label: 'AI Field Dossier', icon: '🤖' }
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
    sidebar.className = 'app-sidebar';

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
