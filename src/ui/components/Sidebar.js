/**
 * Sidebar Navigation Component
 * Provides navigation between the 8 primary architectural views
 */
export class Sidebar {
  constructor({ activePage = 'overview', onNavigate }) {
    this.activePage = activePage;
    this.onNavigate = onNavigate;
    this.element = null;

    this.navItems = [
      { id: 'overview', label: 'Overview', icon: '📊' },
      { id: 'explorer', label: 'Explorer', icon: '📁' },
      { id: 'architecture', label: 'Architecture', icon: '🏛️' },
      { id: 'git', label: 'Git', icon: '📜' },
      { id: 'search', label: 'Search', icon: '🔍' },
      { id: 'contributors', label: 'Contributors', icon: '👥' },
      { id: 'analysis', label: 'Analysis', icon: '⚡' },
      { id: 'ai', label: 'AI', icon: '🤖' }
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

    const navListHtml = this.navItems.map(item => `
      <li>
        <a class="nav-item ${item.id === this.activePage ? 'active' : ''}" data-page="${item.id}">
          <span class="nav-icon">${item.icon}</span>
          <span>${item.label}</span>
        </a>
      </li>
    `).join('');

    sidebar.innerHTML = `
      <div class="sidebar-nav-container">
        <div class="sidebar-section-title">Navigation</div>
        <ul class="sidebar-nav-list">
          ${navListHtml}
        </ul>
      </div>

      <div class="sidebar-footer">
        <span class="system-status-indicator">
          <span class="status-dot"></span>
          <span>Local Engine</span>
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
