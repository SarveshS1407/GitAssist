import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';

/**
 * AppShell Component
 * Assembles Header, Sidebar, and the dynamic Main Content container
 */
export class AppShell {
  constructor({ router, repositoryState, initialPage = 'overview' }) {
    this.router = router;
    this.repositoryState = repositoryState;
    this.currentPage = initialPage;
    this.element = null;
    this.mainContentEl = null;

    this.header = new Header({
      repositoryState: this.repositoryState,
      onSearchClick: () => this.router.navigate('search'),
      onSettingsClick: () => alert('Settings panel will be implemented in future step.'),
      onBrandClick: () => this.router.navigate('overview')
    });

    this.sidebar = new Sidebar({
      activePage: initialPage,
      onNavigate: (pageId) => this.router.navigate(pageId),
      onPinToggle: (isPinned) => {
        if (this.bodyEl) {
          this.bodyEl.classList.toggle('sidebar-pinned', isPinned);
        }
      }
    });
  }

  render() {
    const container = document.createElement('div');
    container.className = 'app-shell';

    // 1. Header
    container.appendChild(this.header.render());

    // 2. Body Container (Sidebar + Main Workspace)
    const body = document.createElement('div');
    body.className = 'app-body';
    this.bodyEl = body;

    // Hover Peek Strip (Left Screen Edge Sensor)
    const peekStrip = document.createElement('div');
    peekStrip.className = 'sidebar-peek-strip';
    peekStrip.id = 'sidebar-peek-strip';
    peekStrip.title = 'Hover along left edge to open Navigation Drawer';
    peekStrip.innerHTML = `
      <div class="peek-sensor-handle">
        <span class="peek-dot"></span>
        <span class="peek-dot"></span>
        <span class="peek-dot"></span>
        <span class="peek-label">NAV</span>
      </div>
    `;
    body.appendChild(peekStrip);

    // Backdrop overlay when hover drawer is open
    const backdrop = document.createElement('div');
    backdrop.className = 'sidebar-drawer-backdrop';
    body.appendChild(backdrop);

    const sidebarEl = this.sidebar.render();
    body.appendChild(sidebarEl);

    // Push/Pull Hover Drawer Mechanics
    let closeTimer = null;
    const openDrawer = () => {
      if (this.sidebar.isPinned) return;
      if (closeTimer) clearTimeout(closeTimer);
      sidebarEl.classList.add('is-hover-open');
      backdrop.classList.add('is-active');
      peekStrip.classList.add('is-dormant');
    };

    const closeDrawer = () => {
      if (this.sidebar.isPinned) return;
      closeTimer = setTimeout(() => {
        sidebarEl.classList.remove('is-hover-open');
        backdrop.classList.remove('is-active');
        peekStrip.classList.remove('is-dormant');
      }, 220);
    };

    peekStrip.addEventListener('mouseenter', openDrawer);
    sidebarEl.addEventListener('mouseenter', openDrawer);
    sidebarEl.addEventListener('mouseleave', closeDrawer);
    backdrop.addEventListener('mouseenter', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);

    const main = document.createElement('main');
    main.className = 'app-main';
    main.id = 'main-workspace';
    main.addEventListener('mouseenter', closeDrawer);
    body.appendChild(main);

    container.appendChild(body);

    this.element = container;
    this.mainContentEl = main;

    return container;
  }

  /**
   * Sets content of the main workspace
   * @param {HTMLElement|string} content
   */
  setContent(content) {
    if (!this.mainContentEl) return;
    this.mainContentEl.innerHTML = '';
    if (typeof content === 'string') {
      this.mainContentEl.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.mainContentEl.appendChild(content);
    }
  }

  /**
   * Synchronizes active sidebar selection
   * @param {string} pageId
   */
  setActivePage(pageId) {
    this.currentPage = pageId;
    this.sidebar.setActive(pageId);
  }
}
