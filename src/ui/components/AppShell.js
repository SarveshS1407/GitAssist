import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';

/**
 * AppShell Component
 * Assembles Header, conditional Sidebar, and the dynamic Main Content container
 */
export class AppShell {
  constructor({ router, repositoryState, initialPage = 'overview' }) {
    this.router = router;
    this.repositoryState = repositoryState;
    this.currentPage = initialPage;
    this.element = null;
    this.mainContentEl = null;
    this.sidebarEl = null;

    this.header = new Header({
      repositoryState: this.repositoryState,
      onSearchClick: () => this.router.navigate('search'),
      onSettingsClick: () => alert('Settings panel will be implemented in future step.'),
      onBrandClick: () => this.router.navigate('overview')
    });

    this.sidebar = new Sidebar({
      activePage: initialPage,
      onNavigate: (pageId) => this.router.navigate(pageId)
    });
  }

  updateSidebarVisibility(isLoaded) {
    if (!this.sidebarEl) return;
    if (isLoaded) {
      this.sidebarEl.style.display = 'flex';
    } else {
      this.sidebarEl.style.display = 'none';
    }
  }

  render() {
    const container = document.createElement('div');
    container.className = 'app-shell';

    // 1. Header
    container.appendChild(this.header.render());

    // 2. Body Container (Sidebar + Main Workspace)
    const body = document.createElement('div');
    body.className = 'app-body';

    this.sidebarEl = this.sidebar.render();
    body.appendChild(this.sidebarEl);

    const main = document.createElement('main');
    main.className = 'app-main';
    main.id = 'main-workspace';
    body.appendChild(main);

    container.appendChild(body);

    this.element = container;
    this.mainContentEl = main;

    // Initial sidebar visibility based on state
    if (this.repositoryState) {
      this.updateSidebarVisibility(this.repositoryState.getState().isLoaded);
      this.repositoryState.subscribe((state) => {
        this.updateSidebarVisibility(state.isLoaded);
      });
    }

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
